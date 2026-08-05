# CLAUDE.md — Minimal Music Player

Working agreements for this repository. This file covers versioning and commit
messages only; the README describes the card and its options, and the "Browser
support" section there is the authority on what syntax the card may use.

Note on language: the code, comments and commit messages here are in English —
keep them that way, even though the owner's other repositories are in Dutch.

## The version lives in one place

`CARD_VERSION` at the top of `minimal-music-player.js`. It is the only place,
and it is what the card logs to the browser console — which is how you find out
what a user is actually running.

## Every change to the card bumps the version

In the same commit as the change itself. Patch for a fix, minor for something
new. README-only changes need no bump — that is why `Add MIT licence` sits on
top of `1.4.0` without raising it. The history mostly does this already; the
exception is `7dec938 Bump card version to 1.1.0`, a bump commit on its own,
which is the shape to avoid.

## The new version goes at the front of the commit subject

`v1.4.1 — what changed`, with an em dash.

Only on commits that actually raise `CARD_VERSION`. No prefix therefore means
the version was not touched, which makes a forgotten bump visible in the log.
Merge commits created by GitHub get nothing; the branch commit underneath
carries the number.

The reason: the card reports a number and you want to get from that number back
to a commit. This repository has no releases and no tags, so `git log --oneline`
is the only place that connection exists:

```
1a2b3c4 v1.4.1 — Keep the progress bar visible while seeking
5d6e7f8 Explain the chip row in the README
9a8b7c6 v1.4.0 — Fade the chip row instead of clipping it
```

Nothing enforces this; `compat.yml` only checks the syntax floor.
