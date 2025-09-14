-- Extend user_preferences with row striping and default report period label

alter table public.user_preferences
  add column if not exists pdf_row_striping boolean not null default true,
  add column if not exists default_report_period text;

