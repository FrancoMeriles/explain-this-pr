# Metaphor design

The anatomy figure earns its place when the PR has a **mechanism** — a rule, a flow, a transformation — that a physical object can embody. This file picks the object; the anatomy skill owns all craft rules. Do not start geometry here.

## The mapping rule

Write one sentence: *"This PR makes ___ happen."* The machine is whatever real object does that thing. The reader must understand the PR by recognizing the object — never draw labelled boxes.

| PR mechanism | Physical object |
|---|---|
| Cache key / skip work when nothing changed | Pin-tumbler lock: plug turns only when every pin matches |
| Retry with backoff | Ratchet and pawl, each notch further before release |
| Circuit breaker | Trip switch with a visible spring-loaded toggle |
| Rate limiting / throttling | Gate valve or sluice on a channel |
| Queue / buffering | Conveyor with parcels, or a ticket rail |
| Feature flag / mode switch | Selector dial with detents |
| Feature toggle per cohort | A row of knife switches, some closed |
| Mutex / lock ordering | A real keyed lock on a hasp over the shared part |
| Batching / windowing | Mail sorter dropping letters into pigeonholes |
| Migration / backfill | Conveyor moving drawers from an old cabinet to a new one |
| Debounce / settle | Pneumatic door damper on a spring door |
| Rolling window / ring buffer | Ferris-wheel-like drum of slots, oldest ejected |
| Pipeline stages | Bench machine: stock enters left, finished parts exit right |
| Fan-out / broadcast | One camshaft lifting many followers |
| Fan-in / aggregation | Hopper funnels into a single chute |
| Backpressure | Float valve that closes the inlet as the tank fills |
| Dead-letter / fallback path | Mail chute with a diverter flap and a second box |
| Idempotency | Turnstile that counts each coin once no matter the pushes |
| Snapshot / checkpoint | Camera shutter freezing a moving carriage |
| Hot/cold path split | Railway points lever routing cars onto two sidings |
| Graceful shutdown / drain | Lock gate emptying a lock chamber before gates open |

If nothing in the table fits, browse anatomy's own concept→object table in its SKILL.md for patterns, then invent. Two failure modes to avoid: **too abstract** (stacked plates, floating slabs read as nothing) and **too flat** (one slab with lines has no volume). The fix is always a recognizable machine built from many small parts.

## What the figure shows

- The **after** state: the mechanism as the PR leaves it. If the PR changes behavior, the moving parts and the readout demonstrate the new behavior.
- One accent, one idea: anatomy's tone hierarchy makes the watched part `lit` — that part is the PR's heart (the pawl, the valve, the flap).
- The live readout shows a **true** number from the change (attempt count, delay in ms, queue depth), driven by a small model module per anatomy's "truth first" step.

## Size

Default is **Figure** (40–80 parts, one mechanism, at most one WebGL layer). Suggest *Hero* only when the PR is large and the user explicitly wants a flagship piece; never start an *Epic*.

## Build location

```
<repo>/.pr-atlas/figure-src/
├── build.mjs    # imports <anatomy>/kit/iso-kit.mjs
└── model.mjs    # the pure truth module, if the figure needs one
```

`node build.mjs` writes the page; copy it to `<repo>/.pr-atlas/figure.html` (build `--light` too if the user wants both themes inline — anatomy pages ship both).

## Skip conditions

Do not push for a figure when the PR is mechanical (renames, docs, lockfile updates) or purely subtractive (dead-code removal has no mechanism to show). Say so and move on — a forced metaphor is worse than none.
