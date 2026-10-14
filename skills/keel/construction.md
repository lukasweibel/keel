# Construction

Work through the units of work in the order given in `units-of-work.md`. For each unit:

1. Set the current unit and the next step in the state file.
2. **Code generation.** Write tests for the acceptance criteria of the unit first, if the project has tests. Then implement only what the unit requires, no side quests, following the patterns noted in Inception.
3. **Build and test.** Run the check commands from `doc/project.md` until everything is green.
4. **Gate 2** for this unit. After approval set the unit to `done` in the state file.

When all units are done:

5. **Gate 3.** Build and test of the whole feature. After approval set the phase to `done` and add a closing entry to the audit log.

Commit only if the user asks for it or `doc/project.md` says so. Then one commit per approved unit.
