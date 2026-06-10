// snapshot-lib.mjs — shared relay-query + snapshot-shape logic.
//
// Used by BOTH:
//   sample-relays.mjs  (local CLI; Node's built-in WebSocket)
//   worker.js          (Cloudflare Worker cron; fetch-Upgrade client WebSocket)
// so the committed fallback snapshot and the cron-written KV snapshot always
// share one schema. Change the shape here, never in the consumers.

export const RELAYS = [
  'wss://relay.nostr.band',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
];

const THIRTY_DAYS = 30 * 24 * 60 * 60;

export function makeFilters(nowSec) {
  return {
    routstr: { kinds: [38421], limit: 500 },
    cashu: { kinds: [38172], limit: 500 },
    fedimint: { kinds: [38173], limit: 500 },
    reviews: { kinds: [38000], limit: 500 },
    handlers: { kinds: [31990], limit: 500 },
    dvmjobs: { kinds: Array.from({ length: 1000 }, (_, i) => 5000 + i), since: nowSec - THIRTY_DAYS, limit: 1000 },
  };
}

function tag(ev, name) {
  return ev.tags.filter((t) => t[0] === name).map((t) => t[1]);
}

// connectFn: async (url) => an OPEN WHATWG-style WebSocket (send/addEventListener ready).
export async function queryRelay(connectFn, url, filters, { timeoutMs = 25000 } = {}) {
  let ws;
  try {
    ws = await connectFn(url);
  } catch (e) {
    return { url, status: 'connect-error: ' + (e?.message ?? e), events: [], notices: [], unfinished: Object.keys(filters) };
  }
  return new Promise((resolve) => {
    const events = new Map();
    const pending = new Set(Object.keys(filters));
    const notices = [];
    let settled = false;

    const finish = (status) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      resolve({ url, status, events: [...events.values()], notices, unfinished: [...pending] });
    };
    const timer = setTimeout(() => finish('timeout'), timeoutMs);

    ws.addEventListener('message', (msg) => {
      let data;
      try { data = JSON.parse(msg.data); } catch { return; }
      const [type, subName, payload] = data;
      if (type === 'EVENT' && payload?.id && !events.has(payload.id)) {
        events.set(payload.id, { subName, event: payload });
      } else if (type === 'EOSE' || type === 'CLOSED') {
        if (type === 'CLOSED') notices.push(`CLOSED ${subName}: ${payload}`);
        try { ws.send(JSON.stringify(['CLOSE', subName])); } catch {}
        pending.delete(subName);
        if (pending.size === 0) finish('ok');
      } else if (type === 'NOTICE') {
        notices.push(String(subName));
      }
    });
    ws.addEventListener('error', () => finish('ws-error'));
    ws.addEventListener('close', () => finish(settled ? 'ok' : 'closed-early'));

    for (const [name, filter] of Object.entries(filters)) {
      ws.send(JSON.stringify(['REQ', name, filter]));
    }
  });
}

// Replaceable-event dedup: keep newest per (kind, pubkey, d-tag).
function dedupeReplaceable(events) {
  const byKey = new Map();
  for (const ev of events) {
    const key = `${ev.kind}:${ev.pubkey}:${tag(ev, 'd')[0] ?? ''}`;
    const prev = byKey.get(key);
    if (!prev || ev.created_at > prev.created_at) byKey.set(key, ev);
  }
  return [...byKey.values()];
}

function parseContentName(ev) {
  try {
    const c = JSON.parse(ev.content);
    return c.name || c.title || undefined;
  } catch { return undefined; }
}

export function buildSnapshot(perRelayResults, { source, generatedAt }) {
  const bySub = {};
  const seenIds = new Set();
  for (const r of perRelayResults) {
    for (const { subName, event } of r.events) {
      if (seenIds.has(event.id)) continue;
      seenIds.add(event.id);
      (bySub[subName] ??= []).push(event);
    }
  }

  const routstr = dedupeReplaceable(bySub.routstr ?? []);
  const cashu = dedupeReplaceable(bySub.cashu ?? []);
  const fedimint = dedupeReplaceable(bySub.fedimint ?? []);
  const handlers = dedupeReplaceable(bySub.handlers ?? []);
  const reviews = bySub.reviews ?? [];
  const dvmjobs = bySub.dvmjobs ?? [];

  const dvmByKind = {};
  for (const ev of dvmjobs) dvmByKind[ev.kind] = (dvmByKind[ev.kind] ?? 0) + 1;

  const reviewsByTargetKind = {};
  for (const ev of reviews) {
    const k = tag(ev, 'k')[0] ?? tag(ev, 'a')[0]?.split(':')[0] ?? 'untagged';
    reviewsByTargetKind[k] = (reviewsByTargetKind[k] ?? 0) + 1;
  }

  return {
    generated_at: generatedAt,
    source,
    provenance: 'live-from-relay',
    relays: perRelayResults.map((r) => ({ url: r.url, status: r.status, unfinished: r.unfinished })),
    modules: {
      routstr: {
        kind: 38421,
        count: routstr.length,
        providers: routstr.map((ev) => ({
          name: parseContentName(ev),
          d: tag(ev, 'd')[0],
          urls: tag(ev, 'u'),
          mints: tag(ev, 'mint'),
          version: tag(ev, 'version')[0],
          pubkey: ev.pubkey,
          updated_at: ev.created_at,
        })).sort((a, b) => b.updated_at - a.updated_at),
      },
      mints: {
        kinds: [38172, 38173],
        cashu_count: cashu.length,
        fedimint_count: fedimint.length,
        cashu: cashu.map((ev) => ({
          url: tag(ev, 'u')[0],
          d: tag(ev, 'd')[0],
          nuts: tag(ev, 'nuts')[0],
          network: tag(ev, 'n')[0],
          pubkey: ev.pubkey,
          updated_at: ev.created_at,
        })).sort((a, b) => b.updated_at - a.updated_at),
        fedimint: fedimint.map((ev) => ({
          invite: tag(ev, 'u')[0]?.slice(0, 60),
          d: tag(ev, 'd')[0],
          modules: tag(ev, 'modules')[0],
          network: tag(ev, 'n')[0],
          pubkey: ev.pubkey,
          updated_at: ev.created_at,
        })).sort((a, b) => b.updated_at - a.updated_at),
      },
      reviews: { kind: 38000, count: reviews.length, by_target_kind: reviewsByTargetKind },
      handlers: { kind: 31990, count: handlers.length },
      dvm_jobs_30d: {
        kinds_sampled: '5000-5999',
        window_days: 30,
        total: dvmjobs.length,
        by_kind: Object.fromEntries(Object.entries(dvmByKind).sort((a, b) => b[1] - a[1])),
      },
    },
  };
}
