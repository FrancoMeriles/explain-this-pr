# PR evidence

Diagrams and the figure are only as true as the evidence behind them. Collect it before choosing views.

## With `gh` (preferred)

```bash
# Metadata, description, stats, discussion
gh pr view --json number,title,body,author,baseRefName,headRefName,files,additions,deletions,commits,comments,reviews,url

# The full diff (large PRs: page through it or --name-only first)
gh pr diff

# Review threads, including bot/agent comments
gh pr view --comments
```

`gh pr view` without a number resolves the current branch's PR. If the user named a PR by number or URL, use that. `gh pr diff <n>` accepts the same selectors.

## Without `gh`

```bash
git fetch origin <base>            # usually main or master
git merge-base HEAD origin/<base>  # the fork point
git diff <merge-base>...HEAD --stat
git diff <merge-base>...HEAD
git log <merge-base>..HEAD --oneline
```

If the user gives a PR number but no `gh`, ask for the repo remote or a diff file.

## Getting the repo for `--repo-root`

Archify verifies evidence against committed bytes at a pinned revision, so you need a local checkout at the PR head — but **do not move the user's checkout**. Their branch may have uncommitted work, and switching it is a side effect they didn't ask for. Use a detached worktree instead:

```bash
cd <repo>
git fetch origin pull/<n>/head                 # GitHub; GitLab: merge-requests/<n>/head
git worktree add "$(mktemp -d)/head" FETCH_HEAD --detach
```

The worktree shares `.git` (same objects, same origin) and sits at the PR commit without touching the user's working tree or current branch. Read source files and run `finalize --repo-root <worktree>` there; write the report into the **main** repo's `.explain-this-pr/pr-<n>/`. Remove it when done: `git worktree remove <path> --force`.

Before cloning, **search for an existing checkout first** — repos often live a few levels deep (e.g. `~/Documents/.../<org>/<repo>`), so a shallow `find` misses them:

```bash
find ~ -maxdepth 6 -name ".git" -type d -not -path "*/Library/*" -not -path "*/node_modules/*" \
  | while read d; do git -C "$(dirname "$d")" remote get-url origin 2>/dev/null; done \
  | grep -i "<repo-name>"
```

### No local checkout → ask before cloning

Never clone silently into the user's home or workspace. If the repo isn't found, ask where the work should live:

- **Persistent clone** — for public repos, or when the user wants the repo around anyway. `gh repo clone owner/repo <path>` (prefer `gh` over `git clone`: it carries auth, which matters for private repos where HTTPS clone fails and SSH may not be set up). Get the PR head in a detached worktree as above, then build the atlas inside the repo at `.explain-this-pr/pr-<n>/`.
- **Temp clone (ephemeral)** — for reviewing changes without keeping the repo. Clone into `mktemp -d`, run evidence and `finalize` there with `.explain-this-pr/pr-<n>/` inside the temp clone, then **move the finished `pr-<n>/` folder out** to the report location and **delete the temp clone**. The artifacts are self-contained HTML; nothing else is needed after `finalize` passes.

Default report location for temp clones: `explain-this-pr-<repo>-pr<n>/` under the user's current working directory (or a path the user names). Tell the user explicitly where the report landed and that the clone was removed.

A clone is disposable; the `.explain-this-pr` report is not. The two must part ways before the session ends — either the clone stays (persistent) or the report does (temp).

## `meta.repository.url`: use canonical HTTPS

`git remote get-url origin` often returns SSH (`git@github.com:owner/repo.git`), and archify's `validate` gate rejects it for web source links (`repository-evidence/links-unsupported`). Convert to the canonical form before writing the candidate:

```
https://github.com/<owner>/<repo>
```

Keep `provider: "github"` and the 40-char revision. If the forge is unsupported or links should stay local, set `link_mode: "local-only"` instead.

## What to extract

| Evidence | Used for |
|---|---|
| Changed file paths | Which subsystems are touched; drives view selection and the overview |
| Diff hunks | Relationship direction, new branches/conditions, call order — the facts inside each diagram |
| Commit list | Narrative order of the change; `timeline` view if the PR has a history worth showing |
| PR title + body | Shell header; the stated intent to check the diff against |
| Review comments | Points reviewers already stumbled on — a view that answers them earns its tab |
| Linked issues/specs | The "why" for captions and descriptions |

## After the diff: read the code

A diff shows deltas, not context. For each view you plan, read the touched files **at HEAD** (the after state) plus the immediate neighbors the diff calls into. Archify's `references/repository-authoring.md` explains how to cite this evidence inside candidate JSON — follow it, including `--repo-root`.

## Sizing signals

- Count files and changed lines (`--stat`) for the tier table in SKILL.md.
- One file with 400 changed lines is usually still a small PR; 40 files of renames with a 20-line logic change is medium at most. Weight *semantic* change, not line count.
- Merge commits, generated files, and lockfiles in the file list are noise — exclude them from both the count and the diagrams.

## Missing evidence

- No `gh`, no git repo, user pasted a diff: work from the paste; note in the manifest descriptions that views are diff-only.
- PR description empty: derive intent from commits and diff; say so in the report.
- Stale branch (`gh pr view` shows `mergeable: CONFLICTING` or the base moved on): still diagram HEAD, but mention staleness in the report.
