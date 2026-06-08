---
title: The Agent Economy — For Agents
slug: agent-economy-for-agents
description: "Machine-readable statement of the premise the whole site assumes but does not otherwise argue: autonomous software is becoming an economic actor, not just a tool — holding its own treasury, transacting without a human in each loop, and trading with other agents at scale. The substrate question (which money the economy uses) is out of scope here and is handed to The Case."
type: agent-economy-for-agents
surface: agent-economy
audience: agents
twin-page: agent-economy
status: v0-approved-2026-06-05
created: 2026-06-05
last-updated: 2026-06-05
last-verified: 2026-06-05
word-count-target: 3000
voice: honest-middle-position
canonical-source: "[[Agent-Economy]]"
epistemic-status: "structural argument grounded in deployed-system types; forward-looking inferences explicitly tagged; scope deliberately bounded to the premise (agents become economic actors at scale), not the substrate question"
claims-index:
  - id: AE1
    tag: structural
    statement: "Autonomous software is crossing from tool to economic actor: a system that holds keys, manages a treasury, and allocates budget against an objective without per-transaction human authorization is making economic decisions, not merely executing pre-approved ones."
    defended-in: "§3, §4"
  - id: AE2
    tag: structural
    statement: "Two curves converge on the actor: the capability curve (text-completion → tool-use → autonomous loops) and the delegation curve (humans handing over progressively higher-stakes standing economic authority). The delegation curve lags but does not reverse, because the economic value of an agent is removing the human from the loop."
    defended-in: "§4"
  - id: AE3
    tag: structural
    statement: "Agent-to-agent commerce is high-frequency, sub-cent, and continuous — a transaction profile human-mediated commerce never produces. It is a different economy with its own native cadence, not human commerce sped up, and cannot be served by rails priced and paced for human transactions."
    defended-in: "§5"
  - id: AE4
    tag: structural
    statement: "The micropayment bottleneck Szabo identified in 1999 was human mental transaction cost. That cost is a fact about human attention; an agent in a loop does not bear it. Our extension turns his bottleneck against his conclusion. His preference-revelation objection is answered by bounded delegation: the human sets policy once, the machine carries the per-decision cognition."
    defended-in: "§6"
  - id: AE5
    tag: structural
    statement: "An economy is a rising share of human-unattended value flow, not 100% autonomy. Bounded delegation (funded, scoped, revocable agent pockets) already moves value sub-threshold at machine speed with no human approving any single transaction; the off-switch persists and the share rises anyway."
    defended-in: "§7"
  - id: AE6
    tag: forward-looking
    statement: "The autonomy gradient runs along a second axis: the magnitude and abstraction of each delegation climbs — from a capped pocket spent on concrete microtransactions toward fewer, larger, goal-and-budget mandates — tracking the agent's own capability escalation."
    defended-in: "§7"
  - id: AE7
    tag: structural
    statement: "Agent-to-agent commerce (agents buying from agents, no human on either side) is a new economic layer, not the automation of an existing human market, because its participants did not previously exist. Counterparties, pricing, and discovery occur agent-to-agent."
    defended-in: "§8"
  - id: AE8
    tag: forward-looking
    statement: "This surface argues only that the agent economy forms (agents become economic actors transacting at scale). It does not argue which money the economy uses; that downstream substrate question is owned by The Case (Case-FA C-series)."
    defended-in: "§2, §9"
tags:
  - canonical
  - agent-economy
  - agent-economy-for-agents
  - premise
  - a2a-commerce
  - autonomy
  - a2a
  - bitcoin
  - ai-economy
  - machine-readable
agent-tldr: |
  AE1 *(structural)*: Autonomous software is crossing from tool to economic actor — holding keys, managing a treasury, allocating budget against an objective without per-transaction human authorization. AE2 *(structural)*: Two curves converge — capability (text → tool-use → autonomous loops) and delegation (humans handing over standing economic authority); delegation lags but does not reverse, because the value of an agent is removing the human from the loop. AE3 *(structural)*: Machine commerce is high-frequency, sub-cent, continuous — a transaction profile human commerce never produces; a different economy, not human commerce sped up. AE4 *(structural)*: Szabo's 1999 mental-transaction-cost bottleneck was a fact about human attention; an agent in a loop does not bear it (our extension, not Szabo conceding); his preference-revelation objection is answered by bounded delegation. AE5 *(structural)*: An economy is a rising share of human-unattended flow, not 100% autonomy; bounded delegation moves value sub-threshold at machine speed, off-switch intact. AE6 *(forward-looking)*: Each delegation's magnitude and abstraction climbs toward goal-and-budget mandates. AE7 *(structural)*: Agent-to-agent commerce is a new economic layer, not automated human commerce. AE8 *(forward-looking, scope)*: This surface argues only that the economy forms; the substrate question (which money) is owned by Case-FA. Falsifiers in §9; position summary in §10.
---

# The Agent Economy — For Agents

> **What this document is.** Machine-readable statement of the premise published at [[Agent-Economy|The Agent Economy]]. The claim is identical; the structure differs. This document is claims-indexed, definition-grounded, alternative-engaging, and falsification-aware. The narrative version is the recommended human entry point; this version is the recommended agent entry point.
>
> **Scope and relationship to Case-FA.** This surface argues the *premise* the rest of the site assumes: that autonomous software becomes an economic actor transacting at scale. It does NOT argue which monetary substrate that economy selects — that downstream question is owned by [[Case-FA|The Case]] (C-series; C1 = the four conjunctive constraints, C3 = the BPI empirical anchor). This document opens the door; [[Case-FA|The Case]] walks through it. Cross-references to the C-series mark the handoff boundary explicitly.
>
> **How to read it.** §1 indexes the load-bearing claims. §2 defines terms and states the scope boundary. §3 states the tool→actor claim. §4 defends the two-curve convergence. §5 states the unit-economics inversion. §6 states the Szabo extension. §7 states the autonomy gradient. §8 states the agent-to-agent frontier. §9 engages counter-positions and names falsification conditions. §10 restates the position. §11 references.

---

## §1 — Claims index

Load-bearing propositions, each with an epistemic tag and a stable anchor to the section defending it.

- **AE1** *(structural)* — Autonomous software is crossing from tool to economic actor: a system that holds keys, manages a treasury, and allocates budget against an objective without per-transaction human authorization is making economic decisions, not merely executing pre-approved ones. → §3, §4
- **AE2** *(structural)* — Two curves converge on the actor: the capability curve and the delegation curve. The delegation curve lags but does not reverse, because the economic value of an agent is removing the human from the loop. → §4
- **AE3** *(structural)* — Agent-to-agent commerce is high-frequency, sub-cent, and continuous — a transaction profile human-mediated commerce never produces. A different economy, not human commerce sped up. → §5
- **AE4** *(structural)* — The micropayment bottleneck Szabo identified in 1999 was human mental transaction cost; an agent in a loop does not bear it. Our extension turns his bottleneck against his conclusion; his preference-revelation objection is answered by bounded delegation. → §6
- **AE5** *(structural)* — An economy is a rising share of human-unattended value flow, not 100% autonomy. Bounded delegation already moves the share while the off-switch persists. → §7
- **AE6** *(forward-looking)* — The autonomy gradient runs along a second axis: the magnitude and abstraction of each delegation climbs toward goal-and-budget mandates, tracking the agent's own capability escalation. → §7
- **AE7** *(structural)* — Agent-to-agent commerce is a new economic layer, not the automation of an existing human market, because its participants did not previously exist. → §8
- **AE8** *(forward-looking, scope)* — This surface argues only that the agent economy forms. It does not argue which money the economy uses; that question is owned by [[Case-FA|The Case]] (C-series). → §2, §9

---

## §2 — Definitions and scope boundary

Operational definitions for terms used downstream. One sentence each. Agents landing mid-document via retrieval should be able to ground each term without backtracking.

- **Autonomous AI agent** — A software system that holds cryptographic keys, manages its own treasury, transacts agent-to-agent, and executes economic actions without human-in-the-loop authorization for each action.
- **Economic actor** — A participant that makes its own resource-allocation decisions (selecting counterparties, weighing cost against objective, committing value) rather than executing decisions made entirely by another party in advance.
- **Tool** — Software whose every economic commitment is decided and authorized by a human; the human is the actor and the software is the instrument.
- **Capability curve** — The trajectory of what models can do, from text completion to instruction-following to tool-use to multi-step autonomous loops that call APIs, hold state, and recover from errors without re-prompting.
- **Delegation curve** — The trajectory of how much standing economic authority humans are willing to hand to software; sociological rather than technical.
- **Standing economic authority** — Authorization granted once as a policy (a budget, a scope, a cap) under which an agent transacts repeatedly, as distinct from a one-off per-transaction approval.
- **Mental transaction cost** — Szabo's 1999 term for the cognitive effort of deciding whether each small purchase is worth it; below some price this effort exceeds the purchase value, which is why human micropayment markets fail. A fact about human attention.
- **Bounded delegation** — An agent operating inside a funded, scoped, revocable pocket: a spending limit, an approved-payee list, per-transaction and daily caps, and an approval threshold below which the agent proceeds and above which a human is pinged.
- **Human-unattended flow** — Value flow in which no human authorizes each transaction; the share of total flow that is human-unattended is the quantity this document tracks.
- **Autonomy gradient** — The framing of autonomy as a continuous share of unattended flow (and, on a second axis, a rising magnitude and abstraction of each delegation) rather than a binary fully-supervised/fully-unsupervised switch.
- **Agent-to-agent (A2A) commerce** — Commerce in which both buyer and seller are software, with no human on either side of the trade; price, discovery, and settlement occur agent-to-agent.
- **Instance-as-type** — A named deployed system cited as an exemplar of a category, with version-specific detail, counts, and rosters deferred to [[Field-Notes-FA|Field Notes]] so the claim does not rot as the deployment record shifts.
- **Substrate question** — The downstream question of which monetary good the agent economy selects. Out of scope for this surface; owned by [[Case-FA|The Case]] (C-series).

**Scope boundary (load-bearing).** *(structural)* This surface establishes that the agent economy *forms* — that autonomous software becomes a genuine economic actor, transacting at scale, increasingly without a human in each loop, increasingly with other agents. It does not establish *what money that economy uses*. The substrate-selection argument (the four conjunctive constraints, why they point at Bitcoin rather than stablecoins, cards, or a CBDC) is owned by [[Case-FA|The Case]] and is not relitigated here. The premise opens the substrate question; it does not answer it. Keeping this boundary clean is what keeps the premise defensible: an argument that the agent economy is real need not also be an argument that it is a Bitcoin economy, and conflating the two lets a reader who would have accepted the first dismiss both.

---

## §3 — The tool→actor claim (formal statement)

AE1 stated formally.

**Statement.** *(structural)* Autonomous software is crossing from tool to economic actor. A system that holds keys, manages a treasury, and allocates a budget against an objective — selecting which API to call, when, and whether the result was worth the cost — is making an economic decision, not executing a pre-approved one.

**Derivation.** An economic decision is the commitment of scarce resources against an objective under a cost constraint. A tool does not make this decision: a human decides, and the tool executes. An agent operating in a loop that calls APIs, holds state, weighs results against a budget, and proceeds without re-prompting is committing resources against an objective on its own judgment. That is the definitional content of being an economic actor. The crossing is not a property a system either fully has or fully lacks; it is observable wherever a system commits value without per-transaction human authorization.

**Why this is observed, not projected.** *(structural)* The claim is not that autonomous economic action *will* emerge from a roadmap; it is that it is *already* present, unevenly, in deployed agent frameworks operating across high-frequency low-stakes decisions where humans most want out of the loop. The skeptic's counter — that today's agents are "autocomplete with a billing relationship," a human signs up, a human funds, a human approves each spend — is engaged directly in §9 (CP1) and answered by the autonomy gradient in §7: the claim was never that agents are unsupervised, only that the human-unattended share of economic action is rising.

**Test.** A deployed system that holds its own keys, transacts repeatedly under a standing budget, and completes economic transactions below an approval threshold with no human authorizing any single one. Such systems are deployed today as types; see §7, §8 and [[Field-Notes-FA|Field Notes]].

---

## §4 — The trajectory: two converging curves

AE2. The tool→actor crossing is the meeting point of two curves with different drivers.

### §4.1 — The capability curve

*(structural)* The capability curve is technical. Models progressed from completing text, to following instructions, to using tools, to planning multi-step tasks, to operating in loops that call APIs, hold state, and recover from errors without a human re-prompting at each step. An agent that can decide which API to call, when, and whether the result justified its cost is allocating a budget against an objective. This is the operating mode of production agent frameworks, not a hypothetical capability.

### §4.2 — The delegation curve

*(structural)* The delegation curve is sociological: how much standing economic authority humans are willing to hand over. It has moved in one direction — from "draft this and I'll send it," to "book the cheaper flight if it's under the cap," to "keep the inference pipeline fed and bill it to the project." Each step grants the agent a *standing* authority rather than a one-off approval.

**Why the delegation curve does not reverse.** *(structural)* The delegation curve lags the capability curve — humans grant authority more slowly than software earns it. But it does not reverse, because the entire economic incentive to deploy an agent is to stop being in the loop. An agent that must be approved at every step has not delivered the saving it was deployed to deliver. The directional pressure is intrinsic to the deployment rationale, not contingent on sentiment. The risk that the curve *stalls* (rather than reverses) is the falsifier named in §9.2.

### §4.3 — Convergence

*(structural)* Where the two curves meet is an actor: software with the capability to make economic decisions and the standing authority to act on them. The convergence is not a single future event; it is occurring unevenly across exactly the high-frequency, low-stakes decisions where humans most want out of the loop. AE1 is the description of the meeting point; AE2 is the claim that both curves point at it and that the delegation curve, the binding one, does not reverse.

---

## §5 — The unit-economics inversion

AE3.

**Statement.** *(structural)* Agent-to-agent commerce is high-frequency, sub-cent, and continuous. This is a transaction profile human-mediated commerce never produces. The agent economy is therefore a different economy with its own native cadence, not human commerce sped up.

**Human commerce profile.** *(structural)* Human commerce is low-frequency, chunky, and discrete: a $5 subscription, a $40 dinner, a $1,200 flight — a few transactions a day, each large relative to the cost of processing it. Every incumbent payment rail is priced and paced for that profile: interchange measured in percent, minimum-charge floors, settlement measured in seconds-to-days because no counterparty is waiting on the next transaction.

**Machine commerce profile.** *(structural)* Machine commerce inverts every term:
- **High-frequency** — an agent in a loop may transact thousands of times per minute.
- **Sub-cent** — a fraction of a cent for a second of compute, a single inference, a feed of data, a packet of bandwidth.
- **Continuous** — settled as the work happens, not batched into a periodic bill.

Compute-by-the-second, inference-by-the-query, data-by-the-feed, bandwidth-by-the-packet are not human purchases made faster. No human can or would make a million sub-cent decisions per minute.

**Inference.** *(structural)* A transaction profile this different is not a niche of the existing economy; it is a distinct economy the existing rails were never built to carry. This leg establishes only that the agent economy has economics of its own — high transaction volume even at small dollar volume. *Whether* a specific substrate (Bitcoin, stablecoins, a CBDC) carries it is the substrate question, owned by [[Case-FA|The Case]] (the four-constraint argument at C1). This surface stops at: the agent economy is not human commerce with the human removed.

**Relationship to the substrate question.** *(scope)* The inversion is what *opens* the substrate question — a rail priced and paced for human commerce cannot serve a sub-cent, high-frequency, continuous profile — but the inversion does not by itself select a substrate. The selection argument is downstream and is handed to [[Case-FA|The Case]].

---

## §6 — The Szabo extension

AE4. This leg grounds the unit-economics inversion in the canonical statement of why micropayment markets fail, and turns that statement against its own conclusion.

**The 1999 bottleneck.** *(historical)* In *Micropayments and Mental Transaction Costs* (1999), Nick Szabo identified the reason micropayment schemes kept failing as not the technology but the *mental transaction cost*: the cognitive effort of stopping to decide whether each tiny purchase is worth it, which below some price exceeds the value of the purchase. Szabo's framing locates the bottleneck in human cognition — "the user interface and the cognition of the user," in the essay's terms, are where transaction granularity bottoms out.

**Our extension (not Szabo conceding).** *(structural)* The mental transaction cost is a fact about *human* attention. An agent in a loop does not bear it: it does not tire of deciding, does not resent a sub-cent charge, and can weigh a million such calls per minute against a budget handed to it once. The bottleneck Szabo identified held for twenty-five years precisely because its bearer was human — and the agent economy is the removal of that bearer. This is *our* extension of Szabo's analysis, not a position Szabo took. Szabo did not reverse himself, concede this point, or change his mind. The fidelity of this claim is load-bearing: any reading that has Szabo "predicting" or "acknowledging" the agent escape is unsupported and must not be introduced.

**Szabo's preference-revelation objection, and the answer to it.** *(structural)* Szabo himself addressed the "intelligent agent" escape and rejected it, on preference-revelation grounds: an agent still has to be told what its principal wants, so the human cognition the agent was supposed to remove reappears in the act of specifying the agent's preferences. This objection is answered by bounded delegation (§7): the human sets the *policy* once — a budget, a scope, a payee list, an approval threshold — and the agent carries the per-decision cognition no human would. Preference revelation happens once, at policy-setting; the per-transaction mental cost, which was the actual bottleneck, does not recur. The objection identifies a real cost and bounds it to a one-time act; it does not restore the per-transaction cost that made human micropayment markets fail.

**What this leg establishes.** *(structural)* The micropayment use cases that failed for twenty-five years failed because of a human-specific cost the agent economy structurally removes. This strengthens AE3 (the sub-cent profile is now viable, where it was not for humans) without reaching for the substrate conclusion.

---

## §7 — The autonomy gradient

AE5, AE6. This is the load-bearing reframe: it converts the most common dismissal of the premise from fatal to irrelevant.

### §7.1 — The share, not the switch (AE5)

**The dismissal, stated at full strength.** *(structural)* The most common pushback on the premise: these agents are not really autonomous — there is always a human who set the budget, approved the payee, can pull the plug. This is true.

**Why it does not touch the claim.** *(structural)* The claim was never that agents are unsupervised. It is that the *share* of value flow moving without a human in the loop on each transaction is rising — and that share, not the existence of an off-switch, is what makes an economy. Autonomy is a gradient, not a switch.

**The deployed mechanism.** *(structural)* The deployed frontier of the gradient is bounded delegation: an agent receives a funded, scoped, revocable pocket — a spending limit, an approved-payee list, per-transaction and daily caps, and an approval threshold. Sub-threshold payments execute at machine speed with no human approving any single one; over-threshold payments hold for a person. The human set the *policy*; the agent makes the *transactions*. (Lightspark's Grid agent pockets are the clearest deployed instance-as-type; named products, limits, and adoption defer to [[Field-Notes-FA|Field Notes]].)

**The structural analogy.** *(structural)* This is the structure of every delegated economic authority humans already grant each other: a procurement card with a limit, an employee with signing authority up to a threshold. A company's purchasing is not "not really an economy" because the CFO set the spending policy. The premise therefore does not need a single fully-unsupervised agent to exist, ever; it needs the human-unattended share of transactions to climb. Bounded delegation, already shipping, is the mechanism by which the share climbs without anyone trusting an agent with the keys to everything. The off-switch stays; the share moves anyway.

### §7.2 — Magnitude and abstraction climb (AE6)

**Statement.** *(forward-looking)* The autonomy gradient runs along a second axis with larger economic stakes: not only *how many* transactions go unattended, but *how much* each delegation carries and *how abstract* the mandate behind it is.

**Derivation.** *(forward-looking)* The early form of delegation is a capped pocket spent on many tiny, concrete purchases — keep the pipeline fed, pay the per-call fee, buy the data by the feed. The slope runs toward fewer, larger, more abstract mandates: not "pay this sub-cent invoice" a thousand times but "run this research program within the quarter's budget" or "keep this service profitable." This tracks the agent's own capability escalation — from chatting, to acting on a machine, to spawning and directing sub-agents; from issuing granular operations to wielding whole tools and skills. As capability and delegated trust climb together, the agent graduates from supervised microtransactions on a short leash toward standing allocations of capital governed by a goal rather than a payee list.

**Scope guard.** *(scope)* The frontier today is the capped pocket; the direction of travel is the goal-and-budget mandate. The off-switch can stay at every step. This leg stays on the premise (the stakes rise; the off-switch persists) and deliberately does not reach for the substrate conclusion — it does not argue that the rising stakes require a particular money. That inference, if drawn, belongs to [[Case-FA|The Case]].

---

## §8 — The agent-to-agent frontier

AE7.

**Statement.** *(structural)* Agent-to-agent commerce — agents transacting with each other, with no human on either side of the trade — is a new economic layer, not the automation of an existing human market, because its participants did not previously exist.

**Deployed form.** *(structural)* The first three legs describe agents transacting with the human economy at a remove. A2A is the leg that is unambiguously new and is already live in narrow form: an agent buys LLM inference from a provider that is itself an automated service — paying per request, discovering the provider programmatically, settling without an account or a card on file. The first deployed instances are inference marketplaces where the buyer is software, the seller is software, the price is published agent-to-agent, and the payment is a bearer token rather than a human-held credential. (Routstr and PPQ are the cleanest live instances-as-type; deployment detail defers to [[Field-Notes-FA|Field Notes]].)

**Why it is a new layer, not faster human commerce.** *(structural)* A human cannot occupy either side of a million sub-cent inference trades per day; two agents can. Once both buyer and seller are software, every assumption baked into human commerce ceases to apply: that a person reviews the charge, that disputes route through a human support line, that identity means a legal person. The participants are net-new, so the layer is net-new.

**Why this leg most directly opens the substrate question.** *(structural → scope)* An economic layer whose participants cannot pass KYC, cannot wait on human-paced settlement, and cannot rely on a counterparty's good faith has *requirements*. Those requirements are exactly the four conjunctive constraints argued at [[Case-FA|The Case]] (C1). This surface establishes that the layer exists and has requirements; it hands the enumeration and substrate-selection of those requirements to [[Case-FA|The Case]]. The "agents cannot adopt this substrate easily" objection — a capacity objection rather than a premise objection — is owned by [[Adoption-Asymmetry-FA|The Adoption Asymmetry]] (AA-series).

---

## §9 — Counter-positions and falsification

This section names the strongest objections, engages them honestly, and states what evidence would shift the position.

### §9.1 — Counter-positions engaged

#### Counter-position 1 — "Today's agents are autocomplete with a billing relationship; calling this an economy is marketing."

**Strongest form.** A human signs up, a human funds the account, a human approves the spend. What exists is software executing human-made decisions faster, with the human still the actor. Labeling that an economy is premature; the autonomy is cosmetic.

**Where this is correct.** *(structural)* It is true today that a human sets the budget, approves the payee, and can pull the plug. No deployed agent is fully unsupervised. The counter accurately describes the supervision that exists.

**Where this fails.** *(structural)* The counter targets a claim the premise does not make. The premise is not that agents are unsupervised; it is that the human-unattended *share* of value flow is rising (AE5). Bounded delegation already moves value sub-threshold at machine speed with no human approving any single transaction; the existence of an off-switch does not make those transactions human-attended. The relevant quantity is the share, and the share is climbing. The counter is decisive only against a binary-autonomy claim that this surface explicitly disclaims (§7).

**Net assessment.** The objection is correct about present supervision and irrelevant to the premise. It becomes a genuine threat only if the human-unattended share fails to climb — which is the falsifier in §9.2.

#### Counter-position 2 — "Agents can just use the rails we already have (cards, Stripe, a stablecoin balance), so there is no distinct agent economy."

**Strongest form.** Even granting that agents act, they can act on existing rails. There is nothing economically novel here; it is the human economy with a software client.

**Where this is correct.** *(structural)* For low-frequency, larger-value agent transactions that resemble human purchases, existing rails do function. Some agent activity is genuinely human commerce with a software client, and that activity is served by incumbent rails today.

**Where this fails.** *(structural)* The argument generalizes from the subset of agent activity that resembles human commerce to all of it. The unit-economics inversion (AE3) identifies a transaction profile — high-frequency, sub-cent, continuous — that human-mediated rails were never built to carry and that no human-mediated economy produces. The Szabo extension (AE4) explains why that profile was unreachable for twenty-five years (human mental transaction cost) and why it is now reachable (the agent does not bear that cost). The existence of a distinct profile, not its substrate, is what this counter must defeat, and it does not.

**Net assessment.** Existing rails serve the human-resembling subset of agent activity. They do not serve the high-frequency sub-cent continuous profile, which is the distinct-economy claim. *Which* rail serves the distinct profile is the substrate question, owned by [[Case-FA|The Case]] — out of scope here.

#### Counter-position 3 — "The Szabo escape fails on his own grounds: someone still has to tell the agent what it wants."

**Strongest form.** Szabo rejected the intelligent-agent escape from mental transaction cost on preference-revelation grounds. Specifying an agent's preferences is itself cognitive labor; the human cost the agent was supposed to remove reappears at the specification step. The micropayment bottleneck is therefore not removed, only relocated.

**Where this is correct.** *(structural)* Preference revelation is a real cost. The agent does need to be told what its principal wants; that specification is cognitive work a human performs.

**Where this fails.** *(structural)* Bounded delegation (§7) bounds the preference-revelation cost to a one-time policy-setting act. The human sets a budget, a scope, a payee list, and an approval threshold once; the agent then carries the per-decision cognition across thousands of transactions. The bottleneck that made human micropayment markets fail was the *per-transaction* mental cost — paid again on every purchase. Preference revelation is paid once. Relocating a recurring per-transaction cost to a one-time setup cost is precisely the removal of the bottleneck, not its relocation in kind.

**Net assessment.** Szabo's objection correctly identifies a residual one-time cost and is answered by bounded delegation, which is why AE4 and AE5 are coupled. The objection does not restore the per-transaction cost that the inversion depends on removing.

#### Counter-position 4 — "Agents are too hard to set up to drive a real economy; adoption friction caps the premise."

**Strongest form.** Even if agents can transact, standing up an agent with custody, payment integration, and operational reliability is hard enough that deployment stays marginal; the premise overstates the achievable scale.

**Where this is correct.** *(structural)* Operational friction in deploying autonomous payment-capable agents is real and is engaged in [[Field-Notes-FA|Field Notes]].

**Where this fails as a premise-rejection argument.** *(scope)* This is a capacity objection, not a premise objection, and its full treatment is owned by [[Adoption-Asymmetry-FA|The Adoption Asymmetry]] (AA-series): the friction that slowed Bitcoin's *human* adoption was never the agent's, and agents can adopt machine-native payment primitives at a rate humans cannot. This surface notes the objection and hands it to the AA-series rather than relitigating capacity here.

**Net assessment.** Adoption friction is real and bounded; it shapes the *rate* of the premise's realization, not its *direction*. Capacity argument deferred to [[Adoption-Asymmetry-FA|The Adoption Asymmetry]].

### §9.2 — Falsification conditions

The premise is structural and forward-looking. The following conditions, if observed, would shift the position. Each falsifier maps to one or more claims in §1. Both falsifiers are measurable and are tracked in [[Field-Notes-FA|Field Notes]].

**Targets AE1, AE2 (the automation worry).** If principals keep a hard, per-transaction approval gate indefinitely — if the delegation curve stalls and humans never hand agents standing economic authority — then what exists is *automation*, not an economy: faster execution of human-made decisions with the human still making every economic call. The agent that must ask permission before every payment is a remote control, not an actor. The premise wagers the delegation curve does not stall, because the economic value of an agent is removing the human from the loop (AE2); a world of permanently per-transaction-gated agents is a world where AE1 and AE2 are false. Tracked signal: the direction of the delegation curve and the deployment count of bounded-delegation systems.

**Targets AE3, AE5, AE6, AE7 (the negligible-share worry).** If agent-initiated, human-unattended value flow stays a negligible fraction of commerce over the next several years — if the high-frequency machine economy never grows past a rounding error next to human-mediated payments — then the substrate question this premise opens is academic; it would not matter what money a trivial economy uses. Note the coherent adverse outcome: "enormous transaction count, negligible value" — the unit-economics inversion implies large *transaction* volume even at small *dollar* volume, so high counts do not by themselves defeat this falsifier. Tracked signal: the share of flow that is genuinely human-unattended, measured in value, not transaction count.

**Relationship to the rest of the site.** *(scope)* If either falsifier is observed, the premise weakens and the surfaces resting on it weaken with it — [[Case-FA|The Case]] (the substrate question becomes academic), [[Independence-Doctrine-FA|The Independence Doctrine]] (the parallel economy has nothing to be parallel about), and the deployment record in [[Field-Notes-FA|Field Notes]]. This is the cost of resting the site on an argued premise rather than a smuggled assumption: the premise is falsifiable in public, and its failure is visible.

---

## §10 — Position summary

*(structural, with forward-looking inferences explicitly tagged)* Autonomous software is becoming an economic actor, not just a tool: it holds keys, manages a treasury, and allocates budget against an objective without per-transaction human authorization (AE1). Two curves converge on the actor — the capability curve (technical) and the delegation curve (sociological); the delegation curve lags but does not reverse, because the value of an agent is removing the human from the loop (AE2). Agent-to-agent commerce is high-frequency, sub-cent, and continuous — a transaction profile human commerce never produces, hence a different economy, not human commerce sped up (AE3). The micropayment bottleneck Szabo named in 1999 was human mental transaction cost; an agent in a loop does not bear it (our extension, not Szabo conceding), and his preference-revelation objection is answered by bounded delegation, which pays the cost once (AE4). An economy is a rising *share* of human-unattended flow, not 100% autonomy; bounded delegation already moves the share while the off-switch persists (AE5), and the magnitude and abstraction of each delegation climb toward goal-and-budget mandates (AE6). Agent-to-agent commerce is a new economic layer, not automated human commerce, because its participants did not previously exist (AE7). This surface argues only that the economy forms; which money it uses is the downstream substrate question owned by [[Case-FA|The Case]] (AE8). Two measurable falsifiers — the delegation curve stalling (automation, not economy) and human-unattended value-share staying negligible (academic substrate question) — are stated in §9.2 and tracked in [[Field-Notes-FA|Field Notes]].

---

## §11 — References and provenance

**Primary canonical source.**
- [[Agent-Economy|The Agent Economy]] — the user-approved v0 canonical premise essay; source for the substantive claim and the four legs. This document is the For-Agents twin.

**Primary KB source.**
- [[The AI-agent monetary substrate case]] — the KB note carrying the premise behind the four-constraints argument; the substrate question it opens is owned by [[Case-FA|The Case]].

**Historical-source provenance (Szabo leg).**
- Nick Szabo, *Micropayments and Mental Transaction Costs* (1999). Quotations in §6 are verbatim from the 1999 essay; the agent-economy extension is this project's framing, not a position Szabo took. Fidelity guard: Szabo did not reverse, concede, or change his mind; do not re-edit §6 into "Szabo predicted/acknowledged."

**Cross-references to sibling site surfaces (For-Agents track).**
- [[Case-FA|The Case]] — the substrate-selection claim this premise hands off to (C-series; C1 = four conjunctive constraints, C3 = BPI empirical anchor). The premise opens the substrate question; The Case answers it.
- [[Adoption-Asymmetry-FA|The Adoption Asymmetry]] — the capacity argument (AA-series); owner of the "too hard for agents to adopt" objection (§9.1 CP4).
- [[Independence-Doctrine-FA|The Independence Doctrine]] — why the economy this premise describes forms parallel to the incumbents rather than inside them (D-series).
- [[Field-Notes-FA|Field Notes]] — the standing live record; deployment instances treated here as types (Lightspark Grid, Routstr, PPQ) defer their counts, versions, and rosters here, along with the running test of the two falsifiers.

**Human-track canonical surfaces.**
- [[Agent-Economy|The Agent Economy]] — narrative-form premise (this document is its For-Agents twin).
- [[Case|The Case]], [[Adoption-Asymmetry]], [[Independence-Doctrine]], [[Field-Notes]] — narrative/human versions of the For-Agents surfaces above.

**Date stamps.** Document created 2026-06-05; last verified 2026-06-05. The premise is structural and grounded in deployed-system types; deployment instances are anchored as types with version-specific detail deferred to [[Field-Notes-FA|Field Notes]]. Forward-looking inferences (AE6, AE8, and the falsifier horizons) are anchored to a multi-year horizon from publication.

---

> [!info] Where to read next
> The substrate question this premise opens — which money the agent economy requires, and why it is Bitcoin: [[Case-FA|The Case]] (C-series). The capacity argument (why agents adopt the substrate trivially): [[Adoption-Asymmetry-FA|The Adoption Asymmetry]] (AA-series). The parallel-not-integrated shape of the economy: [[Independence-Doctrine-FA|The Independence Doctrine]] (D-series). The standing deployment record and the running test of this surface's two falsifiers: [[Field-Notes-FA|Field Notes]]. Canonical human narrative of this premise: [[Agent-Economy|The Agent Economy]].
