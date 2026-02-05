-- 20260205000100_questionnaires.sql
-- Purpose: Add questionnaire tables for client-completed scoring workflow.
-- Notes:
-- - RLS enabled on all tables
-- - Policies: owner-only (auth.uid()) for now
-- - Admin/Org multi-tenant policies can be added later without breaking schema

begin;

-- 1) Master questionnaire definitions (versioned via id+version embedded in config)
create table if not exists public.questionnaires (
  id text primary key,
  name text not null,
  version text not null,
  total_score_target integer not null default 100,
  created_by text,
  active boolean not null default true,
  config_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists questionnaires_active_idx
  on public.questionnaires (active);

-- 2) Each client submission (one completed run)
create table if not exists public.questionnaire_submissions (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id text not null references public.questionnaires(id) on delete restrict,
  site_id uuid null,
  project_id uuid null,
  user_id uuid not null default auth.uid(),
  submitted_at timestamptz not null default now(),

  status text not null default 'pending',
  total_score integer not null default 0,
  breakdown_json jsonb not null default '{}'::jsonb,

  knockout_failed boolean not null default false,
  missing_docs_penalty_applied boolean not null default false,

  constraint questionnaire_submissions_status_chk
    check (status in ('pending','approved','conditional','rejected'))
);

create index if not exists questionnaire_submissions_questionnaire_id_idx
  on public.questionnaire_submissions (questionnaire_id);

create index if not exists questionnaire_submissions_user_id_idx
  on public.questionnaire_submissions (user_id);

create index if not exists questionnaire_submissions_site_id_idx
  on public.questionnaire_submissions (site_id);

create index if not exists questionnaire_submissions_project_id_idx
  on public.questionnaire_submissions (project_id);

-- 3) Answers (per question)
create table if not exists public.questionnaire_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.questionnaire_submissions(id) on delete cascade,
  question_id text not null,
  answer_value text null,
  score_awarded integer not null default 0,

  requires_documentation boolean not null default false,
  documentation_uploaded boolean not null default false,

  created_at timestamptz not null default now(),

  constraint questionnaire_answers_unique_per_question
    unique (submission_id, question_id)
);

create index if not exists questionnaire_answers_submission_id_idx
  on public.questionnaire_answers (submission_id);

create index if not exists questionnaire_answers_question_id_idx
  on public.questionnaire_answers (question_id);

-- 4) Documents (uploaded evidence)
create table if not exists public.questionnaire_documents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.questionnaire_submissions(id) on delete cascade,
  question_id text not null,
  file_path text not null,
  uploaded_at timestamptz not null default now()
);

create index if not exists questionnaire_documents_submission_id_idx
  on public.questionnaire_documents (submission_id);

create index if not exists questionnaire_documents_question_id_idx
  on public.questionnaire_documents (question_id);

-- 5) updated_at auto-maintenance (no external extensions needed)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists questionnaires_set_updated_at on public.questionnaires;
create trigger questionnaires_set_updated_at
before update on public.questionnaires
for each row
execute function public.set_updated_at();

-- 6) RLS
alter table public.questionnaires enable row level security;
alter table public.questionnaire_submissions enable row level security;
alter table public.questionnaire_answers enable row level security;
alter table public.questionnaire_documents enable row level security;

-- 7) Policies (owner-only for submissions/answers/documents)

-- questionnaires: allow read only for authenticated users (so the UI can load the form definition)
drop policy if exists "questionnaires_read_authenticated" on public.questionnaires;
create policy "questionnaires_read_authenticated"
on public.questionnaires
for select
to authenticated
using (active = true);

-- questionnaire_submissions: owner can CRUD own submissions
drop policy if exists "questionnaire_submissions_select_own" on public.questionnaire_submissions;
create policy "questionnaire_submissions_select_own"
on public.questionnaire_submissions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "questionnaire_submissions_insert_own" on public.questionnaire_submissions;
create policy "questionnaire_submissions_insert_own"
on public.questionnaire_submissions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "questionnaire_submissions_update_own" on public.questionnaire_submissions;
create policy "questionnaire_submissions_update_own"
on public.questionnaire_submissions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "questionnaire_submissions_delete_own" on public.questionnaire_submissions;
create policy "questionnaire_submissions_delete_own"
on public.questionnaire_submissions
for delete
to authenticated
using (user_id = auth.uid());

-- questionnaire_answers: owner can CRUD answers tied to their own submission
drop policy if exists "questionnaire_answers_select_own" on public.questionnaire_answers;
create policy "questionnaire_answers_select_own"
on public.questionnaire_answers
for select
to authenticated
using (
  exists (
    select 1
    from public.questionnaire_submissions s
    where s.id = questionnaire_answers.submission_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "questionnaire_answers_insert_own" on public.questionnaire_answers;
create policy "questionnaire_answers_insert_own"
on public.questionnaire_answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.questionnaire_submissions s
    where s.id = questionnaire_answers.submission_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "questionnaire_answers_update_own" on public.questionnaire_answers;
create policy "questionnaire_answers_update_own"
on public.questionnaire_answers
for update
to authenticated
using (
  exists (
    select 1
    from public.questionnaire_submissions s
    where s.id = questionnaire_answers.submission_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.questionnaire_submissions s
    where s.id = questionnaire_answers.submission_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "questionnaire_answers_delete_own" on public.questionnaire_answers;
create policy "questionnaire_answers_delete_own"
on public.questionnaire_answers
for delete
to authenticated
using (
  exists (
    select 1
    from public.questionnaire_submissions s
    where s.id = questionnaire_answers.submission_id
      and s.user_id = auth.uid()
  )
);

-- questionnaire_documents: owner can CRUD documents tied to their own submission
drop policy if exists "questionnaire_documents_select_own" on public.questionnaire_documents;
create policy "questionnaire_documents_select_own"
on public.questionnaire_documents
for select
to authenticated
using (
  exists (
    select 1
    from public.questionnaire_submissions s
    where s.id = questionnaire_documents.submission_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "questionnaire_documents_insert_own" on public.questionnaire_documents;
create policy "questionnaire_documents_insert_own"
on public.questionnaire_documents
for insert
to authenticated
with check (
  exists (
    select 1
    from public.questionnaire_submissions s
    where s.id = questionnaire_documents.submission_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "questionnaire_documents_delete_own" on public.questionnaire_documents;
create policy "questionnaire_documents_delete_own"
on public.questionnaire_documents
for delete
to authenticated
using (
  exists (
    select 1
    from public.questionnaire_submissions s
    where s.id = questionnaire_documents.submission_id
      and s.user_id = auth.uid()
  )
);

commit;
