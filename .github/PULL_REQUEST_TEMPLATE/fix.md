<!-- FIX template. For a feature, switch to ?template=feature.md in the URL, or run `gh pr create --template feature.md`. -->

## Bug
<!-- Observable symptom + how to reproduce. -->

## Root cause
<!-- The real cause, not the symptom. -->

## Fix
<!-- The minimal change that addresses the cause. No "while I'm here". -->

## Regression test
<!-- The RED -> GREEN test: failed before the fix, passes now. -->

## Checklist
- [ ] Conventional Commits, at least one `fix:` (bumps semver **patch**), everything in English
- [ ] Regression test that fails without the fix
- [ ] Local gates green: `npm run lint && npm run typecheck && npm test && npm run build`
- [ ] Checked in both launch phases (`LAUNCH_PHASE=pre` and `post`) if the change touches CTAs or the waitlist path
- [ ] Scope limited to the bug; if a migration was touched, timestamped without collision and applied locally
