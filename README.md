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
