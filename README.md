# keel

One repo for all skills, commands and agents. Works with Claude Code and OpenCode.

## Layout

```
skills/<name>/SKILL.md            shared by both tools
commands/<name>.md                commands for both tools
agents/<name>.md                  agent body, without head
targets/claude/                   only for Claude Code
targets/opencode/                 only for OpenCode
    agents/<name>.head            head, assembled with agents/<name>.md
    agents/<name>.md              complete agent for this tool only
    commands/<name>.md            command for this tool only
sync.sh                           syncs everything to the tools
```

## Sync

```
./sync.sh                  both tools
./sync.sh opencode         OpenCode only
COPY=1 ./sync.sh           copy instead of symlink
```

Where things go:

| Part | Claude Code | OpenCode |
|---|---|---|
| Skills | `~/.claude/skills/` | also reads `~/.claude/skills/` |
| Commands | `~/.claude/commands/` | `~/.config/opencode/commands/` |
| Agents | `~/.claude/agents/` | `~/.config/opencode/agents/` |

Skills and commands are symlinked, so repo changes apply after starting a new session. Agents with a head are assembled, so run the script again after changing them. If a tool does not pick up symlinked skills, use `COPY=1`.

## Adding your existing items

1. Skill: move the folder into `skills/`. Runs in both tools unchanged.
2. Command for both tools: put it in `commands/`. Head with `description` only, arguments via `$ARGUMENTS`.
3. Agent for both tools: body without head into `agents/`, one head each into `targets/claude/agents/` and `targets/opencode/agents/`.
4. Agent or command for one tool only: the complete file into the matching `targets/` folder.

The heads differ: Claude Code wants `name`, `description`, `tools`. OpenCode wants `description`, `mode: subagent` and `permission`, and takes the name from the file name.

## keel

A minimal AIDLC (AI Driven Development Life Cycle by AWS). Same terms as AIDLC, only the command is `/keel`.

```
Inception ──► Gate 1 ──► Construction: U1 ► Gate 2, U2 ► Gate 2 ... ──► Gate 3 ──► done
```

| Phase | Stages |
|---|---|
| Inception | Workspace detection, Requirements analysis, Units generation, Gate 1 |
| Construction | per unit: Code generation, Build and test, Gate 2. Then Gate 3 for the whole feature |

Every quality gate: check commands, then the reviewer, then your approval. AI proposes, human approves.

Same call in both tools:

```
/keel init                        create or refresh doc/project.md
/keel feat login page with passkey   new feature
/keel feat login_page             resume a feature
/keel status                      overview of all features
```

What it creates in the project:

```
doc/project.md                    check commands, conventions, extra criteria
doc/overview.md                   what the project is and does
doc/architecture.md               components, data flow, key conventions
doc/decisions.md                  project-wide decisions that outlast a feature
doc/notes.md                      agent-only scratchpad, never reviewed by the human
doc/<feature>/keel-state.md       phase, gates, units, decisions, audit log
doc/<feature>/requirements.md     intent, requirements, acceptance criteria
doc/<feature>/units-of-work.md    units with criteria, files, dependencies
doc/<feature>/reviews/            reviewer reports
.claude/hooks/keel-gate-guard.sh  PreToolUse hook, see Gate guard hook
.opencode/plugins/keel-gate-guard.js   same, for OpenCode
```

Since the state lives in the project per feature, you can start a feature at work in OpenCode and continue at home in Claude Code.

### Gate guard hook

`/keel init` also installs a small hook per tool that mechanically enforces Ground rule 2 ("no code before gate 1 is approved"): it blocks `Edit`/`Write` outside `doc/` while the most recently touched feature's `keel-state.md` still says `Phase: inception`. It is a backstop, not a replacement for the rule, since it only looks at phase, not at unit ordering within Construction.

* Claude Code: `.claude/hooks/keel-gate-guard.sh`, wired up as a `PreToolUse` hook in `.claude/settings.json`. Needs `jq`.
* OpenCode: `.opencode/plugins/keel-gate-guard.js`, auto-loaded, no config needed. Known limitation: OpenCode plugin hooks currently do not see subagent tool calls ([anomalyco/opencode#5894](https://github.com/anomalyco/opencode/issues/5894)), so edits made by a subagent are not covered yet.

### Possible next steps

1. More Construction stages from AIDLC: Functional design, NFR design, Infrastructure design.
2. More reviewers for single gates, e.g. security.
3. The Operations phase.
4. Profiles like "small" (gate 2 only) and "full".
5. Hooks that run the check commands automatically before each gate.
