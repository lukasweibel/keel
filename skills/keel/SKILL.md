---
name: keel
description: Minimal AIDLC workflow for features with Inception, Construction, quality gates and an independent reviewer. Use when the user invokes /keel init, /keel feat, /keel fix or /keel status, wants to build a feature the AIDLC way, wants a lightweight path for a small obvious fix, wants to resume a feature from doc/, or asks for its status.
---

# keel

A minimal take on AIDLC (AI Driven Development Life Cycle). You take a feature through two phases: **Inception** and **Construction**. Between the stages sit **quality gates**. A gate is passed only when the reviewer reports PASS and the human explicitly approves.

## Ground rules

1. The state file is the truth. At the start of every session read `doc/<feature>/keel-state.md` and never work from memory. Update it after every completed step, before you reply.
2. No code before gate 1 is approved. No unit of work starts before the previous one has passed gate 2.
3. AI proposes, human approves. Only a clear "yes", "ok" or "approved" from the human counts. Without it you never record an approval.
4. Collect questions and ask them in one batch, at most five at a time, each with your suggested answer.
5. Stay in scope. If a new requirement shows up, stop, add it under Open items in the state file and return to Inception. Gate 1 then applies again, but only to the change. For `Profile: fix`, this also applies when the fix turns out bigger than expected: switch to `Profile: full` first.
6. Read `doc/notes.md` at the start of every session too, the same as the state file. Keep it current: add a line whenever you find something that will save time next session, fix or remove a line that stopped being true. It needs no approval and is never part of a review.

## Layout in the project

```
doc/
├── project.md               check commands and conventions, once per project
├── overview.md              what the project is and does, once per project
├── architecture.md          components, data flow, key conventions, once per project
├── decisions.md             project-wide decisions that outlast a single feature
├── notes.md                 your own scratchpad, never reviewed by the human
└── <feature>/
    ├── keel-state.md        phase, gates, units, decisions, audit log
    ├── requirements.md      intent, requirements, acceptance criteria
    ├── units-of-work.md     units with covered criteria, files, dependencies
    └── reviews/             one reviewer report per gate run
```

Feature names use lowercase letters and underscores, e.g. `login_page`.

## Start

Read the request (text after the command or the user's message). The first word selects the command. If it is none of the four below, treat the whole request as `feat`.

1. **`init`** — create or refresh the project-level docs, never a feature.
   * `doc/project.md`: missing → create from `templates/project.md`, derive the check commands from the project (package.json, Makefile, pyproject.toml and so on) and ask the user to confirm them. Present → show its current content and ask whether anything changed (check commands, conventions, extra criteria).
   * `doc/overview.md` and `doc/architecture.md`: missing → create from their templates, fill in what you can derive from exploring the codebase, and show the result for a quick correction. Present → re-check against the current codebase and propose updates if something drifted.
   * `doc/decisions.md`: missing → create from `templates/decisions.md`, empty. Append only from here on, during `init` or any later phase, whenever a decision outlasts a single feature.
   * `doc/notes.md`: missing → create from `templates/notes.md`, empty. Yours alone, see Ground rules.
   * Gate guard hook, once, skip if already present: copy `templates/hooks/claude-gate-guard.sh` to `.claude/hooks/keel-gate-guard.sh` and `chmod +x` it, then add a `PreToolUse` entry for it to `.claude/settings.json` (matcher `Edit|Write|NotebookEdit`, command `"$CLAUDE_PROJECT_DIR"/.claude/hooks/keel-gate-guard.sh`), keeping everything else in that file untouched. If this project also uses OpenCode, copy `templates/hooks/opencode-gate-guard.js` to `.opencode/plugins/keel-gate-guard.js` too, no config entry needed there. Tell the user both exist and that the Claude Code one needs `jq` installed. This mechanically enforces Ground rule 2, it does not replace it.
   Stop here, this command does not touch any feature.
2. **`status`** — list all features with phase and next step from their `keel-state.md` and ask where to continue. If there are none yet, say so and point to `feat`.
3. **`feat <rest>`**:
   * If `doc/project.md` is missing, bootstrap it as under `init` first.
   * If `<rest>` names an existing feature folder, read its state file and continue with the next step.
   * Otherwise it is a new feature: suggest a name, create the folder, copy `templates/keel-state.md`, `templates/requirements.md` and `templates/units-of-work.md` into it, leave `Profile: full` and start Inception.
   * Then read the guide for the current phase in this skill folder: `inception.md` or `construction.md`.
4. **`fix <rest>`** — same entry point as `feat`, but for a small, obvious fix where cause and change are already clear. Set `Profile: fix` instead of `full`. Skip the Inception ceremony:
   * No question batch, no Gate 1 review by the reviewer subagent.
   * Write `requirements.md` yourself: one-sentence intent, a single requirement R1 with one acceptance criterion AC1.1. Write `units-of-work.md` with a single unit U1 covering AC1.1.
   * Show both in a few lines and ask one short confirmation ("fix as described, ok?"). Record the answer under Decisions, set `Phase: construction` and reduce the Gates table to a single Gate 2 row.
   * Continue straight into `construction.md` for U1. U1 is the whole feature, so its approved Gate 2 also closes the feature: skip Gate 3, set `Phase: done` and add the closing audit log entry once Gate 2 is approved.
   * If the fix turns out bigger than expected while working: stop, add it under Open items, switch `Profile` to `full`, write the full `requirements.md`/`units-of-work.md` and run Gate 1 before continuing (Ground rule 5).

## Quality gates

The criteria live in `gates.md`. Every gate runs the same way:

1. Freeze the candidate, run the check commands from `doc/project.md` once, and fix failures yourself first. Then self-review against the gate criteria and fill the review packet in `keel-state.md`.
2. Call the `reviewer` subagent. Hand it:
   * gate number and subject (for gate 2 the unit of work)
   * path of the feature folder
   * the criteria of the gate verbatim from `gates.md` plus the extra criteria from `doc/project.md`
   * the check commands from `doc/project.md`
   * the review packet from `keel-state.md`
   * the template `templates/review.md`
   * for a re-review, the previous review report and the diff range since it
3. Save its answer unchanged as `reviews/gate<nr>_<subject>.md` and record the verdict in the state file.
4. Verdict REWORK: fix the required items and send a delta re-review. The reviewer re-checks only the required items and the criteria the new diff touches. After two failed rounds stop and ask the human.
5. Verdict PASS: summarize the review in at most three lines and ask for approval. Update the state file and move on only after approval.

## Review economy

Three rules keep the gates fast without weakening them:

1. **One frozen candidate, one check run.** Freeze the diff, run the checks once and record command, result and diff hash in the review packet. The reviewer reruns checks only when the packet has no fresh result for that hash, when the hash does not match, or at Gate 3.
2. **Delta re-review.** A re-review gets the previous report and the diff since it. It judges only the required items and the criteria the new diff touches; criteria already met and untouched are carried over with a reference, not re-litigated.
3. **Self-review first.** Before calling the reviewer, check the gate criteria yourself, including the requirement categories in `inception.md`. Fix what fails before the reviewer sees it.

The reviewer still decides independently and still runs checks when in doubt. Speed comes from a smaller review surface, not from a weaker verdict.

If no subagent is available, review yourself in a separate pass, strictly following `gates.md`, and enter "self review" as reviewer in the report.
