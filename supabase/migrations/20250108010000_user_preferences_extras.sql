-- Extend user_preferences with locale/currency and PDF options

alter table public.user_preferences
  add column if not exists locale text,
  add column if not exists currency_code text,
  add column if not exists pdf_include_cover boolean not null default true,
  add column if not exists pdf_repeat_header boolean not null default true;

