<!--
Pick the template that matches the change:
  feature -> add ?template=feature.md to this URL, or `gh pr create --template feature.md`
  bugfix  -> add ?template=fix.md to this URL,     or `gh pr create --template fix.md`
This default covers anything else (chore, docs, ci, refactor).
-->

## Type
- [ ] feature (`feat:` -> minor)
- [ ] fix (`fix:` -> patch)
- [ ] other (`chore:`, `docs:`, `ci:`, `refactor:` ...)

## What changes and why
<!-- 1-3 sentences. Link the Weekly board card if there is one. -->

## Tests
<!-- What proves it works: new tests, command run, evidence (screenshot, log). -->

## Checklist
- [ ] Conventional Commits, everything in English
- [ ] Local gates green: `npm run lint && npm run typecheck && npm test && npm run build`
- [ ] Checked in both launch phases (`LAUNCH_PHASE=pre` and `post`) if the change touches CTAs or the waitlist path
- [ ] No secrets or `.env` files in the diff
