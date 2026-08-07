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
export const UPTIME_WINDOW_RUNS = 120; // ≈30 days at the 6-hourly PROBE cron
// The window is counted in probe RUNS, not in hours, and only the 6-hourly full
// pass appends one. The hourly relay refresh deliberately does not — if it did,
// 120 runs would silently mean 5 days while this doc kept publishing 30.

const PROBEABLE = new Set(['alive', 'unreachable']);

// The self-probe definitions live at module scope so the history-sanitation
// list below can be DERIVED from them rather than retyped. Retyping is what
// broke: `unprobeableOnFail` was added to self:directory.json on 2026-08-06 and
// the sanitation list — a separate hardcoded array two functions away — still
// named only the other two, so the forward path was honest while the stored
// history kept six false `unreachable` observations and the published doc kept
// deriving an uptime percentage from them. A list that must agree with another
// list, and is maintained by hand, is one edit away from disagreeing.
const SELF_CHECKS = [
    {
      key: 'self:directory.json',
      // unprobeableOnFail added 2026-08-06, and it is honesty rather than a
      // cover-up: under a Custom Domain there is NOTHING behind this hostname
      // but the Worker itself, so a self-fetch of any path on it cannot
      // succeed. Reporting `unreachable` was a false claim about a route that
      // answers externally in ~0.17s.
      //
      // Why it worked for 53 runs and then stopped: until 2026-08-05 the
      // hostname was a ZONE ROUTE, and a Worker's subrequest to its own zone
      // route falls through to whatever sits behind it — here, the shadowed
      // Pages project that was still building on every push. So the pre-08-05
      // successes were a *different, stale copy* answering, which is its own
      // warning: this probe was green while reading a document that was not
      // the one we serve. The zone route became a Custom Domain and the Pages
      // project was deleted on 2026-08-05 (~12:2x MDT); the first failure is
      // 2026-08-05T18:18:57Z, inside that window.
      //
      // The real verification is EXTERNAL, from the box: marketplace-anchor's
      // nightly external_probe now covers /directory.json too, so this row has
      // a watcher that can actually see it rather than merely going quiet.
      unprobeableOnFail: true,
      run: async (signal, fetchFn, base) => {
        const res = await fetchFn(base + '/directory.json', { signal, headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const body = await res.json();
        if (!Array.isArray(body?.entries) || body.entries.length === 0) throw new Error('no entries');
        return res.status;
      },
    },
    // NOTHING on this hostname can be probed from inside this Worker.
    //
    // The explanation here used to say "Cloudflare's recursion guard blocks a
    // Worker fetching routes it serves itself". That was a reasonable guess in
    // 2026-07-23 and it is wrong, so it is corrected rather than left to be
    // re-derived: the hostname is a Custom Domain, the Worker IS the only thing
    // behind it, and a self-fetch has nowhere else to land. The reason /live/*
    // and /mcp failed from the start while /directory.json appeared to work is
    // not recursion — it is that the zone route then in place fell through to a
    // shadow Pages copy, which held the static file and not the computed routes.
    //
    // Honesty rule, unchanged and now applied to all three: don't report a route
    // as down when the prober cannot see it. We still attempt the fetch (self-
    // healing if the platform ever allows it); failure maps to
    // unprobeable-from-worker and is excluded from uptime denominators. TRUE
    // external verification runs nightly from the box (marketplace-anchor →
    // anchors/index.json external_probe block).
    {
      key: 'self:live/snapshot.json',
      unprobeableOnFail: true,
      run: async (signal, fetchFn, base) => {
        const res = await fetchFn(base + '/live/snapshot.json', { signal, headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await res.json();
        return res.status;
      },
    },
    {
      key: 'self:mcp',
      unprobeableOnFail: true,
      run: async (signal, fetchFn, base) => {
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

// Every self:* key whose failure means "the prober cannot see it", not "it is
// down". DERIVED from SELF_CHECKS so the history-sanitation pass in appendRun()
// and the forward-facing probe can never disagree about which rows those are.
const WORKER_SELF = SELF_CHECKS.filter((c) => c.unprobeableOnFail).map((c) => c.key);

// The dated, public record of every historical observation this sanitation has
// reclassified. Published in the uptime doc so the rewrite is visible rather
// than silent: a correction a reader cannot see is indistinguishable from the
// tampering the anchors exist to detect.
export const UPTIME_CORRECTIONS = [
  {
    date: '2026-08-07',
    target: 'self:directory.json',
    affected_runs:
      'All 59 observations, 2026-07-23T18:18Z → 2026-08-07T00:18Z — 53 recorded `alive`, 6 recorded `unreachable`.',
    from: 'alive (53) / unreachable (6)',
    to: 'unprobeable-from-worker (59)',
    reason:
      'Neither status was evidence about this route, and correcting only one of them would have been worse than '
      + 'correcting neither. marketplace.bitcoineconomy.ai became a Custom Domain on 2026-08-05, after which this '
      + 'Worker is the only thing behind the hostname and a self-fetch of /directory.json has nowhere to land — so '
      + 'the 6 failures say the prober cannot see the route, not that the route is down; it answered externally in '
      + '~0.17s throughout. The 53 earlier successes are not evidence either: until 2026-08-05 the hostname was a '
      + 'zone route and the self-fetch fell through to a shadowed Cloudflare Pages copy, so those runs read a stale '
      + 'document that was not the one we serve. Correcting only the 6 would have moved the published figure from '
      + '89.8% to 100% — replacing a number that was too low with one that was too high, derived from readings of '
      + 'the wrong document. There is no probeable observation of a self:* route from inside this Worker, so the '
      + 'honest value is null on a denominator of 0, which is what self_probe_note already asserts.',
    root_cause:
      'The forward-facing probe was corrected on 2026-08-06 but the history-sanitation list was a second, '
      + 'hand-maintained copy of the same set two functions away, and it was not updated. It is now derived from '
      + 'the probe definitions so the two cannot disagree again.',
    disclosure:
      'Disclosed rather than done quietly, and fully reversible: every affected run carries a `corrected` map in '
      + 'runs[] holding that run’s ORIGINAL status for each rewritten key, so the pre-correction history can be '
      + 'reconstructed exactly from the published document.',
  },
];

// Probe our own public agent surfaces the same way an agent consumes them.
// Each probe re-enters the Worker via its public hostname — that is the point:
// we measure what a caller experiences, not internal health.
export async function probeSelf(fetchFn, base, { timeoutMs = 8000 } = {}) {
  const checks = SELF_CHECKS;
  const out = [];
  for (const c of checks) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort('timeout'), timeoutMs);
    const t0 = Date.now();
    try {
      const httpStatus = await c.run(ctrl.signal, fetchFn, base);
      out.push({ key: c.key, status: 'alive', latency_ms: Math.round(Date.now() - t0), http_status: httpStatus });
    } catch (err) {
      // Keep the reason. This was a bare `catch {}`, and discarding the error is
      // the single thing that made the 2026-08-05 self-probe regression opaque
      // enough to need three passes to diagnose: the row said "unreachable" and
      // nothing anywhere recorded WHY. A probe that cannot say why it failed is
      // a probe you have to reverse-engineer.
      out.push({
        key: c.key,
        status: c.unprobeableOnFail ? 'unprobeable-from-worker' : 'unreachable',
        error: String(err?.message || err || 'unknown').slice(0, 200),
      });
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
  // History sanitation (permanent): a self:* route that the prober marks
  // unprobeableOnFail can never be legitimately 'unreachable' from inside this
  // Worker — marketplace.bitcoineconomy.ai is a Custom Domain, so this Worker is
  // the only thing behind it and a self-fetch has nowhere else to land. Rewrite
  // to the honest status wherever it appears, so the stored history self-heals.
  //
  // DERIVED from SELF_CHECKS, never retyped — see the note there. The list was
  // hardcoded as ['self:live/snapshot.json', 'self:mcp'] and did not gain
  // self:directory.json when that probe did on 2026-08-06, so six false
  // 'unreachable' observations (2026-08-05T18:18Z → 2026-08-07T00:18Z) stayed in
  // the stored history and the published doc kept deriving 89.8% uptime from
  // them — for a route that answers externally in ~0.17s, on a page whose whole
  // pitch is "recompute our numbers yourself".
  //
  // ⚠ AND IT REWRITES 'alive' TOO, WHICH IS THE HALF THAT IS EASY TO MISS.
  // Correcting only the false 'unreachable' rows moves self:directory.json from
  // 89.8% to 100% — a number derived from 53 pre-2026-08-05 'alive' readings
  // that this file's own note already calls worthless: back then the hostname
  // was a zone route and the self-fetch fell through to a shadowed Pages copy,
  // so those runs measured a stale document that was not the one we serve. A
  // reading of the wrong document is not evidence about the right one. Fixing
  // one direction and leaving the other would have replaced a number that was
  // too low with a number that was too high and looked flattering, which is the
  // worse of the two failures on a trust surface. There is no probeable
  // observation of a self:* route from inside this Worker, ever — so the honest
  // published value is uptime_pct: null on a denominator of 0, which is exactly
  // what self_probe_note has been asserting all along.
  const HONEST = 'unprobeable-from-worker';
  for (const run of history?.runs ?? []) {
    for (const k of WORKER_SELF) {
      const was = run.targets?.[k];
      if (was !== undefined && was !== HONEST) {
        run.targets[k] = HONEST;
        (run.corrected ??= {})[k] = was;
      }
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
    cadence: 'Probes run on the 6-hourly Worker cron (17 */6 * * * UTC); each run probes every target once. The directory itself re-reads the relays hourly (47 * * * * UTC), but that pass does not probe and appends no run here — so this window is 120 probe runs, ≈30 days.',
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
      'self:* rows are attempted by the Worker against its own public hostname, and none of them can succeed: '
      + 'marketplace.bitcoineconomy.ai is a Custom Domain, so this Worker is the only thing behind it and a '
      + 'self-fetch has nowhere else to land. All self:* rows therefore report unprobeable-from-worker and are '
      + 'excluded from every uptime denominator — never counted as down. (Before 2026-08-05 the hostname was a '
      + 'zone route and self:directory.json appeared alive, because the fetch fell through to a shadowed Pages '
      + 'copy holding the static file; that copy is gone, and its readings were of a stale document anyway.) '
      + 'The genuinely external verification runs nightly from outside Cloudflare and is recorded in the anchor '
      + 'records at /anchors/index.json (external_probe), which covers /directory.json as of 2026-08-07 — the '
      + 'route was added to the prober on 2026-08-06 but after that day’s run, and anchor records are '
      + 'append-only, so no record before 2026-08-07 carries it.',
    anchors:
      'A digest of this document is signed to public Nostr relays and stamped into Bitcoin via OpenTimestamps on a '
      + 'nightly anchor run — the anchor records live at /anchors/ (and in the public site repo). What that buys is '
      + 'precise, and worth stating precisely: it makes a change to what we published on a given night DETECTABLE by '
      + 'anyone holding the earlier anchor, not impossible. We can still edit this document; we cannot do it '
      + 'invisibly. Every correction we make to a past observation is therefore declared in corrections[] below, so '
      + 'a reader diffing against an old anchor finds a disclosed correction rather than an unexplained difference. '
      + 'Verify with `ots info <event_id>.evt.ots`, which lists the Bitcoin block heights with no node required. '
      + 'See /anchors/index.json.',
    corrections: UPTIME_CORRECTIONS,
    targets,
    runs,
  };
}
