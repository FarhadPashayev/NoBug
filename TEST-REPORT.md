# nobug.az Admin Panel — Test Report

Run on 2026-09-26 (last full run after commit `02d15a3`), on macOS (Chrome channel, local PostgreSQL 16 on `127.0.0.1:5439`, Supabase project `bhzbegsqkpmzssmznnaf` test bucket `media-test` for the real-upload cases only).

The project uses **npm**, so the commands from the plan are `npm test`, `npm run test:e2e`, `npm run test:all` (see §1). Tests never touch the production database: `tests/env.mjs` maps `DATABASE_URL_TEST` → `DATABASE_URL` and refuses any `*.supabase.co` URL.

## 1. Commands and exit codes

`npm run test:all` (`tests/run-all.mjs`) runs every step in order and prints a summary:

| Step | Command | Exit |
| --- | --- | --- |
| DB reset + seed | `node tests/db-reset.mjs` (drop/create `nobug_test`, `prisma db push`, `tsx tests/seed.ts`) | 0 |
| Type check (NF-02) | `npx tsc --noEmit` | 0 |
| Lint (NF-02) | `npx eslint src tests` — 0 errors, 2 warnings (React Compiler skipping TanStack Table's hook — informational) | 0 |
| Build (NF-01) | `npx next build` | 0 |
| Unit + integration | `npx vitest run --project unit --project integration` | 0 |
| API | `npx vitest run --project api` (against `next start` on `TEST_PORT=3400`) | 0 |
| E2E | `npx playwright test` | 0 |

Individual entry points: `npm test` (DB reset + unit + integration), `npm run test:unit`, `npm run test:api` (server must be running: `node tests/serve.mjs`), `npm run test:e2e` (Playwright starts the server itself via `webServer`; run `npm run test:db` first for a clean data set).

## 2. Summary

| Layer | Tool | Files | Total | Passed | Failed | Skipped |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | Vitest | `tests/unit/*.test.ts` (6) | 46 | 46 | 0 | 0 |
| Integration | Vitest + Prisma (test DB) | `tests/integration/*.test.ts` (3) | 23 | 23 | 0 | 0 |
| API | Vitest + `fetch` | `tests/api/*.test.ts` (2) | 16 | 16 | 0 | 0 |
| E2E — admin | Playwright (Chromium via Chrome channel) | `tests/e2e/admin/*.spec.ts` (7) | 37 | 37 | 0 | 0 |
| E2E — public site (QA plan §4) | Playwright, desktop + 390 px mobile + axe | `tests/e2e/public/*.spec.ts` (9) | 39 | 39 | 0 | 0 |
| E2E — production only | Playwright `request` (`PROD_URL=https://www.nobug.az`) | `tests/e2e/prod.spec.ts` | 3 | 3 | 0 | 0 (skipped in `test:all`) |
| **Total** | | | **164** | **164** | **0** | **0** |

The E2E run includes a mobile project (390×844, Pixel 7 profile) for the public page and an axe accessibility check on `/az` and `/admin/login`.

Without Supabase test-bucket credentials in `.env.test.local`, two cases skip themselves instead of failing: `UPL-01/HERO-04/HERO-05` (E2E) and the bucket half of `UPL-01/UPL-08` (API). Both ran and passed in this report.

## 3. Test cases that failed during the work and what changed

Every case below failed when its test was first written, was fixed in the **application** (never by relaxing the assertion), and passes now. All fixes are in this report's commit.

| ID | Reason it failed | Fixed | File(s) |
| --- | --- | --- | --- |
| LEAD-01 | Endpoint returned 200 on create; plan requires 201 | yes | `src/app/api/leads/route.ts` |
| LEAD-02 | Validation errors came back as one message, not per-field | yes | `src/app/api/leads/route.ts` (`fieldErrors`) |
| LEAD-17 | `GET /api/leads` answered 405, plan requires 401/404 | yes | `src/app/api/leads/route.ts` (`GET` → 404); obsolete `/api/admin/*` route stubs removed |
| PRJ-02 / SVC-07 | A typed duplicate slug was silently suffixed (`-2`) instead of rejected | yes | `src/actions/projects.ts`, `src/actions/services.ts` (`resolveSlug`; derived slugs still get a suffix) |
| PRJ-04 / PRJ-05 | `year` accepted any text and could be empty | yes | `src/schemas/projects.ts` (`^20\d\d|2100$`) |
| PRJ-06 | Rich text was stored and rendered unsanitized (script tags survived) | yes | `src/lib/sanitize.ts` (sanitize-html), applied in `src/actions/projects.ts`, `src/actions/services.ts` and on render |
| PRJ-06 / PRJ-09 | No public detail page existed to render project content / return 404 for unpublished | yes | `src/app/[lang]/layiheler/[slug]/page.tsx`, `getProject()` in `src/lib/content/index.ts`, `revalidatePath` in project actions |
| PRJ-10 | Featured projects were not shown first publicly | yes | `src/lib/content/index.ts` (`orderBy: [{ isFeatured: "desc" }, { order: "asc" }]`) |
| PRJ-13 | Table search only matched the AZ title | yes | `src/components/admin/modules/projects-manager.tsx` |
| SVC-02 | Deleting a category detached its services (neither block nor cascade) | yes — **block** | `src/actions/services.ts` |
| SVC-03 | Any string was accepted as an icon name; icons were never rendered publicly | yes | `src/schemas/services.ts`, `src/actions/services.ts` (checked against lucide's export list), `src/components/landing/service-card.tsx` |
| UPL-04 | Upload trusted the declared MIME type; a PDF renamed `.jpg` was accepted | yes | `src/lib/supabase.ts` (`sniffImageType`, magic bytes), `src/app/api/admin/upload/route.ts` |
| LEAD-15 | Downloaded CSV could lose the BOM on the client side | yes | `src/components/admin/modules/leads-inbox.tsx` |
| I18N-01/02 (unit) | Optional localized fields had no default, so API/test callers omitting them failed validation | yes | `src/lib/i18n/localized.ts` |
| NF-04 | Server-action field errors were only produced from Zod; business rules (slug taken, icon unknown) could not point at a field | yes | `src/actions/run.ts` (`ActionError` carries `fieldErrors`) |
| PRJ-06 (editor UX) | Toolbar clicks stole the editor selection | yes | `src/components/admin/rich-editor.tsx` (`onMouseDown` preventDefault) |
| NF-03 | Not a failure — the schema already had the indexes; a unit test now guards them | n/a | `tests/unit/schema.test.ts` |

Testability hooks added to the app (no behaviour change): `data-localized` on `LocalizedField`, `aria-label="Sıranı dəyiş"` on the reorder button, `data-group` on spec group cards.

Skipped: none in this run. `UPL-01` and the bucket part of the API upload test skip only when `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are absent from `.env.test.local`.

## 4. Spec ambiguities and decisions taken

| Topic | Decision | Needs a human decision? |
| --- | --- | --- |
| Category delete with services (SVC-02) | **Blocked** with the message "Kateqoriyada N xidmət var — əvvəlcə onları başqa kateqoriyaya keçirin". Tested in integration and E2E. | no — flag if cascade is preferred |
| Spec group delete with items (SPEC-04) | **Cascade** (items go with the group); the confirmation dialog says so. Tested. | no |
| Duplicate slug (PRJ-02, SVC-07) | A slug the user typed must be free (field error). A slug derived from the title gets a numeric suffix so quick entry never fails. | no |
| Project `year` (PRJ-05) | Required, 4 digits, 2000–2100. | no |
| Lucide icon validation (SVC-03) | Format checked in the shared Zod schema (PascalCase); existence checked server-side against `lucide-react`'s `icons` map so the client bundle does not ship 1 800 icons. | no |
| Public project detail page | The admin spec had no detail route, but the QA plan requires one (PRJ-06/PRJ-09). Added `/[lang]/layiheler/[slug]` (published only, 404 otherwise) and the showcase now links to it when a project has content. | **yes** — confirm the URL and that a detail page is wanted |
| Featured ordering (PRJ-10) | Public showcase lists featured projects first, then manual order. | no |
| `/api/leads` response code | 201 on create (was 200). Old `/api/contact` and `/api/anket` stay as aliases. | no |
| Footer link order (SET-04) | The settings form is one flat list (company links, then services); `order` = position in that list, rendered per column. The E2E test moves the new link with "Yuxarı" until it is above "Əlaqə". | no |
| Password change (AUTH-10) | Other sessions are invalidated; the current one is kept. | no |
| `pnpm` / `NEXTAUTH_*` names in the plan | npm scripts of the same names; Auth.js v5 reads `AUTH_SECRET`/`AUTH_URL` — `.env.test` sets both spellings. `prisma migrate reset` → the project uses `db push`; `tests/db-reset.mjs` drops and recreates the test database instead. | no |
| Stats `source`, settings `hours`, footer `group` columns | Kept from the previous round (needed so the public site stays identical to the dictionary copy — PUB-01 asserts this). | no |
| Tags (PRJ-08) | Entered as AZ names; a tag row is created per slug. No separate screen for tag translations. | flag only |
| NF-04 result shape | Actions return `{ ok, data } | { ok, error, fieldErrors? }` rather than `{ success, error }`. | no |

## 5. Exploratory checklist (§8)

Automated in `tests/e2e/admin/exploratory.spec.ts`; screenshots are written to **`tests/screenshots/`** (gitignored, regenerated on every run — 22 files: every admin page in dark and light mode, three pages at 1024 px, plus `public-mobile.png` from the mobile project).

- Every page in dark and light mode: rendered, screenshotted, theme class asserted.
- Invalid data in every form: field-level errors asserted (`exploratory.spec.ts`, `projects.spec.ts`, `i18n-hero.spec.ts`, `leads-settings-upload.spec.ts`).
- Rapid double-click on Save: one record, one toast (the button disables while pending).
- Refresh mid-edit: no partial write (DB snapshot compared).
- 1024 px width: no horizontal page overflow; tables scroll inside their card.

## 6. Known limitations

- **Rich-text E2E input** is driven by a synthetic paste event plus the bold toolbar button; headless keyboard choreography inside Tiptap was not deterministic enough to assert on. Formatting persistence is asserted from the database and on the public page.
- **Drag-and-drop** uses a slow pointer trail and a short pointer travel after the drop (dnd-kit ignores the very next synthetic click otherwise). Keyboard sorting (Space / arrows) also works but is not asserted.
- **Deleted storage objects** are verified through the bucket listing, not the public URL — Supabase's CDN keeps serving a deleted object for a while (`cacheControl` is one year).
- `LEAD-04` rate limiting is per process memory; a multi-instance deployment would need a shared store (documented in `src/lib/anti-spam.ts`).
- Playwright uses the installed Chrome (`channel: "chrome"`) instead of downloading Chromium; Chromium-only per the plan.
- The E2E suites mutate the seeded data and are ordered by file; `npm run test:all` resets the database once at the start. Running `npm run test:e2e` twice in a row without `npm run test:db` will see drifted data (e.g. the hero title already edited).
- `tests/fixtures/valid.jpg` is ~90 KB (the plan says ~200 KB); size only matters for the >5 MB case, which uses `too-large.jpg` (6.5 MB).
- Accessibility check filters on `impact === "critical"` as the plan allows; serious/moderate findings are not asserted.
- The `.env.test.local` used for the real-upload cases holds the Supabase service-role key; it is gitignored and should be rotated like any other key that was shared in chat.

---

# Part 2 — Public site QA plan (`nobug.az — QA Test Sənədləri`, 43 cases)

Same run, same commands. Public-site cases are automated in `tests/e2e/public/*.spec.ts` with the plan's IDs in the test names; production-only cases live in `tests/e2e/prod.spec.ts`. Test data submitted to the panel is prefixed `QA-TEST` and deleted by the test (locally through Prisma, on production through the panel's delete dialog).

## Open defects from §5 — status

| ID | Fix | Files | Verified by |
| --- | --- | --- | --- |
| OBS-01 | Every question must be answered before step 3: inline error under each unanswered question, focus moves to the first one, "Davam et" no longer advances. **Decision: answers are required** (they are what the panel shows the sales side); reverse if optional is preferred. | `src/components/anket/survey-form.tsx`, `src/lib/anket/survey.ts` (`errors.answer` az/en/ru) | ANK-03, LOC-05 |
| OBS-02 | Contact form is `method="post" action="/api/leads"` with hidden `source/lang/openedAt`; the route accepts form-encoded bodies and answers with a 303 back to `/az?sent=1#elaqe`. Inline validation added (name/email/subject). | `src/components/site/contact-form.tsx`, `src/app/api/leads/route.ts`, `src/lib/i18n/dict.ts` (`fieldRequired`, `fieldEmailInvalid`) | ELQ-01, ELQ-02, ELQ-05 |
| OBS-03 | Audit found every `<img>` already carries `alt` (decorative ones `alt=""`; Lucide icons are inline SVG). No change; the count in the observation was of empty alts. | — | A11Y-01 |
| OBS-04 | 404 no longer carries the home-page title: Next discards page metadata once `notFound()` runs, so the `[lang]` layout keeps a neutral default (`nobug`) and the home page owns its full title; `[lang]/not-found.tsx` is localized (az/en/ru) and sets "Səhifə tapılmadı — nobug" in the browser. Next's `noindex` stays. | `src/app/[lang]/not-found.tsx`, `src/app/[lang]/layout.tsx`, `src/app/[lang]/page.tsx`, `src/lib/not-found.ts` | NAV-08 |
| OBS-05 | Honeypot wrapper is `aria-hidden="true"`, input `tabindex="-1"` + `autocomplete="off"` on both forms (was already so; now asserted). | — | ELQ-06 |
| OBS-06 | `no-bug-eta.vercel.app` and the apex `nobug.az` 308 → `https://www.nobug.az/…`. | `next.config.ts` | SEO-03, LOC-06 (prod) |

Further findings while automating: language switch dropped the query string (LOC-01), Escape did not close the mobile menu (NAV-03), 12-column grids overflowed at 360 px and footer links at 768 px (RSP-01/LOC-04), sitemap lacked `x-default` (SEO-02), contrast of the hero projects strip / inactive language links / footer tools row, unnamed progress bar (A11Y-02), anket steps were not in browser history (ANK-05). All fixed in commit `02d15a3`.

## Case status

| Module | Automated & passing | Executed on production | Manual only / not run |
| --- | --- | --- | --- |
| 4.1 Naviqasiya | NAV-01 … NAV-08 | — | — |
| 4.2 Anket | ANK-01 … ANK-13 | ANK-11 (`QA-TEST anket …`: success screen shown, record in the inbox with service *Keyfiyyət təminatı*, e-mail channel and message; deleted afterwards) | — |
| 4.3 Əlaqə | ELQ-01 … ELQ-06 | ELQ-03 (`QA-TEST elaqe …`: confirmation shown, record in the inbox, deleted) | — |
| 4.4 Lokalizasiya | LOC-01, LOC-02 (automated part: no `key.name` / `undefined` / `NaN` leaks, `lang`, titles), LOC-03, LOC-04, LOC-05, LOC-06 (root → `/az`) | LOC-06 full (apex + http → `https://www.nobug.az/az`) | LOC-02 editorial review of translations |
| 4.5 Responsive | RSP-01 (360/768/1024/1440), RSP-02 (≥ 44 px targets) | — | **RSP-03** iOS Safari (real device), **RSP-04** Firefox/Edge/Safari — Chromium only in CI |
| 4.6 SEO / perf / a11y | SEO-01, SEO-02, A11Y-01, A11Y-02 (focus visible; axe wcag2a/aa serious+critical = 0 on `/az`, `/az/anket?xidmet=qa`, `/admin/login`) | SEO-03, SEO-01 canonical host | **PRF-01** — see below; A11Y-02 contrast on the navy bands checked by hand (axe excludes `[data-bg="dark"]`: their background comes from the scroll observer) |

**PRF-01 (Lighthouse 13, production `/az`, 2026-09-26):**

| Preset | Performance | Accessibility | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| Desktop | 99 | 97 | 100 | 1.0 s | 0 | 0 ms |
| Mobile (throttled) | **77** | 97 | 100 | **4.6 s** | 0 | 0 ms |

Mobile is below the ≥ 90 / LCP < 2.5 s target. Desktop and everything else pass. Candidate cause: the hero's largest element is the animated wordmark, whose `src` is only set after hydration (so it is not in the initial HTML and cannot be preloaded), plus three web fonts. Left open for a decision — the intro choreography is a design requirement; a static first frame with the animation swapped in afterwards would recover most of the LCP.

## Manual / production notes

- The production forms were exercised once each with `QA-TEST` data and cleaned up; the inbox holds no `QA-TEST` rows.
- E-mail notification is `MAIL_MODE=off` in production, as the plan states; when it is switched on, ANK-11/ELQ-03 need a re-run for the confirmation mails.
- The project folder is under iCloud sync, which keeps creating `… 2.ts` copies inside `.next/types` and `src/generated`; `npm run test:all` deletes them before `tsc`. Excluding the folder from iCloud avoids it.
