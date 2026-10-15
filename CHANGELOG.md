# Changelog

## 1.0.0 — 2026-10-15

First public release.

- Orchestrated walkthrough: diff evidence -> Archify diagram views -> optional Anatomy figure -> assembled `index.html` shell.
- Per-PR output at `.pr-atlas/pr-<n>/` with a regenerated landing page listing all atlases in the repo.
- PR-head inspection in a detached `git worktree` — the user's checkout is never moved.
- Repo bootstrap policy: search existing clones, then ask before cloning (persistent vs ephemeral temp clone).
- `scripts/assemble.mjs`: manifest -> tabbed shell + landing page, with missing-artifact warnings.
