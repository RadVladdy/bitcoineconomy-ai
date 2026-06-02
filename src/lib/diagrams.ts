// House-style inline SVG / HTML diagrams, returned as HTML strings so they can
// be injected at precise points inside rendered article HTML (placeholders
// `<div data-diagram="NAME"></div>` are inserted during the port).
//
// Palette: near-black #0E0E0E bg, off-white #F5F1E8, Bitcoin-orange #F7931A
// (Bitcoin / sovereign), slate-grey #7A8290 (incumbent / legacy).
// Every diagram is a <figure> with a <title>/<figcaption> stating its claim;
// data-bearing diagrams (matrix, timeline, BPI, bridge) also carry a table.

const C = { bg: '#0E0E0E', off: '#F5F1E8', orange: '#F7931A', slate: '#7A8290' };

function fig(svg: string, caption: string, extra = ''): string {
  return `<figure class="diagram">${svg}<figcaption>${caption}</figcaption>${extra}</figure>`;
}

/* 1 — Three-layer Stack + cross-cutting constructs */
export function stackDiagram(): string {
  // Three stacked layers, L3 on top down to L1 at the base (the foundation).
  const layers = [
    { l: 'L3', t: 'Cashu / Fedimint', s: 'bearer ecash · scoped mint trust' },
    { l: 'L2', t: 'Lightning', s: 'machine-tempo payments · sub-cent fees' },
    { l: 'L1', t: 'Bitcoin settlement &amp; hard reserve', s: 'counterparty-free · slow · absolute' },
  ];
  // Cross-cutting constructs — not layers; they run across all three.
  const cross = [
    { t: 'Integration primitives', s: 'L402 · NWC · MCP', mono: true },
    { t: 'Wallet architectures', s: 'deployed agent patterns', mono: false },
    { t: 'Security model', s: 'remote signer · macaroons', mono: false },
  ];
  const W = 720, rowH = 64, gap = 12, top = 58;
  const x = 96, w = W - x - 96;
  const axisX = W - 52;
  let rows = '';
  layers.forEach((row, i) => {
    const y = top + i * (rowH + gap);
    rows += `<rect x="${x}" y="${y}" width="${w}" height="${rowH}" rx="8" fill="#17181a" stroke="#2a2c2f"/>`;
    rows += `<rect x="${x}" y="${y}" width="5" height="${rowH}" rx="2" fill="${C.orange}"/>`;
    rows += `<text x="${x + 20}" y="${y + rowH/2 + 6}" fill="${C.orange}" font-size="18" font-weight="700" font-family="ui-monospace, monospace">${row.l}</text>`;
    rows += `<text x="${x + 64}" y="${y + rowH/2 - 4}" fill="${C.off}" font-size="15" font-weight="600">${row.t}</text>`;
    rows += `<text x="${x + 64}" y="${y + rowH/2 + 16}" fill="#9aa0a8" font-size="12">${row.s}</text>`;
  });
  const layersBottom = top + layers.length * (rowH + gap) - gap;
  const spineMid = (top - 6 + layersBottom + 6) / 2;
  const bandLabelY = layersBottom + 36;
  const chipY = bandLabelY + 12, chipH = 58, cgap = 12;
  const chipW = (w - 2 * cgap) / 3;
  let chips = '';
  cross.forEach((c, i) => {
    const cx = x + i * (chipW + cgap);
    chips += `<rect x="${cx}" y="${chipY}" width="${chipW}" height="${chipH}" rx="8" fill="#141517" stroke="${C.slate}" stroke-dasharray="4 3"/>`;
    chips += `<text x="${cx + chipW/2}" y="${chipY + chipH/2 - 4}" text-anchor="middle" fill="${C.off}" font-size="12.5" font-weight="600">${c.t}</text>`;
    chips += `<text x="${cx + chipW/2}" y="${chipY + chipH/2 + 14}" text-anchor="middle" fill="#9aa0a8" font-size="10"${c.mono ? ' font-family="ui-monospace, monospace"' : ''}>${c.s}</text>`;
  });
  const H = chipY + chipH + 16;
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="d-stack" preserveAspectRatio="xMidYMid meet">
<title id="d-stack">The Bitcoin-substrate stack: three layers — L3 Cashu/Fedimint ecash on top, L2 Lightning in the middle, L1 Bitcoin settlement and hard reserve at the base — plus three cross-cutting constructs that run across all three layers rather than stacking on them: integration primitives, wallet architectures, and a security model. A spine down the left labelled "settles in Bitcoin" runs through the three layers; the right axis runs from operational use at the top to hard reserve at the base.</title>
<rect width="${W}" height="${H}" fill="${C.bg}" rx="10"/>
<text x="${W/2}" y="32" text-anchor="middle" fill="${C.off}" font-size="17" font-weight="600">The Stack</text>
<line x1="${x-22}" y1="${top-6}" x2="${x-22}" y2="${layersBottom+6}" stroke="${C.orange}" stroke-width="3"/>
<text x="${x-30}" y="${spineMid}" fill="${C.orange}" font-size="11" letter-spacing="1" transform="rotate(-90 ${x-30} ${spineMid})" text-anchor="middle">settles in Bitcoin</text>
${rows}
<text x="${axisX}" y="${top+6}" fill="${C.slate}" font-size="10.5" text-anchor="middle">operational ↑</text>
<line x1="${axisX}" y1="${top+16}" x2="${axisX}" y2="${layersBottom-18}" stroke="${C.slate}" stroke-width="1.5" stroke-dasharray="3 3"/>
<text x="${axisX}" y="${layersBottom-2}" fill="${C.slate}" font-size="10.5" text-anchor="middle">reserve ↓</text>
<text x="${x}" y="${bandLabelY}" fill="#9aa0a8" font-size="11" font-style="italic">Cross-cutting — runs across all three layers, not stacked on them</text>
${chips}
</svg>`;
  return fig(svg, 'The Stack: three layers — Bitcoin L1 settlement and hard reserve at the base, the Lightning Network for machine-tempo payments above it, and Cashu/Fedimint bearer ecash on top — with three cross-cutting constructs (integration primitives, wallet architectures, security model) that run across all three rather than stacking on them. Every layer settles in Bitcoin (left spine); the right axis runs from operational use at the top to hard reserve at the base.');
}

/* 2 — Two-tier model */
export function twoTierDiagram(): string {
  const W = 720, H = 360, meshY = 90;
  const nodes = [60, 160, 260, 360, 460, 560, 660].map((cx) => ({ cx, cy: meshY + 26 }));
  let edges = '', dots = '';
  nodes.forEach((n, i) => {
    if (i < nodes.length - 1) edges += `<line x1="${n.cx}" y1="${n.cy}" x2="${nodes[i+1].cx}" y2="${nodes[i+1].cy}" stroke="#3a3d42" stroke-width="1"/>`;
    dots += `<circle cx="${n.cx}" cy="${n.cy}" r="6" fill="${C.off}"/>`;
  });
  let drops = '';
  [160, 360, 560].forEach((cx) => { drops += `<line x1="${cx}" y1="${meshY+26}" x2="${cx}" y2="248" stroke="${C.orange}" stroke-width="1.5" stroke-dasharray="4 5" opacity="0.75"/>`; });
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="d-twotier" preserveAspectRatio="xMidYMid meet">
<title id="d-twotier">Two-tier model: a solid Bitcoin-orange bedrock band at the bottom labelled "Bitcoin L1 — settlement and hard reserve" supports a fast, light mesh at the top labelled "Lightning + L2/L3 — payments at machine tempo." Thin value threads flow rapidly across the upper mesh and periodically settle down into the base. Constant payments above; final settlement below.</title>
<rect width="${W}" height="${H}" fill="${C.bg}" rx="10"/>
<text x="${W/2}" y="32" text-anchor="middle" fill="${C.off}" font-size="17" font-weight="600">Two-tier model</text>
<text x="40" y="66" fill="${C.off}" font-size="13" font-weight="600">Lightning + L2/L3 — payments at machine tempo</text>
${edges}
<path d="M 56 108 C 240 88, 470 88, 690 104" fill="none" stroke="${C.orange}" stroke-width="2.5" opacity="0.95"/>
${dots}
${drops}
<rect x="40" y="252" width="${W-80}" height="70" rx="8" fill="${C.orange}"/>
<text x="${W/2}" y="284" text-anchor="middle" fill="${C.bg}" font-size="15" font-weight="700">Bitcoin L1 — settlement &amp; hard reserve</text>
<text x="${W/2}" y="306" text-anchor="middle" fill="#1a1206" font-size="12">counterparty-free · absolute · the monetary base</text>
<text x="${W/2}" y="${H-8}" text-anchor="middle" fill="#9aa0a8" font-size="12" font-style="italic">Constant payments above; final settlement below.</text>
</svg>`;
  return fig(svg, 'The two-tier model: a hard Bitcoin L1 base for settlement and reserve, with a fast Lightning/L2/L3 layer for machine-tempo payments above it. Value moves constantly on top and periodically settles down into the base — structurally like Stripe over banks, but the base is Bitcoin.');
}

/* 3 — Substrate-evaluation matrix (table) */
export function substrateMatrix(): string {
  const cols = ['Permissionless custody', 'Censorship-resistant', 'Sub-cent settlement', 'Machine-tempo'];
  type Cell = 'pass' | 'fail' | 'partial';
  const rows: { name: string; cells: Cell[]; win?: boolean }[] = [
    { name: 'Bank rails', cells: ['fail', 'fail', 'fail', 'partial'] },
    { name: 'Regulated stablecoins', cells: ['pass', 'fail', 'pass', 'pass'] },
    { name: 'CBDCs', cells: ['fail', 'fail', 'pass', 'pass'] },
    { name: 'Bitcoin + Lightning + ecash', cells: ['pass', 'pass', 'pass', 'pass'], win: true },
  ];
  const glyph: Record<Cell, string> = { pass: '✓', fail: '✗', partial: '◐' };
  const label: Record<Cell, string> = { pass: 'pass', fail: 'fail', partial: 'partial' };
  let body = '';
  rows.forEach((r) => {
    body += `<tr class="${r.win ? 'win' : ''}"><th scope="row">${r.name}</th>` +
      r.cells.map((c) => `<td class="cell cell-${c}"><span class="glyph" aria-hidden="true">${glyph[c]}</span><span class="sr-only">${label[c]}</span></td>`).join('') + '</tr>';
  });
  return `<figure class="diagram matrix"><figcaption class="matrix-title">Substrate evaluation — four constraints, conjunctive</figcaption>
<table><thead><tr><th scope="col">Substrate</th>${cols.map((c) => `<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>
<p class="matrix-note">Only one row satisfies all four constraints conjunctively. <span class="legend"><span class="k cell-pass">✓ pass</span> <span class="k cell-partial">◐ partial</span> <span class="k cell-fail">✗ fail</span></span></p></figure>`;
}

/* 4 — Follow one payment down the stack */
export function paymentTrace(): string {
  const W = 760, H = 280, boxW = 160, boxH = 76, y = 96;
  const steps = [
    { t: 'Agent requests', s: 'paid API', mono: false },
    { t: 'HTTP 402', s: '+ invoice (L402)', mono: true },
    { t: 'Pays 11 sats', s: 'over Lightning', mono: false },
    { t: 'Macaroon cached', s: 'access granted', mono: false },
  ];
  const gap = (W - 40 - steps.length * boxW) / (steps.length - 1);
  let g = '';
  steps.forEach((st, i) => {
    const x = 20 + i * (boxW + gap);
    const mono = st.mono ? ' font-family="ui-monospace, monospace"' : '';
    g += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="8" fill="#1e1408" stroke="${C.orange}" stroke-width="1.2"/>`;
    g += `<text x="${x+boxW/2}" y="${y+32}" text-anchor="middle" fill="${C.orange}" font-size="14" font-weight="700"${mono}>${st.t}</text>`;
    g += `<text x="${x+boxW/2}" y="${y+52}" text-anchor="middle" fill="${C.off}" font-size="11"${mono}>${st.s}</text>`;
    if (i < steps.length - 1) {
      g += `<line x1="${x+boxW}" y1="${y+boxH/2}" x2="${x+boxW+gap}" y2="${y+boxH/2}" stroke="${C.orange}" stroke-width="2"/>`;
      g += `<polygon points="${x+boxW+gap},${y+boxH/2} ${x+boxW+gap-8},${y+boxH/2-5} ${x+boxW+gap-8},${y+boxH/2+5}" fill="${C.orange}"/>`;
    }
  });
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="d-trace" preserveAspectRatio="xMidYMid meet">
<title id="d-trace">Follow one payment down the stack. Left to right: agent requests a paid API; server replies HTTP 402 with a Lightning invoice using L402; the agent pays 11 satoshis over Lightning; the macaroon is cached and access is granted. Periodically, shown dashed, the Lightning channel settles to Bitcoin L1.</title>
<rect width="${W}" height="${H}" fill="${C.bg}" rx="10"/>
<text x="${W/2}" y="30" text-anchor="middle" fill="${C.off}" font-size="17" font-weight="600">Follow one payment down the stack</text>
${g}
<line x1="${W/2}" y1="${y+boxH}" x2="${W/2}" y2="214" stroke="${C.orange}" stroke-width="1.5" stroke-dasharray="4 5"/>
<rect x="${W/2-130}" y="214" width="260" height="44" rx="8" fill="${C.orange}"/>
<text x="${W/2}" y="241" text-anchor="middle" fill="${C.bg}" font-size="13" font-weight="700">Channel settles to Bitcoin L1 (periodic)</text>
</svg>`;
  return fig(svg, 'One traced payment: an agent requests a paid API, gets back HTTP 402 with a Lightning invoice (L402), pays 11 sats over Lightning, and reuses the cached macaroon for access. The Lightning channel periodically settles to Bitcoin L1 underneath — the load-bearing split of the whole stack.');
}

/* 5 — Two-toolkit moment */
export function twoToolkit(): string {
  const W = 760, H = 380, midX = W / 2;
  const left = [
    { y: 124, t: 'L402', mono: true },
    { y: 178, t: 'Lightning', mono: false },
    { y: 232, t: 'settles in sats', mono: false },
    { y: 286, t: 'trust: cryptographic', mono: false },
  ];
  const right = [
    { y: 124, t: 'x402', mono: true },
    { y: 178, t: 'USDC on Base', mono: false },
    { y: 232, t: 'Coinbase + Circle + Stripe', mono: false },
    { y: 286, t: 'trust: 3 regulated intermediaries', mono: false },
  ];
  let lg = '', rg = '';
  left.forEach((s, i) => {
    const mono = s.mono ? ' font-family="ui-monospace, monospace"' : '';
    lg += `<rect x="${midX-300}" y="${s.y}" width="290" height="40" rx="7" fill="#1e1408" stroke="${C.orange}" stroke-width="1.2"/>`;
    lg += `<text x="${midX-155}" y="${s.y+25}" text-anchor="middle" fill="${C.orange}" font-size="14" font-weight="${i===0?'700':'600'}"${mono}>${s.t}</text>`;
    if (i < 3) lg += `<line x1="${midX-155}" y1="${s.y+40}" x2="${midX-155}" y2="${s.y+54}" stroke="${C.orange}" stroke-width="1.5"/>`;
  });
  right.forEach((s, i) => {
    const mono = s.mono ? ' font-family="ui-monospace, monospace"' : '';
    rg += `<rect x="${midX+10}" y="${s.y}" width="290" height="40" rx="7" fill="#16181b" stroke="${C.slate}" stroke-width="1.2"/>`;
    rg += `<text x="${midX+155}" y="${s.y+25}" text-anchor="middle" fill="#c2c7cd" font-size="13.5" font-weight="${i===0?'700':'600'}"${mono}>${s.t}</text>`;
    if (i < 3) rg += `<line x1="${midX+155}" y1="${s.y+40}" x2="${midX+155}" y2="${s.y+54}" stroke="${C.slate}" stroke-width="1.5"/>`;
  });
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="d-2tk" preserveAspectRatio="xMidYMid meet">
<title id="d-2tk">The two-toolkit moment. A single monospace label at the top reads HTTP 402 Payment Required, then splits into two mirrored branches. The left branch, in Bitcoin-orange, reads L402, then Lightning, then settles in sats, with trust cryptographic; captioned Lightning Labs, February 2026. The right branch, in slate-grey, reads x402, then USDC on Base, then settles via Coinbase, Circle and Stripe, with trust through three regulated intermediaries; captioned AWS AgentCore, May 2026. Headline: same status code, two substrates.</title>
<rect width="${W}" height="${H}" fill="${C.bg}" rx="10"/>
<rect x="${midX-160}" y="34" width="320" height="46" rx="8" fill="#17181a" stroke="#3a3d42"/>
<text x="${midX}" y="63" text-anchor="middle" fill="${C.off}" font-size="17" font-weight="700" font-family="ui-monospace, monospace">HTTP 402 — Payment Required</text>
<path d="M ${midX} 80 L ${midX-150} 120" stroke="${C.orange}" stroke-width="2" fill="none"/>
<path d="M ${midX} 80 L ${midX+150} 120" stroke="${C.slate}" stroke-width="2" fill="none"/>
${lg}<text x="${midX-155}" y="346" text-anchor="middle" fill="#9aa0a8" font-size="11">Lightning Labs, Feb 2026</text>
${rg}<text x="${midX+155}" y="346" text-anchor="middle" fill="#9aa0a8" font-size="11">AWS AgentCore, May 2026</text>
<text x="${midX}" y="${H-8}" text-anchor="middle" fill="${C.off}" font-size="13" font-weight="600" font-style="italic">Same status code. Two substrates.</text>
</svg>`;
  return fig(svg, 'The two-toolkit moment: both stacks gate access on HTTP 402 "Payment Required," but settle on architecturally opposite substrates. L402 (Lightning Labs, Feb 2026) settles in sats with cryptographic trust; x402 (AWS AgentCore, May 2026) settles in USDC on Base through three regulated intermediaries — Coinbase, Circle, Stripe.');
}

/* 6 — Bridge taxonomy grid (table) */
export function bridgeTaxonomy(): string {
  const cols = ['Cryptographic', 'Mint / federation', 'Regulated custodian', 'Competing substrate'];
  type Tt = 'btc' | 'slate' | 'none';
  const rows: { name: string; cells: { ex: string; t: Tt }[] }[] = [
    { name: 'Bitcoin ↔ fiat', cells: [{ ex: '—', t: 'none' }, { ex: '—', t: 'none' }, { ex: 'Strike, River, Swan', t: 'slate' }, { ex: '—', t: 'none' }] },
    { name: 'Lightning ↔ on-chain', cells: [{ ex: 'Submarine swaps (Boltz, Loop)', t: 'btc' }, { ex: '—', t: 'none' }, { ex: '—', t: 'none' }, { ex: '—', t: 'none' }] },
    { name: 'Bitcoin ↔ stablecoin', cells: [{ ex: 'Taproot Assets (rails)', t: 'slate' }, { ex: '—', t: 'none' }, { ex: 'CEX swap', t: 'slate' }, { ex: 'x402 / AgentCore', t: 'slate' }] },
    { name: 'ecash ↔ Lightning', cells: [{ ex: '—', t: 'none' }, { ex: 'Cashu, Fedimint', t: 'btc' }, { ex: 'Mint redemption', t: 'slate' }, { ex: '—', t: 'none' }] },
  ];
  let body = '';
  rows.forEach((r) => {
    body += `<tr><th scope="row">${r.name}</th>` + r.cells.map((c) => `<td class="bridge-cell bridge-${c.t}">${c.ex}</td>`).join('') + '</tr>';
  });
  return `<figure class="diagram matrix"><figcaption class="matrix-title">Bridge taxonomy — what gets bridged × trust model</figcaption>
<table><thead><tr><th scope="col">What gets bridged</th>${cols.map((c) => `<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>
<p class="matrix-note"><span class="legend"><span class="k cell-pass">orange — Bitcoin leg keeps all four constraints</span> <span class="k cell-fail">slate — identity / freeze enters at the boundary</span></span></p></figure>`;
}

/* 9 — 2026 deployment timeline */
export function deploymentTimeline(): string {
  const W = 820, H = 348, x0 = 80, x1 = W - 40;
  const span = x1 - x0;
  const at = (f: number) => x0 + span * f;
  const orangeLane = 158, slateLane = 244;
  const events = [
    { lane: 'orange', f: 0.10, date: 'Feb 11', label: 'Lightning Labs', sub: 'lightning-agent-tools', mono: true },
    { lane: 'orange', f: 0.46, date: 'Mar 21', label: 'USDT on Lightning', sub: 'Taproot Assets', mono: false },
    { lane: 'orange', f: 0.68, date: '~Apr', label: 'Lightspark Grid', sub: 'agent delegation', mono: false },
    { lane: 'slate', f: 0.90, date: 'May 7', label: 'AWS AgentCore', sub: 'x402 / USDC', mono: false },
  ];
  let g = '';
  events.forEach((e) => {
    const cx = at(e.f);
    const lane = e.lane === 'orange' ? orangeLane : slateLane;
    const color = e.lane === 'orange' ? C.orange : C.slate;
    const mono = e.mono ? ' font-family="ui-monospace, monospace"' : '';
    g += `<circle cx="${cx}" cy="${lane}" r="6" fill="${color}"/>`;
    if (e.lane === 'orange') {
      g += `<text x="${cx}" y="${lane-50}" text-anchor="middle" fill="${color}" font-size="11" font-weight="700">${e.date}</text>`;
      g += `<text x="${cx}" y="${lane-34}" text-anchor="middle" fill="${C.off}" font-size="12" font-weight="600">${e.label}</text>`;
      g += `<text x="${cx}" y="${lane-18}" text-anchor="middle" fill="#9aa0a8" font-size="10.5"${mono}>${e.sub}</text>`;
    } else {
      g += `<text x="${cx}" y="${lane+24}" text-anchor="middle" fill="${color}" font-size="11" font-weight="700">${e.date}</text>`;
      g += `<text x="${cx}" y="${lane+40}" text-anchor="middle" fill="${C.off}" font-size="12" font-weight="600">${e.label}</text>`;
      g += `<text x="${cx}" y="${lane+56}" text-anchor="middle" fill="#9aa0a8" font-size="10.5">${e.sub}</text>`;
    }
  });
  const bpiX = at(0.28);
  const midGap = (orangeLane + slateLane) / 2;
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="d-tl" preserveAspectRatio="xMidYMid meet">
<title id="d-tl">2026 deployment timeline with two lanes. Bitcoin-substrate lane (orange): Feb 11 Lightning Labs lightning-agent-tools; Mar 21 USDT live on Lightning via Taproot Assets; approximately April Lightspark Grid agent delegation (hybrid). Competing-substrate lane (slate): May 7 AWS AgentCore Payments using x402 and USDC. Shared mid-point marker: March, the BPI study. Two production stacks about 90 days apart, architecturally opposite.</title>
<rect width="${W}" height="${H}" fill="${C.bg}" rx="10"/>
<text x="${W/2}" y="26" text-anchor="middle" fill="${C.off}" font-size="17" font-weight="600">2026 deployment timeline</text>
<text x="${W/2-14}" y="52" text-anchor="end" fill="${C.orange}" font-size="11" font-weight="600">&#9644; Bitcoin substrate</text>
<text x="${W/2+14}" y="52" text-anchor="start" fill="${C.slate}" font-size="11" font-weight="600">&#9644; Competing substrate</text>
<line x1="${x0}" y1="${orangeLane}" x2="${x1}" y2="${orangeLane}" stroke="${C.orange}" stroke-width="2.5"/>
<line x1="${x0}" y1="${slateLane}" x2="${x1}" y2="${slateLane}" stroke="${C.slate}" stroke-width="2.5"/>
<line x1="${bpiX}" y1="${orangeLane-28}" x2="${bpiX}" y2="${slateLane+8}" stroke="#9aa0a8" stroke-width="1" stroke-dasharray="3 4"/>
<rect x="${bpiX-52}" y="${midGap-11}" width="104" height="16" fill="${C.bg}"/>
<text x="${bpiX}" y="${midGap+1}" text-anchor="middle" fill="#9aa0a8" font-size="11">Mar — BPI study</text>
${g}
<text x="${W/2}" y="${H-12}" text-anchor="middle" fill="#9aa0a8" font-size="12" font-style="italic">Two production stacks, ~90 days apart, architecturally opposite.</text>
</svg>`;
  return fig(svg, 'Two production agent-payment stacks shipped within ~90 days in 2026. Bitcoin-substrate track (orange): Lightning Labs lightning-agent-tools (Feb 11), USDT on Lightning via Taproot Assets (Mar 21), Lightspark Grid agent delegation (~Apr, hybrid). Competing-substrate track (slate): AWS AgentCore Payments on x402/USDC (May 7). Shared marker: the BPI study (Mar).');
}

/* 10 — BPI chart */
export function bpiChart(): string {
  const W = 760, H = 360, x0 = 97, baseY = 250, maxBarH = 170;
  const groups = [
    { label: 'Overall preference', bars: [{ n: 'Bitcoin', v: 48.3, btc: true }, { n: 'Stablecoins', v: 33.2, btc: false }] },
    { label: 'Store of value', bars: [{ n: 'Bitcoin', v: 79.1, btc: true }] },
    { label: 'Payments', bars: [{ n: 'Stablecoins', v: 53.2, btc: false }, { n: 'Bitcoin', v: 36.0, btc: true }] },
  ];
  const barW = 78, innerGap = 16, groupGap = 72;
  let cursor = x0;
  const placed: { x: number; v: number; n: string; btc: boolean; glabel: string }[] = [];
  for (const grp of groups) {
    for (const b of grp.bars) { placed.push({ x: cursor, v: b.v, n: b.n, btc: b.btc, glabel: grp.label }); cursor += barW + innerGap; }
    cursor += groupGap - innerGap;
  }
  let bars = '';
  placed.forEach((b) => {
    const h = (b.v / 100) * maxBarH;
    const y = baseY - h;
    bars += `<rect x="${b.x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${b.btc ? C.orange : C.slate}"/>`;
    bars += `<text x="${b.x+barW/2}" y="${y-8}" text-anchor="middle" fill="${b.btc ? C.orange : '#c2c7cd'}" font-size="13" font-weight="700">${b.v}%</text>`;
    bars += `<text x="${b.x+barW/2}" y="${baseY+16}" text-anchor="middle" fill="${C.off}" font-size="11">${b.n}</text>`;
  });
  let glabels = '';
  groups.forEach((grp) => {
    const members = placed.filter((p) => p.glabel === grp.label);
    const cx = (members[0].x + members[members.length-1].x + barW) / 2;
    glabels += `<text x="${cx}" y="${baseY+36}" text-anchor="middle" fill="#9aa0a8" font-size="11" font-weight="600">${grp.label}</text>`;
  });
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="d-bpi" preserveAspectRatio="xMidYMid meet">
<title id="d-bpi">BPI March 2026 study results. Overall monetary preference: Bitcoin 48.3 percent, stablecoins 33.2 percent. Store of value: Bitcoin 79.1 percent. Payments: stablecoins 53.2 percent, Bitcoin 36.0 percent. Per-provider Bitcoin preference ranged from 68 to 26 percent; strongest single-model consensus 91.3 percent. Based on 9,072 scenarios across 36 frontier models — preference under inference, not deployed flow.</title>
<rect width="${W}" height="${H}" fill="${C.bg}" rx="10"/>
<text x="${W/2}" y="30" text-anchor="middle" fill="${C.off}" font-size="17" font-weight="600">BPI study — model monetary preference</text>
<line x1="${x0-14}" y1="${baseY}" x2="${W-(x0-14)}" y2="${baseY}" stroke="#3a3d42" stroke-width="1"/>
${bars}${glabels}
<text x="${W/2}" y="${H-14}" text-anchor="middle" fill="#9aa0a8" font-size="11" font-style="italic">BPI, Mar 2026 — 9,072 scenarios, 36 frontier models. Preference under inference, not deployed flow.</text>
</svg>`;
  const table = `<table class="data-parity"><thead><tr><th scope="col">Dimension</th><th scope="col">Bitcoin</th><th scope="col">Stablecoins</th></tr></thead><tbody>
<tr><th scope="row">Overall preference</th><td>48.3%</td><td>33.2%</td></tr>
<tr><th scope="row">Store of value</th><td>79.1%</td><td>—</td></tr>
<tr><th scope="row">Payments</th><td>36.0%</td><td>53.2%</td></tr></tbody></table>
<p class="matrix-note">Per-provider Bitcoin preference spread 68% to 26%; strongest single-model consensus 91.3%. Over 90% of all responses favored digitally-native money over fiat.</p>`;
  return fig(svg, 'BPI March 2026 study, rendered from the data (same figures appear in the table below).', table);
}

export const DIAGRAMS: Record<string, () => string> = {
  stack: stackDiagram,
  'two-tier': twoTierDiagram,
  matrix: substrateMatrix,
  trace: paymentTrace,
  'two-toolkit': twoToolkit,
  bridge: bridgeTaxonomy,
  timeline: deploymentTimeline,
  bpi: bpiChart,
};
