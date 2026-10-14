# Quality gates

Every criterion is rated met or not met and needs evidence: file and line, command output or a place in the documents. PASS only when all criteria are met.

## Gate 1: Inception

Subject: `requirements.md` and `units-of-work.md`

1. The intent is stated in one sentence and what is out of scope is listed.
2. Every requirement has at least one acceptance criterion.
3. Every acceptance criterion is testable: a clear situation or input and an expected result. No words like "fast" or "user friendly" without a measure.
4. Every acceptance criterion is covered by at least one unit of work.
5. Every unit of work names the files it touches and can be checked on its own.
6. There are no open questions left.
7. The plan fits the existing patterns of the codebase or justifies the deviation.

## Gate 2: Unit of work

Subject: the changes of the unit (git diff) and its acceptance criteria

1. All check commands from `doc/project.md` run without errors.
2. Every acceptance criterion of the unit has a test or a documented manual proof.
3. The changes stay within the scope of the unit. Other files are not changed without reason.
4. No secrets, credentials or personal data in the code.
5. No commented out leftovers, no debug code, no TODO without an entry in the state file.
6. The error cases from the acceptance criteria are handled.

## Gate 3: Build and test

Subject: the whole feature

1. All units of work passed gate 2 and are approved.
2. The full test suite runs without errors.
3. Every acceptance criterion from `requirements.md` is demonstrably met, listed as criterion to evidence.
4. Documentation is updated wherever the project keeps any.
5. The state file is complete: all decisions and deviations are recorded.

## Extending

Project specific criteria go into `doc/project.md` under Extra criteria and apply in addition to these.
