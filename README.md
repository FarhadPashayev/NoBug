# nobug — korporativ sayt + sorğu

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. Dizayn mənbəyi: `../design_handoff_nobug_site/` (v2 — "Swiss annual report" art direction).

## İşə salmaq

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000  →  /az
```

**Hazırkı rejim: `MAIL_MODE=off`** — domen olmadığı üçün e-poçt göndərilmir. Sorğu və əlaqə formu istifadəçiyə "qeydə alındı" göstərir, məzmun server loguna yazılır. `nobug.az` + Resend hazır olanda `.env.local`-da `MAIL_MODE=send` və `RESEND_API_KEY` yazmaq kifayətdir — kod dəyişmir.

## Struktur

```
src/
  app/
    [lang]/            /az, /en, /ru — ana səhifə (10 bölmə)
    [lang]/anket/      sorğu: xidmət → 3 sual → əlaqə (?xidmet=0…11 dərin link)
    api/anket/         POST — sorğu cavablarını e-poçtla göndərir
    api/contact/       POST — Əlaqə bölməsindəki 3 sahəli form
    globals.css        tokenlər (navy/paper/accent), tipoqrafiya, düymə, chip, reveal
  proxy.ts             "/" və "/anket" → dil prefiksli ünvana (cookie + Accept-Language)
  lib/
    i18n/dict.ts       ana səhifənin bütün mətnləri, alt/caption-lar (AZ/EN/RU)
    anket/survey.ts    12 xidmət × 3 sual, sorğu UI mətnləri (AZ/EN/RU)
    mail/send.ts       Resend wrapper + MAIL_MODE
    anti-spam.ts       honeypot · 3 saniyə · 5/saat/IP
  components/
    site/              Header, Hero, CineBand, Services, About, Technology, Clients/Careers, Contact, Footer
    anket/             SurveyForm
    ui/                Reveal (scroll-once), Figure (şəkil + caption), Logo
public/assets/         loqolar, IMG-01…07, PATTERN-lar (dəyişdirilməyib)
```

## Dizayn qaydaları (kodda saxlanılıb)

- Rəng: navy `#0B1F3A` həm fon, həm mətn; paper `#EDEBE5`; aksent `#B3121D` ekranın 5%-dən az.
- Kölgə yoxdur, gradient yoxdur, radius 0/2px.
- Inter Tight (UI) · Newsreader italic (yalnız bir sitat) · IBM Plex Mono (etiketlər).
- Hover: nav/footer alt xətt soldan böyüyür; xidmət sətrində 2px aksent bar + ox; şəkillər 1→1.03 (650ms); əsas düymədə aksent aşağıdan yuxarı.
- Scroll: elementlər bir dəfə görünür (20% threshold), xətlər özünü çəkir, IMG-02 clip-path ilə açılır. `prefers-reduced-motion` → yalnız opacity.

## Deploy (Vercel)

1. GitHub-a push → Vercel import.
2. Env: `MAIL_MODE`, `RESEND_API_KEY`, `MAIL_TO`, `MAIL_FROM`.
3. `nobug.az` domenini Resend-də verify edin (SPF + DKIM).

## Lokal dev mühiti (tövsiyə olunan)

Dəyişikliklər əvvəl öz maşınınızda, lokal bazada yoxlanılır, sonra `main`-ə push
olunur və production-a çıxır. Prod bazasına və `media` bucket-ına toxunulmur.

```bash
npm run dev            # http://localhost:3000  (admin: /admin, .env.local-dakı ADMIN_EMAIL / ADMIN_PASSWORD)
npm run test:all       # bütün QA dəstləri (ayrıca test bazası, port 5439)
git add -A && git commit -m "…" && git push origin main   # → production
```

Bir dəfəlik qurulum (bu maşında artıq edilib):

1. Postgres 16 lokal işləyir (`brew services start postgresql@16`), baza `nobug_dev`.
2. `.env.local`-da: `DATABASE_URL` / `DIRECT_URL` → `postgresql://<user>@127.0.0.1:5432/nobug_dev`,
   `AUTH_SECRET`, `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (şəkil yükləmələri üçün),
   `MEDIA_BUCKET=media-dev`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, `ADMIN_*`.
3. `npm run db:push && npm run db:seed` — sxem + saytın məzmunu + admin hesabı.

Prisma CLI, seed və `db:harden` `.env.local`-ı Next.js kimi oxuyur, əlavə env
ötürmək lazım deyil. Lokal bazanı sıfırlamaq: `dropdb nobug_dev && createdb nobug_dev`, sonra 3-cü addım.

## Dev mühiti onlayn (dev.nobug.az) — istəyə bağlı

Müştəriyə link göstərmək lazım olanda `dev` branch-ı Vercel **Preview** kimi
qurulur; `main` = production. Aşağıdakı bir dəfəlik qurulum hələ edilməyib
(Vercel-də domen + Deployment Protection söndürülməsi + Cloudflare CNAME).

| | production | dev |
|---|---|---|
| Branch | `main` | `dev` |
| URL | https://www.nobug.az | https://dev.nobug.az |
| Postgres sxemi (eyni Supabase layihəsi) | `public` | `dev` (`DB_SCHEMA=dev`) |
| Storage bucket | `media` | `media-dev` (`MEDIA_BUCKET=media-dev`, ilk yükləmədə avtomatik yaranır) |
| Axtarış sistemləri | indekslənir | `noindex` (robots.txt, `X-Robots-Tag`, meta) |
| Admin paneli | — | topbar-da **dev** nişanı |

**İş axını**

```bash
git checkout dev && git pull
# … dəyişiklik, commit …
git push                      # → Vercel dev.nobug.az-ı yenidən qurur (1–2 dəq)
# dev.nobug.az-da yoxla, lazım olsa: PROD_URL=https://dev.nobug.az npx playwright test tests/e2e/prod.spec.ts --project=public
git checkout main && git merge --ff-only dev && git push   # → production
git checkout dev
```

Təcili prod düzəlişi lazım olsa: `main`-də commit → push; sonra `git checkout dev && git merge main`.

**Bir dəfəlik qurulum (Vercel + Cloudflare)**

1. Vercel → `no-bug` → Settings → Domains → Add `dev.nobug.az`, "Git Branch" = `dev`.
2. Cloudflare DNS → `CNAME dev → cname.vercel-dns.com`, proxy söndürülmüş (DNS only).
3. Vercel → Settings → Environment Variables. **Preview** mühiti, branch `dev` üçün:
   - `DB_SCHEMA=dev`
   - `MEDIA_BUCKET=media-dev`
   - `NEXT_PUBLIC_SITE_URL=https://dev.nobug.az`
   - `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `MAIL_*`, `NEXT_PUBLIC_CONTACT_EMAIL` — production ilə eyni dəyərlər (Production dəyərlərini Preview-a da tətbiq etməklə).
   - `NEXT_PUBLIC_GA_ID` boş qalsın (dev trafiki analitikaya düşməsin).
4. Settings → Environment Variables → "Automatically expose System Environment Variables" açıq olsun (`VERCEL_ENV=preview` buradan gəlir; `noindex` və dev nişanı ona bağlıdır).
5. `dev` sxemi bir dəfə yaradılır və doldurulur (artıq edilib; yenidən lazım olsa):
   ```bash
   DB_SCHEMA=dev DIRECT_URL=<session pooler, port 5432> npm run db:push
   DB_SCHEMA=dev DIRECT_URL=<…> ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:seed
   ```

Dev bazası prod-dan tamamilə ayrıdır: orada yaradılan sorğular, layihələr və
yükləmələr sayta çıxmır. Dev admin hesabı seed ilə yaradılır (prod ilə eyni e-poçt, ayrıca şifrə vermək olar).

## Müştəridən gözlənilən (handoff README §Open items)

- Komanda portretləri (3 × 4:5, real foto) + ad/vəzifə → Komanda bölməsi əlavə olunur.
- İlk yazılar → Təhlil (Insights) bölməsi.
- Telefon, qeydiyyat ünvanı, VÖEN.
- `nobug.az` domeni + SPF/DKIM.
- Açıq fon üçün amber N-li loqo + SVG dəst.

## Qeydlər

- Rate limit prosesin yaddaşındadır; bir neçə instansa çıxsa Upstash/Redis-ə keçirin.
- Hüquqi səhifələr (Məxfilik, Şərtlər, Məlumatların emalı) hələ yoxdur — footer-də `#top`-a gedir.
- Newsreader şriftində kiril dəsti yoxdur; RU sitat Georgia italic ilə göstərilir.

## Admin panel (`/admin`)

Məzmunu idarə etmək üçün ayrıca panel: Next.js App Router + Prisma (PostgreSQL)
+ TanStack Query + react-hook-form/zod. Sayt ilə eyni deploy-dadır.

### Qurulum

```bash
# 1) PostgreSQL bazası yaradın (Vercel Postgres / Neon / Supabase)
#    və .env.local-a yazın:
#    DATABASE_URL=postgresql://...
#    AUTH_SECRET=<openssl rand -base64 48>
#    ADMIN_EMAIL=admin@nobug.az
#    ADMIN_PASSWORD=<ən azı 10 simvol>

npm run db:push    # sxemi bazaya yazır
npm run db:seed    # ilk admin hesabı + saytdakı mövcud məzmun
npm run dev        # http://localhost:3000/admin
```

`DATABASE_URL` və ya `AUTH_SECRET` yoxdursa panel "konfiqurasiya olunmayıb"
göstərir — **sayt normal işləməyə davam edir**.

### Modullar

| Ekran | Nə idarə edir |
|---|---|
| İdarə paneli | say göstəriciləri, son müraciətlər |
| Banner | başlıq, alt mətn, iki düymə, vizual, partnyor loqoları |
| Layihələr | tam CRUD: başlıq, müddət, il, örtük şəkli, teqlər, sıra, "seçilmiş" açarı |
| Göstəricilər | dəyər, təsvir, mənbə, sıra |
| Xidmətlər | xidmətlər + kateqoriyalar, "əsas/əlavə", slug (`?xidmet=`), ikon, şəkil |
| Standartlar | parametr · dəyər · vahid · qrup cədvəli |
| Müraciətlər | sayt formalarından gələn sorğular: status, daxili qeyd, axtarış, filtr, CSV |
| Sayt parametrləri | e-poçt, telefon, ünvan, sosial linklər, footer link sütunları |
| Profil | ad/e-poçt və şifrə dəyişmə |

### Supabase Data API və RLS

Supabase `public` sxemindəki hər cədvəli REST Data API ilə də açır (`anon` və
`authenticated` rolları). Sayt bazaya yalnız Prisma ilə, `postgres` rolundan
qoşulur, ona görə bütün cədvəllərdə RLS aktivdir (siyasətsiz) və API rollarının
imtiyazları geri alınıb: anon açarı ilə heç bir cədvəl oxunmur. `npm run db:push`
bunu hər dəfə avtomatik təkrarlayır (`scripts/db-harden.mjs`); yalnız `prisma db push`
çağırsanız, ardınca `npm run db:harden` (dev üçün `DB_SCHEMA=dev`) işlədin.
Supabase Advisor "RLS Disabled in Public" xəbərdarlıqları bununla bağlanır.

### Texniki qeydlər

- **Giriş:** httpOnly cookie-də imzalanmış JWT (jose), 8 saat; login-də IP üzrə
  15 dəqiqədə 8 cəhd limiti. Bütün `/admin` route-ları `src/proxy.ts`-də qorunur.
- **Şəkillər:** `BLOB_READ_WRITE_TOKEN` varsa Vercel Blob-a, yoxdursa lokal
  `public/uploads`-a yazılır (produksiyada fayl sistemi read-only olduğu üçün
  canlıda token mütləqdir).
- **Müraciətlər:** `/api/anket` və `/api/contact` cavabları həm e-poçtla göndərir,
  həm də baza varsa panelə yazır. Baza xətası formanı heç vaxt dayandırmır.
- Sxem: `prisma/schema.prisma`; bütün məzmun cədvəllərində `locale` sütunu var —
  EN/RU sətirləri miqrasiyasız əlavə edilə bilər.

### Hələ edilməyib

Sayt **hələ də** `src/lib/i18n/dict.ts`-dən oxuyur; panel ayrıca baza saxlayır.
Növbəti addım: saytın oxu qatını bazaya bağlamaq (AZ üçün baza, EN/RU üçün
lüğət fallback).

## Admin panel (/admin)

Full-stack content panel in the same Next.js app. Public pages read their content from the database (`src/lib/content`), so an edit in the panel is live on the site as soon as the action calls `revalidatePath`. Without a database the site falls back to the dictionary copy in `src/lib/i18n/dict.ts` — the same content the seed loads.

### Stack

Next.js 16 App Router · Tailwind 4 · Radix/shadcn-style primitives · React Hook Form + Zod · TanStack Query + TanStack Table · Tiptap (HTML) · dnd-kit · lucide · **Prisma 7 + Supabase Postgres** · **Supabase Storage** (bucket `media`, folders `hero/ partners/ projects/ services/`) · **Auth.js v5** (Credentials, database sessions, bcrypt) · Server Actions (`src/actions`) · sonner · next-themes.

### Setup

1. Supabase → create a project. Copy from *Project settings → Database*: the **Transaction pooler** string → `DATABASE_URL`, the direct string → `DIRECT_URL`. From *Project settings → API*: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_`).
2. `AUTH_SECRET` — at least 32 characters (`openssl rand -base64 48`).
3. `ADMIN_EMAIL`, `ADMIN_PASSWORD` (≥ 10 chars), optional `ADMIN_NAME`.
4. Tables: `npm run db:push` (uses `DIRECT_URL`).
5. First account + content: either `npm run db:seed`, or open `/admin/login` and press **Quraşdır** — the card appears only while the users table is empty and does the same thing from the server's env vars.

The `media` bucket is created on the first upload if it does not exist.

### Multilingual content

Every translatable column is Json `{ az, en, ru }` (`localizedString()` in `src/lib/i18n/localized.ts`). AZ is required; EN/RU fall back to AZ via `t(value, locale)`. Forms show AZ | EN | RU tabs with a dot on empty languages. Non-translatable data (urls, images, order, flags, years) is stored once.

### Modules

| Route | Model(s) | Notes |
| --- | --- | --- |
| `/admin` | — | counts + latest enquiries |
| `/admin/hero` | `Hero` (singleton), `PartnerLogo` | banner text/CTAs/image; logos with drag-and-drop order |
| `/admin/projects` | `Project`, `Tag` | Tiptap content, cover, tags, featured/published, drag-and-drop order |
| `/admin/stats` | `Stat` | value + localized label/source, order |
| `/admin/services` | `Service`, `ServiceCategory` | two tabs; category `esas` renders as the primary group |
| `/admin/specs` | `SpecGroup`, `SpecItem` | inline-editable table (group = area) |
| `/admin/leads` | `Lead` | search, status, date range, CSV; status + notes editable only |
| `/admin/settings` | `SiteSettings`, `FooterLink` | phones[], email, address/hours, socials, footer links by column |
| `/admin/profile` | `User` | name/email, password (current-password check) |

Leads are created only by `POST /api/leads` (contact form + anket; `/api/contact` and `/api/anket` are aliases). Honeypot + fill-time check, 5/hour/IP, Zod.

### Layout

`src/app/(admin)/admin/*` pages · `src/actions/*` server actions (`guarded()` = session + Zod + error → `{ ok, error, fieldErrors }`) · `src/schemas/*` Zod · `src/lib/{db,auth,supabase,content,seed}.ts` · `src/components/admin/*` (CrudManager, DataTable, LocalizedField, ImageDrop, RichEditor, SortableList).

`/admin` is `noindex`, disallowed in robots.txt and absent from the sitemap. `src/proxy.ts` (Node runtime) redirects signed-out visitors to `/admin/login`.

### Testing

`TEST-REPORT.md` holds the latest run. Layers: **unit** (Vitest — schemas, `t()`, slugs, CSV, rate limiter, sniffing, sanitizer), **integration** (Vitest + Prisma against `DATABASE_URL_TEST`, session and storage mocked), **API** (`fetch` against `next start` on `TEST_PORT`), **E2E** (Playwright, Chrome channel; admin at 1440×900 with a saved login, public pages plus a 390 px mobile run and an axe check).

```bash
npm run test:db     # drop/recreate the test DB, push the schema, load tests/seed.ts
npm test            # test:db + unit + integration
npm run test:e2e    # Playwright (starts `node tests/serve.mjs` itself)
npm run test:all    # everything: db → tsc → eslint → build → unit/integration → api → e2e
```

`.env.test` has the non-secret test settings; put `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `MEDIA_BUCKET=media-test` in `.env.test.local` to run the real-upload cases (they skip otherwise). Tests refuse any Supabase `DATABASE_URL_TEST`.

### Resilience & performance notes

- **Environment** is validated with Zod at boot (`src/lib/env.ts`, `src/instrumentation.ts`): a malformed value (bad `DATABASE_URL`, short `AUTH_SECRET`, wrong `MAIL_MODE`…) aborts a production start with a clear message; missing values are allowed — the site runs without a database or mail.
- **Error boundaries**: `src/app/[lang]/error.tsx` (az/en/ru), `src/app/global-error.tsx`, `src/app/(admin)/admin/error.tsx`; 404s are localized in `src/app/[lang]/not-found.tsx`.
- **Offline**: `public/sw.js` keeps visited public pages and static assets (network-first for pages, cache-first for `/_next/static`, stale-while-revalidate for `/assets` and `/_next/image`); `/admin` and `/api` are never cached. `public/offline.html` is the fallback; `OfflineBanner` shows a localized notice when the browser loses its connection. Bump `VERSION` in `sw.js` to invalidate old caches.
- **Network**: every browser `fetch` goes through `fetchWithTimeout` (`src/lib/fetch.ts`, 15–60 s, abortable); TanStack Query retries twice with exponential backoff, mutations never retry.
- **Hero LCP**: the intro choreography only runs from `md` up with `prefers-reduced-motion: no-preference`; phones get the headline in the first paint (CSS in `globals.css`, `[data-phase]`).
- **Images**: Supabase uploads go through `next/image` (`images.remotePatterns`, AVIF/WebP).
- **Service pages**: `/{lang}/xidmetler/{slug}` — one indexable page per service (metadata, hreflang, JSON-LD, ISR); the sitemap reads services and projects from the database.
- **Security headers / CSP**: `src/lib/security-headers.ts`, applied by the proxy (every routed response and its redirects) and `next.config.ts` (static files, API).
- **Form rules**: `src/lib/validation.ts` (name / e-mail) is shared by the forms and `/api/leads`.
- The project folder syncs with iCloud on the author's machine, which drops `name 2.ts` copies into generated folders; `prebuild` and `test:all` sweep them.
