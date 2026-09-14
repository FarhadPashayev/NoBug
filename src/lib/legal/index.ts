import type { Locale } from "@/lib/i18n/config";

// Legal pages — internally drafted, not legal advice. Counsel review is
// required before the company processes data at scale (see `note`).
// TODO: registered address and VÖEN once issued by the client.

export type LegalKey = "privacy" | "terms" | "processing";

export type LegalSection = { h: string; p?: string[]; list?: string[] };
export type LegalDoc = {
  title: string;
  updated: string; // "Son yenilənmə: …" line (mono eyebrow)
  intro: string;
  sections: LegalSection[];
  note: string; // counsel-review note at the bottom
};

export const LEGAL_SLUGS: Record<Locale, Record<LegalKey, string>> = {
  az: { privacy: "mexfilik-siyaseti", terms: "istifade-shertleri", processing: "melumatlarin-emali" },
  en: { privacy: "privacy-policy", terms: "terms-of-use", processing: "data-processing" },
  ru: { privacy: "politika-konfidencialnosti", terms: "usloviya-ispolzovaniya", processing: "obrabotka-dannyh" },
};

export const LEGAL_KEYS: LegalKey[] = ["privacy", "terms", "processing"];

export function legalKeyFromSlug(locale: Locale, slug: string): LegalKey | null {
  const entry = (Object.entries(LEGAL_SLUGS[locale]) as [LegalKey, string][]).find(([, s]) => s === slug);
  return entry ? entry[0] : null;
}

export const legalHref = (locale: Locale, key: LegalKey) => `/${locale}/${LEGAL_SLUGS[locale][key]}`;

const UPDATED = { az: "Son yenilənmə: 14 sentyabr 2026", en: "Last updated: 14 September 2026", ru: "Последнее обновление: 14 сентября 2026" };

const COMPANY = '"nobug" MMC';

// ───────────────────────────── AZ ─────────────────────────────
const az: Record<LegalKey, LegalDoc> = {
  privacy: {
    title: "Məxfilik siyasəti",
    updated: UPDATED.az,
    intro: "Bu sənəd nobug saytından istifadə edərkən hansı məlumatların toplandığını, nə üçün istifadə olunduğunu və hüquqlarınızı izah edir.",
    sections: [
      { h: "1. Məlumat nəzarətçisi", p: [`Şəxsi məlumatlarınızın nəzarətçisi ${COMPANY}-dir (Bakı, Azərbaycan). Əlaqə: saytın Əlaqə bölməsində göstərilən e-poçt ünvanı.`] },
      {
        h: "2. Hansı məlumatlar toplanır",
        p: ["Yalnız özünüz verdiyiniz və saytın işləməsi üçün texniki olaraq zəruri olan məlumatlar:"],
        list: ["ad və soyad;", "e-poçt ünvanı;", "telefon və ya WhatsApp nömrəsi (verdiyiniz halda);", "sorğu formasındakı cavablar və sərbəst mətn;", "analitika məlumatları: səhifə baxışları, cihaz tipi, brauzer, təxmini region, saytdakı hərəkətlər."],
      },
      { h: "3. Nə toplanmır", p: ["Ödəniş məlumatları toplanmır. Sağlamlıq, siyasi baxış, din və digər həssas kateqoriyalı məlumatlar soruşulmur və emal edilmir."] },
      {
        h: "4. Məlumat nə üçün istifadə olunur",
        list: ["müraciətinizə cavab vermək və sizinlə əlaqə saxlamaq;", "layihə üzrə ilkin qiymətləndirmə və təklif hazırlamaq;", "saytın istifadəsini ölçmək və məzmunu təkmilləşdirmək."],
      },
      { h: "5. Hüquqi əsas", p: ["Emalın əsası razılığınızdır. Razılıq formu göndərməklə verilir. Analitika üçün razılıq brauzer parametrləri və gələcəkdə əlavə olunacaq cookie seçimi vasitəsilə idarə olunur."] },
      {
        h: "6. Məlumat kimə ötürülür",
        p: ["Məlumat üçüncü tərəflərə satılmır. Yalnız aşağıdakı xidmət təminatçıları texniki emal üçün məlumata çıxış ala bilər:"],
        list: ["Google (Gmail) — müraciətlərin daxil olduğu poçt qutusu;", "Resend, Inc. — e-poçt göndərmə xidməti (aktivləşdirildikdə);", "Google Ireland Ltd. (Google Analytics 4) — sayt analitikası;", "Vercel, Inc. — saytın hostinqi və server logları."],
      },
      { h: "7. Saxlama müddəti və silinmə", p: ["Müraciət məlumatları müraciətdən sonra 24 ay saxlanılır, sonra silinir. Layihə müqaviləsi bağlanarsa, məlumat müqavilənin şərtlərinə uyğun saxlanılır.", "Silinmə tələbi üçün Əlaqə bölməsindəki e-poçt ünvanına yazın. Tələb 30 gün ərzində icra edilir."] },
      {
        h: "8. Hüquqlarınız",
        list: ["haqqınızda saxlanılan məlumata çıxış;", "səhv məlumatın düzəldilməsi;", "məlumatın silinməsi;", "razılığın istənilən vaxt geri götürülməsi — bu, geri götürülməyə qədər aparılmış emalın qanuniliyinə təsir etmir."],
        p: ["Bu hüquqlardan istifadə üçün Əlaqə bölməsindəki e-poçt ünvanına müraciət edin."],
      },
      {
        h: "9. Cookie faylları",
        p: ["Sayt öz cookie faylı yaratmır. Google Analytics 4 aktiv olduqda aşağıdakı cookie-lər yazılır:"],
        list: ["_ga — istifadəçini fərqləndirmək üçün, 2 il;", "_ga_<id> — sessiya vəziyyətini saxlamaq üçün, 2 il."],
      },
      { h: "10. Dəyişikliklər", p: ["Bu siyasətə dəyişiklik edildikdə yeni versiya bu səhifədə dərc olunur və yuxarıdakı tarix yenilənir. Əhəmiyyətli dəyişikliklər barədə ana səhifədə bildiriş yerləşdirilir."] },
    ],
    note: "Bu sənəd daxili qaydada hazırlanıb və hüquqi məsləhət deyil. Şirkət məlumatları geniş miqyasda emal etməyə başlamazdan əvvəl sənəd hüquqşünas tərəfindən nəzərdən keçiriləcək.",
  },
  terms: {
    title: "İstifadə şərtləri",
    updated: UPDATED.az,
    intro: "Bu şərtlər nobug saytından istifadəni tənzimləyir. Saytdan istifadə etməklə şərtləri qəbul etmiş olursunuz.",
    sections: [
      { h: "1. Əhatə dairəsi", p: [`Sayt ${COMPANY} tərəfindən idarə olunur və şirkətin xidmətləri barədə məlumat vermək, müraciət qəbul etmək məqsədi daşıyır.`] },
      {
        h: "2. İcazə verilən istifadə",
        p: ["Saytdan yalnız qanuni məqsədlərlə istifadə etmək olar. Qadağandır:"],
        list: ["saytın işinə müdaxilə etmək, avtomatlaşdırılmış sorğularla yükləmək;", "formaları yalan məlumatla və ya spam məqsədilə doldurmaq;", "saytın məzmununu icazəsiz kopyalayıb kommersiya məqsədilə yaymaq."],
      },
      { h: "3. Əqli mülkiyyət", p: ["Saytdakı mətnlər, şəkillər, loqo və “nobug” adı şirkətə məxsusdur və ya lisenziya ilə istifadə olunur. Yazılı icazə olmadan çoxaltmaq və ya dəyişdirmək olmaz. Şəxsi məlumat məqsədilə baxmaq və istinad etmək sərbəstdir."] },
      { h: "4. Məlumatın dəqiqliyi", p: ["Saytdakı məlumat ümumi xarakter daşıyır və təklif deyil. Xidmətlərin həcmi, müddəti və qiyməti yalnız yazılı müqavilə ilə müəyyən edilir."] },
      { h: "5. Əlçatanlıq", p: ["Saytın fasiləsiz və xətasız işləməsinə zəmanət verilmir. Texniki işlər və ya üçüncü tərəf xidmətlərindəki nasazlıq səbəbindən sayt müvəqqəti əlçatmaz ola bilər."] },
      { h: "6. Məsuliyyətin məhdudlaşdırılması", p: ["Qanunun icazə verdiyi həddə şirkət saytdan istifadə və ya istifadə edə bilməmək nəticəsində yaranan dolayı zərərə görə məsuliyyət daşımır."] },
      { h: "7. Kənar linklər", p: ["Sayt üçüncü tərəf saytlarına link verə bilər. Həmin saytların məzmununa və məxfilik təcrübəsinə görə şirkət cavabdeh deyil."] },
      { h: "8. Tətbiq olunan qanun", p: ["Bu şərtlər Azərbaycan Respublikasının qanunvericiliyi ilə tənzimlənir. Mübahisələr Azərbaycan Respublikasının məhkəmələrində həll edilir."] },
      { h: "9. Əlaqə", p: ["Şərtlərlə bağlı suallar üçün Əlaqə bölməsindəki e-poçt ünvanına yazın."] },
    ],
    note: "Bu sənəd daxili qaydada hazırlanıb və hüquqi məsləhət deyil. Şirkət məlumatları geniş miqyasda emal etməyə başlamazdan əvvəl sənəd hüquqşünas tərəfindən nəzərdən keçiriləcək.",
  },
  processing: {
    title: "Məlumatların emalı",
    updated: UPDATED.az,
    intro: "Layihə zamanı müştəri məlumatının necə idarə olunduğu. Bu, Standartlar cədvəlində göstərilən praktikaların izahıdır.",
    sections: [
      { h: "1. Prinsip", p: ["Müştəri məlumatı müştəriyə məxsusdur. Layihə çərçivəsində məlumata yalnız işi görmək üçün zəruri olan həcmdə və müddətdə çıxış alınır. Təhvildə bütün hesablar və giriş məlumatları müştərinin adına keçirilir."] },
      { h: "2. Giriş idarəsi", p: ["Sistemlərə giriş rol əsaslıdır: hər əməkdaş yalnız öz vəzifəsi üçün lazım olan resurslara çıxış alır. Bütün hesablarda iki faktorlu doğrulama tələb olunur (Microsoft Entra ID). Layihə bitdikdə müvəqqəti girişlər ləğv edilir."] },
      { h: "3. Ehtiyat nüsxə və bərpa", p: ["Layihə məlumatının ehtiyat nüsxəsi şifrələnmiş şəkildə saxlanılır (Azure Backup). Bərpa proseduru vaxtaşırı sınaqdan keçirilir — nüsxənin mövcudluğu deyil, bərpa oluna bilməsi yoxlanılır."] },
      { h: "4. Kod və buraxılış", p: ["Bütün dəyişikliklər versiya tarixçəsi ilə saxlanılır. Kod baxışdan keçmədən və avtomatik testlər uğurla tamamlanmadan istehsalata çıxarılmır (GitHub Actions). Gizli açarlar kodda saxlanılmır."] },
      { h: "5. Monitorinq və hadisələr", p: ["Sistemlər və API-lər izlənilir (Zabbix, Grafana). Kritik hadisə barədə bildiriş alınır; dəstək müqaviləsində göstərilən müddətdə ilk cavab verilir. Hadisənin səbəbi və görülən tədbirlər müştəriyə yazılı təqdim olunur."] },
      { h: "6. Üçüncü tərəf xidmətləri", p: ["Layihədə istifadə olunan bulud və xidmət təminatçıları müştəri ilə əvvəlcədən razılaşdırılır. Həssas məlumat üçün lokal və ya qapalı mühit seçimi təklif olunur."] },
      { h: "7. Sertifikatlaşma", p: ["Şirkət hazırda ISO/IEC 27001 və ya digər sertifikata malik deyil. Sertifikatlaşma planlaşdırılır; nəticə əldə olunduqca bu səhifə və Standartlar cədvəli yenilənir."] },
      { h: "8. Sual və tələblər", p: ["Məlumatların emalı ilə bağlı suallar və ya audit tələbi üçün Əlaqə bölməsindəki e-poçt ünvanına yazın."] },
    ],
    note: "Bu sənəd daxili qaydada hazırlanıb və hüquqi məsləhət deyil. Şirkət məlumatları geniş miqyasda emal etməyə başlamazdan əvvəl sənəd hüquqşünas tərəfindən nəzərdən keçiriləcək.",
  },
};

// ───────────────────────────── EN ─────────────────────────────
const NOTE_EN = "This document was drafted internally and is not legal advice. It will be reviewed by counsel before the company begins processing data at scale.";
const en: Record<LegalKey, LegalDoc> = {
  privacy: {
    title: "Privacy policy",
    updated: UPDATED.en,
    intro: "This document explains what data is collected when you use the nobug site, what it is used for, and what your rights are.",
    sections: [
      { h: "1. Data controller", p: [`The controller of your personal data is ${COMPANY} (Baku, Azerbaijan). Contact: the email address shown in the Contact section of the site.`] },
      {
        h: "2. What is collected",
        p: ["Only the data you provide yourself and what is technically required for the site to work:"],
        list: ["first and last name;", "email address;", "phone or WhatsApp number (if you provide one);", "the answers and free text in the enquiry form;", "analytics data: page views, device type, browser, approximate region, on-site actions."],
      },
      { h: "3. What is not collected", p: ["No payment data is collected. Health, political opinion, religion and other sensitive categories are neither requested nor processed."] },
      { h: "4. Why it is used", list: ["to respond to your enquiry and stay in contact;", "to prepare an initial assessment and a proposal;", "to measure site usage and improve the content."] },
      { h: "5. Legal basis", p: ["Processing is based on your consent, given by submitting the form. Consent for analytics is managed through browser settings and, in future, a cookie choice on the site."] },
      {
        h: "6. Who it is shared with",
        p: ["Data is not sold to third parties. Only the following service providers may access it for technical processing:"],
        list: ["Google (Gmail) — the mailbox that receives enquiries;", "Resend, Inc. — email delivery service (once enabled);", "Google Ireland Ltd. (Google Analytics 4) — site analytics;", "Vercel, Inc. — hosting and server logs."],
      },
      { h: "7. Retention and deletion", p: ["Enquiry data is kept for 24 months after the enquiry, then deleted. If a project contract is signed, data is kept under the terms of that contract.", "To request deletion, write to the email address in the Contact section. Requests are fulfilled within 30 days."] },
      {
        h: "8. Your rights",
        list: ["access to the data held about you;", "correction of inaccurate data;", "deletion;", "withdrawal of consent at any time — this does not affect the lawfulness of processing carried out before withdrawal."],
        p: ["To exercise these rights, contact the email address in the Contact section."],
      },
      { h: "9. Cookies", p: ["The site sets no cookies of its own. When Google Analytics 4 is active, the following cookies are set:"], list: ["_ga — distinguishes users, 2 years;", "_ga_<id> — keeps session state, 2 years."] },
      { h: "10. Changes", p: ["When this policy changes, the new version is published on this page and the date above is updated. Material changes are announced on the home page."] },
    ],
    note: NOTE_EN,
  },
  terms: {
    title: "Terms of use",
    updated: UPDATED.en,
    intro: "These terms govern the use of the nobug site. By using the site you accept them.",
    sections: [
      { h: "1. Scope", p: [`The site is operated by ${COMPANY} to present the company's services and receive enquiries.`] },
      { h: "2. Permitted use", p: ["The site may be used for lawful purposes only. The following is prohibited:"], list: ["interfering with the site or loading it with automated requests;", "submitting forms with false information or for spam;", "copying site content without permission and distributing it commercially."] },
      { h: "3. Intellectual property", p: ["The texts, images, logo and the “nobug” name belong to the company or are used under licence. They may not be reproduced or altered without written permission. Viewing and referencing for personal information is free."] },
      { h: "4. Accuracy of information", p: ["Information on the site is general and does not constitute an offer. The scope, timeline and price of services are defined only in a written contract."] },
      { h: "5. Availability", p: ["Uninterrupted, error-free operation of the site is not guaranteed. The site may be temporarily unavailable due to maintenance or failures in third-party services."] },
      { h: "6. Limitation of liability", p: ["To the extent permitted by law, the company is not liable for indirect damage arising from use of, or inability to use, the site."] },
      { h: "7. External links", p: ["The site may link to third-party sites. The company is not responsible for their content or privacy practices."] },
      { h: "8. Applicable law", p: ["These terms are governed by the laws of the Republic of Azerbaijan. Disputes are settled in the courts of the Republic of Azerbaijan."] },
      { h: "9. Contact", p: ["For questions about these terms, write to the email address in the Contact section."] },
    ],
    note: NOTE_EN,
  },
  processing: {
    title: "Data processing",
    updated: UPDATED.en,
    intro: "How client data is handled during a project. This explains the practices listed in the Standards table.",
    sections: [
      { h: "1. Principle", p: ["Client data belongs to the client. Within a project, access is granted only to the extent and for the time needed to do the work. At handover, all accounts and credentials are transferred to the client."] },
      { h: "2. Access control", p: ["Access to systems is role-based: each team member reaches only the resources their role requires. Two-factor authentication is required on all accounts (Microsoft Entra ID). Temporary access is revoked when the project ends."] },
      { h: "3. Backup and recovery", p: ["Project data is backed up in encrypted form (Azure Backup). The restore procedure is tested periodically — what is checked is that a backup can be restored, not merely that it exists."] },
      { h: "4. Code and releases", p: ["Every change is kept with version history. Nothing goes to production without code review and passing automated tests (GitHub Actions). Secrets are not stored in code."] },
      { h: "5. Monitoring and incidents", p: ["Systems and APIs are monitored (Zabbix, Grafana). Critical incidents raise an alert; the first response is given within the time stated in the support agreement. The cause and the actions taken are reported to the client in writing."] },
      { h: "6. Third-party services", p: ["Cloud and service providers used in a project are agreed with the client in advance. For sensitive data, a local or closed environment is offered."] },
      { h: "7. Certification", p: ["The company does not currently hold ISO/IEC 27001 or any other certification. Certification is planned; this page and the Standards table will be updated as results are obtained."] },
      { h: "8. Questions and requests", p: ["For questions about data processing or an audit request, write to the email address in the Contact section."] },
    ],
    note: NOTE_EN,
  },
};

// ───────────────────────────── RU ─────────────────────────────
const NOTE_RU = "Этот документ подготовлен внутренними силами и не является юридической консультацией. До начала обработки данных в значительном объёме документ будет проверен юристом.";
const ru: Record<LegalKey, LegalDoc> = {
  privacy: {
    title: "Политика конфиденциальности",
    updated: UPDATED.ru,
    intro: "Этот документ объясняет, какие данные собираются при использовании сайта nobug, для чего они используются и какие у вас права.",
    sections: [
      { h: "1. Оператор данных", p: [`Оператором ваших персональных данных является ${COMPANY} (Баку, Азербайджан). Контакт: адрес электронной почты, указанный в разделе «Контакты» сайта.`] },
      {
        h: "2. Какие данные собираются",
        p: ["Только данные, которые вы предоставляете сами, и технически необходимые для работы сайта:"],
        list: ["имя и фамилия;", "адрес электронной почты;", "номер телефона или WhatsApp (если вы его указали);", "ответы и свободный текст в форме запроса;", "данные аналитики: просмотры страниц, тип устройства, браузер, примерный регион, действия на сайте."],
      },
      { h: "3. Что не собирается", p: ["Платёжные данные не собираются. Данные о здоровье, политических взглядах, религии и другие чувствительные категории не запрашиваются и не обрабатываются."] },
      { h: "4. Для чего используются данные", list: ["чтобы ответить на ваш запрос и поддерживать связь;", "чтобы подготовить предварительную оценку и предложение;", "чтобы измерять использование сайта и улучшать содержание."] },
      { h: "5. Правовое основание", p: ["Основание обработки — ваше согласие, которое даётся отправкой формы. Согласие на аналитику управляется настройками браузера и, в будущем, выбором cookie на сайте."] },
      {
        h: "6. Кому передаются данные",
        p: ["Данные не продаются третьим лицам. Доступ для технической обработки могут получать только следующие поставщики услуг:"],
        list: ["Google (Gmail) — почтовый ящик, в который поступают запросы;", "Resend, Inc. — сервис отправки писем (после подключения);", "Google Ireland Ltd. (Google Analytics 4) — аналитика сайта;", "Vercel, Inc. — хостинг и серверные логи."],
      },
      { h: "7. Срок хранения и удаление", p: ["Данные запроса хранятся 24 месяца после обращения, затем удаляются. Если заключён договор на проект, данные хранятся на условиях этого договора.", "Для запроса на удаление напишите на адрес из раздела «Контакты». Запрос выполняется в течение 30 дней."] },
      {
        h: "8. Ваши права",
        list: ["доступ к хранимым о вас данным;", "исправление неточных данных;", "удаление;", "отзыв согласия в любой момент — это не влияет на законность обработки, выполненной до отзыва."],
        p: ["Для реализации этих прав обратитесь на адрес из раздела «Контакты»."],
      },
      { h: "9. Cookie", p: ["Сайт не устанавливает собственных cookie. При активном Google Analytics 4 устанавливаются следующие cookie:"], list: ["_ga — различает пользователей, 2 года;", "_ga_<id> — хранит состояние сессии, 2 года."] },
      { h: "10. Изменения", p: ["При изменении политики новая версия публикуется на этой странице, дата выше обновляется. О существенных изменениях сообщается на главной странице."] },
    ],
    note: NOTE_RU,
  },
  terms: {
    title: "Условия использования",
    updated: UPDATED.ru,
    intro: "Эти условия регулируют использование сайта nobug. Используя сайт, вы принимаете их.",
    sections: [
      { h: "1. Область применения", p: [`Сайт управляется ${COMPANY} и предназначен для представления услуг компании и приёма запросов.`] },
      { h: "2. Разрешённое использование", p: ["Сайт можно использовать только в законных целях. Запрещено:"], list: ["вмешиваться в работу сайта или нагружать его автоматическими запросами;", "заполнять формы ложными данными или в целях спама;", "копировать содержание сайта без разрешения и распространять его в коммерческих целях."] },
      { h: "3. Интеллектуальная собственность", p: ["Тексты, изображения, логотип и название «nobug» принадлежат компании или используются по лицензии. Их нельзя воспроизводить или изменять без письменного разрешения. Просмотр и ссылки в личных информационных целях свободны."] },
      { h: "4. Точность информации", p: ["Информация на сайте носит общий характер и не является офертой. Объём, сроки и цена услуг определяются только письменным договором."] },
      { h: "5. Доступность", p: ["Бесперебойная и безошибочная работа сайта не гарантируется. Сайт может быть временно недоступен из-за технических работ или сбоев сторонних сервисов."] },
      { h: "6. Ограничение ответственности", p: ["В пределах, допускаемых законом, компания не несёт ответственности за косвенный ущерб, возникший в результате использования сайта или невозможности его использования."] },
      { h: "7. Внешние ссылки", p: ["Сайт может содержать ссылки на сторонние сайты. Компания не отвечает за их содержание и практику конфиденциальности."] },
      { h: "8. Применимое право", p: ["Эти условия регулируются законодательством Азербайджанской Республики. Споры разрешаются в судах Азербайджанской Республики."] },
      { h: "9. Контакты", p: ["По вопросам об условиях пишите на адрес из раздела «Контакты»."] },
    ],
    note: NOTE_RU,
  },
  processing: {
    title: "Обработка данных",
    updated: UPDATED.ru,
    intro: "Как обрабатываются данные клиента в ходе проекта. Это пояснение практик, перечисленных в таблице «Стандарты».",
    sections: [
      { h: "1. Принцип", p: ["Данные клиента принадлежат клиенту. В рамках проекта доступ предоставляется только в объёме и на срок, необходимые для выполнения работы. При сдаче все учётные записи и доступы передаются клиенту."] },
      { h: "2. Управление доступом", p: ["Доступ к системам ролевой: каждый сотрудник получает только те ресурсы, которые нужны для его роли. На всех учётных записях требуется двухфакторная аутентификация (Microsoft Entra ID). По завершении проекта временные доступы отзываются."] },
      { h: "3. Резервное копирование и восстановление", p: ["Данные проекта резервируются в зашифрованном виде (Azure Backup). Процедура восстановления периодически проверяется — проверяется возможность восстановить копию, а не только её наличие."] },
      { h: "4. Код и релизы", p: ["Все изменения хранятся с историей версий. Ничто не выходит в продакшен без код-ревью и успешных автотестов (GitHub Actions). Секреты в коде не хранятся."] },
      { h: "5. Мониторинг и инциденты", p: ["Системы и API находятся под наблюдением (Zabbix, Grafana). О критическом инциденте поступает оповещение; первый ответ даётся в срок, указанный в договоре поддержки. Причина и принятые меры сообщаются клиенту письменно."] },
      { h: "6. Сторонние сервисы", p: ["Облачные и сервисные поставщики, используемые в проекте, заранее согласуются с клиентом. Для чувствительных данных предлагается локальная или закрытая среда."] },
      { h: "7. Сертификация", p: ["Компания в настоящее время не имеет сертификата ISO/IEC 27001 или иного. Сертификация планируется; по мере получения результатов эта страница и таблица «Стандарты» будут обновлены."] },
      { h: "8. Вопросы и запросы", p: ["По вопросам обработки данных или для запроса аудита пишите на адрес из раздела «Контакты»."] },
    ],
    note: NOTE_RU,
  },
};

export const LEGAL: Record<Locale, Record<LegalKey, LegalDoc>> = { az, en, ru };
