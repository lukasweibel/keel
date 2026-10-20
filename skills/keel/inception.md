# Inception

Goal: requirements and units of work you can build from without further questions.

1. **Workspace detection.** Read the relevant parts of the codebase. Note existing patterns the feature should use.
2. **Requirements analysis.** Ask the open questions in one batch, each with a suggestion. Record the answers under Decisions in `keel-state.md`. Then fill `requirements.md`:
   * intent in one sentence, plus what is out of scope
   * requirements R1, R2 and so on, each marked functional or non functional, each with acceptance criteria AC1.1, AC1.2 and so on. Every criterion is testable: situation or input and expected result.
   * risks and assumptions
   * a category checklist in `requirements.md`: mark each of happy path, failure/error, empty/edge, persistence/restart, ordering/concurrency, exclusions/boundaries, documentation and manual proof, backward compatibility, performance/scale, and secrets/privacy as covered or N/A with a reason
3. **Units generation.** Split the work into units of work U1, U2 and so on in `units-of-work.md`, each small enough for a single gate 2. Per unit: covered criteria, touched files, dependencies.
4. **Gate 1.** Self-review against the criteria first, including the category checklist, then follow the flow in `SKILL.md`. After approval set the phase to `construction` and copy the units into the table in the state file.

Keep everything as short as possible. A small feature may consist of a single unit of work.
