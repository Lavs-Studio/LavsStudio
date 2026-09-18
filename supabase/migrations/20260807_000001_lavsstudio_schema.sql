create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  tagline text,
  description text,
  contact_email text,
  social_links jsonb not null default '{}'::jsonb,
  footer_text text,
  seo_title text,
  seo_description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists site_settings_single_active_idx
  on public.site_settings (active)
  where active;

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_title text not null,
  subtitle text,
  section_type text not null,
  display_order integer not null default 0,
  active boolean not null default true,
  configuration_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homepage_sections_active_display_order_idx
  on public.homepage_sections (active, display_order);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  short_description text,
  price numeric(12,2) not null default 0,
  original_price numeric(12,2),
  discount numeric(5,2),
  image_url text,
  amazon_url text,
  affiliate_url text,
  category_id uuid references public.categories (id) on delete set null,
  brand text,
  rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  tags text[] not null default '{}'::text[],
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_discount_check check (discount is null or discount >= 0)
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_published_featured_idx on public.products (published, featured);
create index if not exists products_slug_idx on public.products (slug);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content jsonb not null default '[]'::jsonb,
  cover_image text,
  category_id uuid references public.categories (id) on delete set null,
  author text,
  tags text[] not null default '{}'::text[],
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_category_id_idx on public.blog_posts (category_id);
create index if not exists blog_posts_published_at_idx on public.blog_posts (published, published_at desc);
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);

create table if not exists public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create index if not exists product_categories_category_id_idx on public.product_categories (category_id);

create table if not exists public.featured_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  section_key text not null default 'homepage',
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint featured_products_section_product_unique unique (section_key, product_id)
);

create index if not exists featured_products_section_key_idx on public.featured_products (section_key, active, display_order);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_profiles_role_check check (role in ('admin', 'editor'))
);

create index if not exists admin_profiles_active_idx on public.admin_profiles (active);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = auth.uid()
      and ap.active = true
      and ap.role = 'admin'
  );
$$;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_homepage_sections_updated_at on public.homepage_sections;
create trigger set_homepage_sections_updated_at
before update on public.homepage_sections
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists set_featured_products_updated_at on public.featured_products;
create trigger set_featured_products_updated_at
before update on public.featured_products
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.site_settings enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.products enable row level security;
alter table public.blog_posts enable row level security;
alter table public.product_categories enable row level security;
alter table public.featured_products enable row level security;
alter table public.admin_profiles enable row level security;

revoke all on table public.categories from public, anon, authenticated;
revoke all on table public.site_settings from public, anon, authenticated;
revoke all on table public.homepage_sections from public, anon, authenticated;
revoke all on table public.products from public, anon, authenticated;
revoke all on table public.blog_posts from public, anon, authenticated;
revoke all on table public.product_categories from public, anon, authenticated;
revoke all on table public.featured_products from public, anon, authenticated;
revoke all on table public.admin_profiles from public, anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on table public.categories to anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant select on table public.homepage_sections to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.blog_posts to anon, authenticated;
grant select on table public.product_categories to anon, authenticated;
grant select on table public.featured_products to anon, authenticated;

grant insert, update, delete on table public.categories to authenticated;
grant insert, update, delete on table public.site_settings to authenticated;
grant insert, update, delete on table public.homepage_sections to authenticated;
grant insert, update, delete on table public.products to authenticated;
grant insert, update, delete on table public.blog_posts to authenticated;
grant insert, update, delete on table public.product_categories to authenticated;
grant insert, update, delete on table public.featured_products to authenticated;
grant select, insert, update, delete on table public.admin_profiles to authenticated;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
  on public.categories
  for select
  using (active = true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
  on public.categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read active site settings" on public.site_settings;
create policy "Public can read active site settings"
  on public.site_settings
  for select
  using (active = true);

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings"
  on public.site_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read active homepage sections" on public.homepage_sections;
create policy "Public can read active homepage sections"
  on public.homepage_sections
  for select
  using (active = true);

drop policy if exists "Admins manage homepage sections" on public.homepage_sections;
create policy "Admins manage homepage sections"
  on public.homepage_sections
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
  on public.products
  for select
  using (published = true);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
  on public.products
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
  on public.blog_posts
  for select
  using (published = true);

drop policy if exists "Admins manage blog posts" on public.blog_posts;
create policy "Admins manage blog posts"
  on public.blog_posts
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read product categories" on public.product_categories;
create policy "Public can read product categories"
  on public.product_categories
  for select
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_categories.product_id
        and p.published = true
    )
  );

drop policy if exists "Admins manage product categories" on public.product_categories;
create policy "Admins manage product categories"
  on public.product_categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read active featured products" on public.featured_products;
create policy "Public can read active featured products"
  on public.featured_products
  for select
  using (
    active = true
    and exists (
      select 1
      from public.products p
      where p.id = featured_products.product_id
        and p.published = true
    )
  );

drop policy if exists "Admins manage featured products" on public.featured_products;
create policy "Admins manage featured products"
  on public.featured_products
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
  on public.admin_profiles
  for select
  using (public.is_admin());

drop policy if exists "Admins can manage admin profiles" on public.admin_profiles;
create policy "Admins can manage admin profiles"
  on public.admin_profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users can read own admin profile" on public.admin_profiles;
create policy "Users can read own admin profile"
  on public.admin_profiles
  for select
  using (auth.uid() = user_id);

revoke all on schema storage from public, anon, authenticated;
grant usage on schema storage to anon, authenticated;

revoke all on table storage.objects from public, anon, authenticated;
grant select on table storage.objects to anon, authenticated;
grant insert, update, delete on table storage.objects to authenticated;

drop policy if exists "Public can read website images" on storage.objects;
create policy "Public can read website images"
  on storage.objects
  for select
  using (bucket_id = 'website-images');

drop policy if exists "Admins can upload website images" on storage.objects;
create policy "Admins can upload website images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'website-images'
    and public.is_admin()
  );

drop policy if exists "Admins can update website images" on storage.objects;
create policy "Admins can update website images"
  on storage.objects
  for update
  using (
    bucket_id = 'website-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'website-images'
    and public.is_admin()
  );

drop policy if exists "Admins can delete website images" on storage.objects;
create policy "Admins can delete website images"
  on storage.objects
  for delete
  using (
    bucket_id = 'website-images'
    and public.is_admin()
  );