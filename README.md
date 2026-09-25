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
