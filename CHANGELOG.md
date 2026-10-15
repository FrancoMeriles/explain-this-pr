# Changelog

## 1.1.0 — 2026-10-15

Renamed the project `pr-atlas` → `explain-this-pr` for discoverability — the skill name now matches how people search.

- Skill name, repository, and install command renamed. Old URLs redirect.
- Output directory renamed `.pr-atlas/` → `.explain-this-pr/`; temp-clone report dir `pr-atlas-<repo>-pr<n>/` → `explain-this-pr-<repo>-pr<n>/`.
- Shell and landing titles now read "Explain this PR".
- Fixed figure build path in metaphor-design reference to live under `pr-<n>/`.

## 1.0.0 — 2026-10-15

First public release.

- Orchestrated walkthrough: diff evidence -> Archify diagram views -> optional Anatomy figure -> assembled `index.html` shell.
- Per-PR output at `.explain-this-pr/pr-<n>/` with a regenerated landing page listing all atlases in the repo.
- PR-head inspection in a detached `git worktree` — the user's checkout is never moved.
- Repo bootstrap policy: search existing clones, then ask before cloning (persistent vs ephemeral temp clone).
- `scripts/assemble.mjs`: manifest -> tabbed shell + landing page, with missing-artifact warnings.
