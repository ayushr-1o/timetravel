# Timetravel — Database Schema

Hosted on Supabase (Postgres). All tables use UUID primary keys and have `created_at` timestamps.

## Tables

### `articles`

```sql
create table articles (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  url          text,
  raw_text     text not null,
  source       text,
  published_at date,
  status       text default 'pending'
    check (status in ('pending', 'processing', 'done', 'error')),
  risk_level   text check (risk_level in ('low', 'medium', 'high')),
  claim_count  int default 0,
  stale_count  int default 0
);
```

### `claims`

```sql
create table claims (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  article_id      uuid references articles(id) on delete cascade,
  claim_text      text not null,
  status          text default 'pending'
    check (status in ('pending', 'stable', 'uncertain', 'stale')),
  review_status   text default 'unreviewed'
    check (review_status in ('unreviewed', 'approved', 'flagged', 'dismissed')),
  freshness_score int check (freshness_score between 0 and 100),
  analysis_notes  text,
  char_start      int,
  char_end        int
);
```

### `source_suggestions`

```sql
create table source_suggestions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  claim_id    uuid references claims(id) on delete cascade,
  title       text not null,
  url         text,
  published   date,
  reliability text check (reliability in ('high', 'medium', 'low')),
  summary     text
);
```

### `review_notes`

```sql
create table review_notes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  claim_id    uuid references claims(id) on delete cascade,
  reviewer    text,
  note        text not null
);
```

## Row Level Security

Enable RLS on all tables. For the prototype, use a simple anon-read policy:

```sql
alter table articles enable row level security;
create policy "Public read" on articles for select using (true);
create policy "Service write" on articles for insert with check (true);
```

Repeat for claims, source_suggestions, review_notes.