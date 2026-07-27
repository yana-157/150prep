# 150prep

A study companion for CMU 15-150, Principles of Functional Programming.

## Live sections

- `gamified/`: 15 topic modules spanning Lectures 1-20
- `lectures/`: the playable review podcast series for Lectures 11-20

The gamified review includes 60 lesson panels, 30 knowledge checks, 30 original
homework-shaped practice prompts, local progress, XP, badges, account UI, a
leaderboard view, and a secure AI-grading integration.

## Community backend

The site works without a backend in solo mode. Shared accounts, public progress,
and AI grading use Supabase Auth, Postgres Row Level Security, and a Supabase
Edge Function.

1. Create a Supabase project.
2. Run `supabase/schema.sql` in its SQL editor.
3. Deploy `supabase/functions/grade-answer`.
4. Store `OPENAI_API_KEY` as an Edge Function secret.
5. Add the project URL and publishable key to `gamified/config.js`.

The OpenAI key belongs only in the Edge Function secret store. Never put it in
`gamified/config.js` or another browser-delivered file.
