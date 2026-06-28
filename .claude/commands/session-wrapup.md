---
description: End-of-session wrap-up — docs, comments, memory, git, security, cleanup
---

Please perform an end-of-session wrap-up:

1. **Documentation review**: Recheck CLAUDE.md and any other project
   documentation (README.md, USERGUIDE.md, PLAN.md, TASKS.md, OWNER_GUIDE.md,
   the `docs/` folder, or similar files we've created) and update them to
   accurately reflect the current state of the project.

2. **Code-Comment Agreement**: Review any code you've changed during our
   current session and ensure that any and all comments in the code agree
   with what the code actually *does*. Add comments explaining any code
   section for which there are none.

3. **Memory update**: Review our session and update your memory with any
   important decisions, patterns, or context that should persist to future
   sessions.

4. **Git status**: Check for any uncommitted changes. If there are staged
   or unstaged changes, summarize them and ask me to confirm before
   committing. Use a clear, descriptive commit message. Make sure .gitignore
   includes anything and everything git should ignore. If you're not sure,
   ask me for verification.

5. **Loose ends**: Flag anything else that seems unfinished, inconsistent,
   or worth noting before we close the session.

6. **Dependency check**: If the project uses a requirements.txt, Pipfile,
   pyproject.toml, package.json, or similar, verify it accurately reflects any
   packages added or removed this session (and that the lockfile is in sync).

7. **Dead code**: Flag any functions, variables, or imports added during
   this session that are no longer referenced or needed.

8. **Security scan**: Confirm no API keys, tokens, passwords, or sensitive
   credentials have been hardcoded in any file that will be committed.
   Look for any other obvious glaring vulnerabilities or security issues
   and flag them, with recommended corrections.

9. **Project Clean-Up**: Review .MD files, variables, and all project files.
   Deprecate files no longer needed and update core files to ensure we
   maintain a clean and accurate project structure to continue building upon.

When complete, give me a brief summary of everything you updated or found.
