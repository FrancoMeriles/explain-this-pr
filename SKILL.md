---
name: pr-atlas
description: "Generate an interactive PR walkthrough site that orients a reviewer: validated Archify diagrams (architecture, dataflow, sequence, lifecycle, erd, class, tree, workflow) plus an optional crafted isometric Anatomy figure that explains the change's core idea as a physical machine, assembled into a standalone local HTML atlas. Use when someone wants to understand, explain, or onboard a reviewer to a pull request, branch diff, or changeset — a visual tour of what changed, how data and control flow move through it, and why. Works from a checked-out branch or a GitHub PR via gh. This is not a code review tool: it produces orientation maps, not findings, approvals, or critiques."
license: MIT
compatibility: "Needs Node.js 20.10+ and Chrome/Chromium (archify's browser-check and anatomy's captures). Git required; gh preferred for PR metadata but optional. Requires the archify skill installed; the anatomy skill only for the optional figure."
metadata:
  version: "1.0"
---

# PR Atlas

Build a standalone HTML site at `<repo>/.pr-atlas/pr-<n>/index.html` (one folder per PR, so atlases never overwrite each other; use `branch-<slug>/` when there's no PR number) that teaches a pull request to its reviewer through generated visuals:

- **Diagrams via the `archify` skill** — validated, explorable HTML diagrams (inline SVG, dark/light themes, exportable) authored from real repository evidence.
- **A hero figure via the `anatomy` skill** — an optional crafted isometric machine whose working *is* the PR's core mechanism (a lock for cache keys, a valve for backpressure).
- **A shell** — `index.html` with the PR's header, stats, and one tab per artifact, assembled by `scripts/assemble.mjs`. Artifacts are referenced, never modified: their own validation receipts stay authoritative.

## Dependencies

Paths below use placeholders: `<pr-atlas>` is the directory containing this SKILL.md, `<archify>` and `<anatomy>` are those skills' install directories (usually `~/.agents/skills/<name>/` when installed via `npx skills add`, or the agent's skills directory).

Run this preflight once at the start, before any evidence work:

```bash
node --version                                              # >= 20.10 required (archify CLI, assemble.mjs, anatomy kit)
ls <archify>/SKILL.md                                       # required — the atlas IS archify diagrams
ls <anatomy>/SKILL.md                                       # needed only if a figure was requested; also provides capture.mjs
command -v gh                                               # preferred for PR metadata/diffs; git or a pasted diff degrade gracefully
command -v git                                              # required
```

Chrome/Chromium is needed by archify's `browser-check` gate inside `finalize` and by anatomy's `capture.mjs`; if those commands fail on missing browser, say so rather than pretending verification ran.

Degradation policy — missing tools change scope, not honesty:

| Missing | What happens |
|---|---|
| `archify` | **Stop.** It's the core. Tell the user: `npx skills add tt-a1i/archify@archify -g -y` |
| `node` | **Stop.** Everything downstream needs it |
| `anatomy` | Skip the figure; verify the shell with any other headless browser or report it unverified. Install: `npx skills add wheresryan22/anatomy@anatomy -g -y` |
| `gh` | Use `git` (`git diff <base>...HEAD`, `git log`) or a user-pasted diff; note it in the report |
| `git` / no repo and no diff | Ask the user for the diff or PR — do not invent the change |
| Chrome/Chromium | `browser-check` fails inside `finalize`; artifacts may still `deliver` but report validation as incomplete |

## Workflow

Work these phases in order. Phases 1–3 are cheap and decide everything downstream.

### 1. Gather PR evidence

Read [pr-evidence](references/pr-evidence.md). Collect the diff, commit list, PR description and existing review comments (via `gh` when available, plain `git` otherwise), and identify which subsystems the change touches. Diagrams authored without this evidence become guesses.

Archify needs a clean checkout at the PR head for `--repo-root` — but **never move the user's checkout**: inspect the PR head in a detached `git worktree` instead (see "Getting the repo"). If the user gave a PR URL and the repo isn't checked out locally, search for it first, then **ask the user** — persistent clone (report lives in `<repo>/.pr-atlas/pr-<n>/`) or temp clone (ephemeral checkout for evidence only; the report is moved out and the clone deleted). Details in "Getting the repo" in that reference.

### 2. Size the PR

Count changed files and added/deleted lines, then choose the number of views:

| Size | Signal | Views |
|---|---|---|
| Small | <10 files or <300 changed lines | 1–2 |
| Medium | 10–40 files | 2–3 |
| Large | >40 files | 3–5 |

A small PR should feel like a compact reviewer aid, not an architecture document. Never generate a view just because the type exists — each view must explain something the diff actually changes.

### 3. Decide the figure

Unless the user already said, ask whether they want the isometric figure, and give the honest cost: a *Figure*-sized anatomy build can take up to an hour; a *Hero* takes 2–4 hours. Default to **diagrams only** if they decline or the answer is ambiguous. Never start a Hero without explicit consent.

### 4. Map views to the diff

Read [view-mapping](references/view-mapping.md). Pick the archify diagram types that match signals in the diff (API calls → `sequence`, status fields → `lifecycle`, schema → `erd`, and so on). Every PR touching more than one subsystem gets an overview view (`architecture` or `tree`).

### 5. Generate the diagrams

For each chosen view, follow the **archify** skill's authoring workflow end to end — invoke the skill (or read `<archify>/SKILL.md`) and obey its fast authoring path:

- Author the candidate JSON from repository evidence, per archify's `references/repository-authoring.md`.
- Run `node <archify>/bin/archify.mjs finalize <type> <candidate.json> <output.html> --repo-root <repo-root> --quality showcase --json` — `<repo-root>` is the PR-head worktree.
- A non-zero exit is never success; repair per archify's delivery contract.

Write candidates under `<repo>/.pr-atlas/pr-<n>/work/` and copy each passing HTML into `<repo>/.pr-atlas/pr-<n>/diagrams/<view-slug>.html`. Do not edit finalized HTML — copy it whole.

### 6. Build the figure (if chosen)

Read [metaphor-design](references/metaphor-design.md) to map the PR's core mechanism to a physical object, then follow the **anatomy** skill's workflow — invoke it or read `<anatomy>/SKILL.md`. Build under `<repo>/.pr-atlas/pr-<n>/figure-src/` with a `build.mjs` that imports anatomy's kit (`<anatomy>/kit/iso-kit.mjs`), and copy the resulting page to `<repo>/.pr-atlas/pr-<n>/figure.html`. Default size is *Figure*. The figure depicts the **after** state — what the PR makes true.

### 7. Assemble and verify

Write `<repo>/.pr-atlas/pr-<n>/manifest.json` listing every artifact (see schema below), then:

```bash
node <pr-atlas>/scripts/assemble.mjs <repo>/.pr-atlas/pr-<n>/manifest.json
```

It writes `index.html` next to the manifest, and also regenerates `<repo>/.pr-atlas/index.html` — a landing page listing every `pr-*/` or `branch-*/` folder that carries a manifest. Check the manifest warnings for missing artifact files, then verify the shell renders in a real browser:

```bash
cd <repo>/.pr-atlas/pr-<n> && node <anatomy>/scripts/capture.mjs index.html \
  --out shots/index.png --width 1440 --height 900
```

The capture prints console errors and sideways-scroll warnings; read the PNG to confirm the header, tabs, and first artifact actually painted.

If the work ran in a temp clone, move the finished `pr-<n>/` folder to the report location (default `pr-atlas-<repo>-pr<n>/` in the user's working directory) **before deleting the clone**, and delete the clone. Confirm the moved `index.html` still opens — its artifact paths are relative, so the folder must travel as a unit.

## Manifest schema

```json
{
  "pr": {
    "title": "Add retry backoff to webhook dispatcher",
    "number": 482,
    "url": "https://github.com/org/repo/pull/482",
    "author": "octocat",
    "base": "main",
    "head": "feat/webhook-backoff",
    "stats": { "files": 12, "additions": 340, "deletions": 55 }
  },
  "artifacts": [
    {
      "id": "figure",
      "kind": "figure",
      "title": "The Mechanism",
      "path": "figure.html",
      "description": "A ratchet-and-pawl machine: each failed delivery advances the pawl one notch further before release."
    },
    {
      "id": "overview",
      "kind": "architecture",
      "title": "System overview",
      "path": "diagrams/overview.html",
      "description": "The dispatcher subsystem with the new backoff scheduler."
    }
  ]
}
```

`path` is relative to the manifest's directory. `kind` is free text; `"figure"` gets pinned first and labeled in the UI.

## Reporting

Reply in the user's language, briefly. Lead with a clickable link to `index.html` (absolute path, `<...>` if it contains spaces), then one line per artifact saying what view it teaches. State what was verified: each archify diagram carries its own `finalize` receipt; the figure carries anatomy's audit; the shell was captured or explicitly reported as unverified. If the figure was skipped, say so in half a sentence.

Example: `Created [PR #482 walkthrough](/abs/path/.pr-atlas/pr-482/index.html) — 3 diagrams (overview, retry sequence, backoff lifecycle) plus the ratchet figure. Archify gates passed; shell screenshot verified.`

## Boundaries

- **Orientation, not review.** No findings, severity lists, or approve/request-changes recommendations.
- **After state.** Diagrams and the figure explain what the PR makes true, not the before/after diff itself. Call out removals only when understanding the change requires it.
- **Evidence over invention.** If `gh` and git evidence are both unavailable, ask for the diff rather than guessing.
