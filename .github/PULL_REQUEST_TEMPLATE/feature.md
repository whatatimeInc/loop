<!-- FEATURE template. For a bugfix, switch to ?template=fix.md in the URL, or run `gh pr create --template fix.md`. -->

## What changes
<!-- 1-2 sentences from the user's point of view: the new behavior. -->

## Why
<!-- Motivation / problem. Link the Weekly board card if there is one. -->

## How
<!-- Implementation decisions a reviewer needs to know. Few places touched = good architecture. -->

## Tests
<!-- What proves it works: new tests, command run, evidence (screenshot, log). -->

## Checklist
- [ ] Conventional Commits, at least one `feat:` (bumps semver **minor**), everything in English
- [ ] Local gates green: `npm run lint && npm run typecheck && npm test && npm run build`
- [ ] Checked in both launch phases (`LAUNCH_PHASE=pre` and `post`) if the change touches CTAs or the waitlist path
- [ ] New migration in `supabase/migrations/` timestamped without collision and applied locally; RLS reviewed for any new table
- [ ] No secrets or `.env` files in the diff
