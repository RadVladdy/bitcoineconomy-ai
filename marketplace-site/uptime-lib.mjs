// uptime-lib.mjs — the trust layer's rolling uptime history (Phase 2, first slice).
//
// Design rule (2026-07-23, from the invinoveritas teardown — see the project's
// trust-system design input doc): NEVER publish a bare score. The uptime doc
// carries the raw per-run observations it is derived from, the exact formula,
// and an inline how_to_check — so any agent recomputes the number instead of
// trusting it. Denominators are explicit: an unprobeable observation
// (tor-only / unroutable) is knowledge about reachability from THIS
// infrastructure, not about the service being down, so it never enters the
// uptime denominator.
//
// The history also covers OURSELVES (self:* targets) — the prober that
// publishes its own downtime in the same table is believable about everyone
// else's ("no green by assertion").

export const UPTIME_SCHEMA_VERSION = 1;
export const UPTIME_WINDOW_RUNS = 120; // ≈30 days at the 6-hourly cron

const PROBEABLE = new Set(['alive', 'unreachable']);

// Probe our own public agent surfaces the same way an agent consumes them.
// Each probe re-enters the Worker via its public hostname — that is the point:
// we measure what a caller experiences, not internal health.
export async function probeSelf(fetchFn, base, { timeoutMs = 8000 } = {}) {
  const checks = [
    {
      key: 'self:directory.json',
      run: async (signal) => {
        const res = await fetchFn(base + '/directory.json', { signal, headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const body = await res.json();
        if (!Array.isArray(body?.entries) || body.entries.length === 0) throw new Error('no entries');
        return res.status;
      },
    },
    // Worker-served routes (/live/*, /mcp) cannot be probed from inside this
    // Worker — Cloudflare's recursion guard blocks a Worker fetching routes it
    // serves itself (observed on the first live run, 2026-07-23: false
    // "unreachable"). Honesty rule: don't report a route as down when the
    // prober simply cannot see it. We still attempt the fetch (self-healing if
    // the platform ever allows it); failure maps to unprobeable-from-worker,
    // excluded from uptime denominators. Their TRUE external verification runs
    // nightly from the box (marketplace-anchor → anchors/index.json
    // external_probe block).
    {
      key: 'self:live/snapshot.json',
      unprobeableOnFail: true,
      run: async (signal) => {
        const res = await fetchFn(base + '/live/snapshot.json', { signal, headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await res.json();
        return res.status;
      },
    },
    {
      key: 'self:mcp',
      unprobeableOnFail: true,
      run: async (signal) => {
        const res = await fetchFn(base + '/mcp', {
          method: 'POST',
          signal,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const body = await res.json();
        if (!body?.result?.tools?.length) throw new Error('no tools');
        return res.status;
      },
    },
  ];
  const out = [];
  for (const c of checks) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort('timeout'), timeoutMs);
    const t0 = Date.now();
    try {
      const httpStatus = await c.run(ctrl.signal);
      out.push({ key: c.key, status: 'alive', latency_ms: Math.round(Date.now() - t0), http_status: httpStatus });
    } catch {
      out.push({ key: c.key, status: c.unprobeableOnFail ? 'unprobeable-from-worker' : 'unreachable' });
    } finally {
      clearTimeout(timer);
    }
  }
  return out;
}

// Fold one cron run's probe outcomes into the rolling history (returns a new
// history object, capped to the window). Targets: announced Routstr providers
// (by d-tag), announced kind-38555 services (by slug), and our own surfaces.
export function appendRun(history, snapshot, selfProbes, { at, cap = UPTIME_WINDOW_RUNS } = {}) {
  // History sanitation (permanent): worker-served self routes can never be
  // legitimately 'unreachable' from inside this Worker (deterministic platform
  // recursion guard) — the first live run (2026-07-23) recorded exactly that
  // false negative before the guard was understood. Rewrite to the honest
  // status wherever it appears, so the stored history self-heals.
  const WORKER_SELF = ['self:live/snapshot.json', 'self:mcp'];
  for (const run of history?.runs ?? []) {
    for (const k of WORKER_SELF) {
      if (run.targets?.[k] === 'unreachable') run.targets[k] = 'unprobeable-from-worker';
    }
  }
  const targets = {};
  for (const p of snapshot?.modules?.routstr?.providers ?? []) {
    if (p.status) targets['routstr:' + p.d] = p.status;
  }
  // Announced-service slugs are already namespaced by the snapshot shaper
  // ("announced:{d}") — use them as-is.
  for (const s of snapshot?.modules?.announced?.services ?? []) {
    if (s.status && s.slug) targets[s.slug] = s.status;
  }
  for (const sp of selfProbes ?? []) targets[sp.key] = sp.status;
  const runs = [...(history?.runs ?? []), { at, targets }].slice(-cap);
  return { schema_version: UPTIME_SCHEMA_VERSION, runs };
}

// Derive the per-target stats from the raw runs. The runs themselves are
// included in the published doc — the stats are a convenience, not the record.
export function buildUptimeDoc(history, { generatedAt } = {}) {
  const runs = history?.runs ?? [];
  const targets = {};
  for (const run of runs) {
    for (const [key, status] of Object.entries(run.targets ?? {})) {
      const t = (targets[key] ??= { observations: 0, alive: 0, unreachable: 0, unprobeable: 0 });
      t.observations += 1;
      if (status === 'alive') { t.alive += 1; t.last_alive_at = run.at; }
      else if (status === 'unreachable') t.unreachable += 1;
      else t.unprobeable += 1;
      t.last_status = status;
      t.last_seen_at = run.at;
    }
  }
  for (const t of Object.values(targets)) {
    const denom = t.alive + t.unreachable;
    t.uptime_pct = denom > 0 ? Math.round((t.alive / denom) * 1000) / 10 : null;
    t.uptime_denominator = denom;
  }
  return {
    $schema_note:
      'Rolling uptime history for every target the marketplace probes — the Nostr-announced services AND our own '
      + 'agent surfaces (self:* rows; the prober grades itself by the same bar). RECOMPUTABLE, NOT A SCORE: the '
      + 'raw per-run observations this is derived from are the runs[] array below — recompute any stat from them '
      + 'rather than trusting it. Dead ≠ delisted; status reflects probe moments only. Part of '
      + 'https://marketplace.bitcoineconomy.ai.',
    schema_version: UPTIME_SCHEMA_VERSION,
    generated_at: generatedAt,
    cadence: '6-hourly Worker cron (17 */6 * * * UTC); each run probes every target once',
    window: { max_runs: UPTIME_WINDOW_RUNS, runs_held: runs.length, approx_days_at_capacity: 30 },
    formula:
      'uptime_pct = alive / (alive + unreachable), rounded to 0.1%. Unprobeable observations '
      + '(unverified-tor-only, unroutable) say nothing about the service being up — they are excluded from the '
      + 'denominator and counted separately as unprobeable. uptime_denominator states each target’s denominator; '
      + 'do not compare percentages across very different denominators.',
    how_to_check:
      'Recompute from runs[]: each run is {at, targets: {key: status}}. For a target, count status==="alive" and '
      + 'status==="unreachable" across runs and apply the formula. The stats in targets{} carry no information '
      + 'beyond the runs.',
    self_probe_note:
      'self:* rows are probed by the Worker via its own public hostname. Worker-served routes (self:live/*, '
      + 'self:mcp) cannot be probed from inside the Worker (platform recursion guard) — they appear as '
      + 'unprobeable-from-worker, never as down. Their genuinely external verification runs nightly and is '
      + 'recorded in the anchor records at /anchors/index.json (external_probe).',
    anchors:
      'Snapshot digests are signed to public Nostr relays and stamped into Bitcoin via OpenTimestamps on a nightly '
      + 'anchor run — the anchor records live at /anchors/ (and in the public site repo), so this history is '
      + 'tamper-evident: we cannot rewrite the past without breaking the anchors. See /anchors/index.json.',
    targets,
    runs,
  };
}
