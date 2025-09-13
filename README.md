## Quiet Hours Scheduler

A server-side app that sends email reminders to users before their scheduled quiet/study hours.

### Tech Stack

- Frontend: Next.js, shadcn/ui
- Backend: Supabase
- Email: Resend API

### How It Works

- Users create quiet hours in the database.
- Supabase Edge Function checks upcoming quiet hours.
- Sends reminders using Resend.
- Sent emails are marked sent to avoid duplicate emails.
- A cron job triggers the function every 10 minutes.