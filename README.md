# StudyLink

StudyLink is a fictional, safety-focused tutoring app prototype for a school STEM competition.

## Current Prototype

StudyLink is now a complete static GitHub Pages app prototype in `index.html` with responsive styling in `styles.css` and interactions in `app.js`. The published first screen is a full-viewport student workspace modeled on the supplied reference: indigo navigation rail, search utility bar, current focus, upcoming sessions, recommendations, and a skill-check shortcut. The Demo Guide provides a seven-step story: start in the overview, build a request, check skills, compare Maya's match, send a safe message, start a safe session, and measure the progress win. A separate 60-minute Workshop Mode expands that story into eight presentation chapters with a live timer, chapter navigation, and rotating discussion prompts. It also includes tutor mode, matching filters, visible match scoring, Maya's profile, preset in-app messages, a safe tutoring room with whiteboard and controls, progress, sessions, saved tutors, and safety/privacy screens.

All people and scores shown are fictional demo data.

The login screen includes two one-click test profiles: **Maya R.** as a Grade 8 tutor and **David K.** as a Grade 8 student. These are fictional demo identities and do not create real accounts.

## Supabase Website Backend

The website includes an optional Supabase adapter. Without configuration it stays in local demo mode. To enable backend message storage:

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Copy `supabase-config.example.js` to `supabase-config.js`.
4. Put the project's public URL and anon key in `supabase-config.js`.

The service-role key must never be placed in `supabase-config.js` or committed to GitHub. The public anon/publishable key is intended for browser use; database access is controlled by Supabase RLS policies.

### Username-only demo accounts

The custom account form asks for a StudyLink name and password only. Supabase Auth stores the password securely and uses an internal `@demo.studylink.app` identifier; the identifier is not shown to users and is not a personal email address. For this school prototype, open **Authentication > Providers > Email** and turn off **Confirm email** so a newly created demo account can sign in immediately. Add real email-based recovery before using this outside the prototype.

## Publish With GitHub Pages

1. Create a GitHub repository named `StudyLink`.
2. Upload `index.html`, `styles.css`, `app.js`, `.nojekyll`, and this README.
3. In the repository, open **Settings > Pages**.
4. Select **Deploy from a branch**, choose the default branch and `/ (root)`, then save.

GitHub will provide the public Pages link after deployment.

## Expo Phase

Install the current Node.js LTS release, then restart VS Code so `node`, `npm`, and `npx` are available in the integrated terminal.

The project will use Expo and TypeScript for Expo Go phone testing. Supabase, GitHub, and Vercel can be connected after the local prototype is working. All accounts and messages must remain fictional demo data.

## Planned start command

```powershell
npx create-expo-app@latest . --template blank-typescript --yes
npx expo start
```
