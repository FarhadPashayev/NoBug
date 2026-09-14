import type { Locale } from "./config";

// Copy lifted verbatim from DICT + EXTRA in `nobug Korporativ v2.dc.html`.
// Facts that were not available (team, certificates, phone) are deliberately
// absent — do not re-introduce invented figures.

export type Dictionary = {
  meta: { title: string; description: string };
  nav: [string, string][]; // [anchor, label]
  cta: string;
  eyebrow: string;
  h1: string;
  heroText: string;
  heroLink: string;
  figLabel: string; // "Şək." / "Fig." / "Рис." — numbers come from lib/figures.ts
  captions: Record<"hero" | "band" | "services" | "about" | "tech" | "careers", string>;
  alt01: string;
  alt02: string;
  alt03: string;
  alt04: string;
  alt05: string;
  alt07: string;
  figures: [string, string, string][]; // value, label, source
  servicesTitle: string;
  servicesMeta: string;
  servicesSecondary: string; // eyebrow of the quieter 8-item list
  services: [string, string][]; // title, one-line description — indexed in LEGACY_ORDER (lib/services.ts)
  projects: { eyebrow: string; title: string; items: [string, string, string][] }; // label, description, year
  caseStudy: {
    eyebrow: string;
    title: string;
    labels: [string, string, string, string]; // Müştəri / Müddət / İş / İl
    facts: [string, string, string, string];
    blocks: [string, string][]; // heading, paragraph
  };
  sectionIndex: [string, string][]; // anchor, label — vertical index in the left margin
  quoteEyebrow: string;
  quote: string;
  quoteName: string;
  quoteTitle: string;
  aboutP1: string;
  aboutP2: string;
  techTitle: string;
  techNote: string;
  techHead: [string, string, string, string];
  techRows: [string, string, string, string][];
  techFootnote: string;
  careersTitle: string;
  careersText: string;
  careersLink: string;
  contactEyebrow: string;
  contactTitle: string;
  contactText: string;
  contactEmailLabel: string;
  contactRows: [string, string][]; // address, hours — email comes from lib/site.ts
  contactReplyNote: string;
  formLabel: string;
  fieldName: string;
  fieldEmail: string;
  fieldMessage: string;
  formSubmit: string;
  formSending: string;
  formSent: string;
  formError: string;
  footerCols: [string, string[]][]; // Xidmətlər (from FOOTER_SERVICES) · Şirkət · Hüquqi
  footerContact: string; // "Əlaqə" column title — items come from lib/site.ts
  legal: string[];
  menu: string;
  home: string;
};

const az: Dictionary = {
  meta: {
    title: "nobug — IT şirkəti, Bakı",
    description: "Proqram təminatı, infrastruktur və analitika üzrə uçdan-uca icra. Planlaşdırma, tətbiq və təhvildən sonrakı dəstək tək komanda tərəfindən aparılır.",
  },
  nav: [["#xidmetler", "Xidmətlər"], ["#texnologiya", "Texnologiya"], ["#haqqinda", "Haqqında"], ["#karyera", "Karyera"], ["#elaqe", "Əlaqə"]],
  cta: "Layihəni müzakirə et",
  eyebrow: "nobug · Bakı · 2026-cı ildən",
  h1: "Təhvil verdiyimiz sistem işləyir.",
  heroText: "Proqram təminatı, infrastruktur və analitika üzrə uçdan-uca icra. Planlaşdırma, tətbiq və təhvildən sonrakı dəstək tək komanda tərəfindən aparılır.",
  heroLink: "Layihəni müzakirə et",
  figLabel: "Şək.",
  captions: {
    hero: "Şəbəkə kommutatoru və kabel rafı",
    band: "Server otağı, Bakı",
    services: "Server şkafı, struktur kabel sistemi",
    about: "Bakı, dəniz kənarı bulvar",
    tech: "Ofis binasının şüşə fasadı",
    careers: "İş anı: üç monitorlu iş yeri",
  },
  alt01: "Şəbəkə kommutatorunun yaxın planı: portlara qoşulmuş narıncı və mavi kabellər",
  alt02: "Data zalının tək nöqtəli perspektivi: iki tərəfdə server rafları, tavanda işıq zolağı",
  alt03: "Açıq server şkafı, içində sıx düzülmüş və bağlanmış şəbəkə kabelləri",
  alt04: "Bakının dəniz kənarı bulvarı və müasir şəhər silueti, gündüz",
  alt05: "Qaranlıq otaqda üç monitor qarşısında işləyən adam, ekranlarda kod",
  alt07: "Müasir ofis binasının şüşə fasadı, diaqonal baxış",
  figures: [
    ["12", "xidmət istiqaməti", "2026 · xidmət kataloqu"],
    ["2", "istifadədə olan layihə", "2026 · beic.az, bbq.az"],
    ["< 2 saat", "dəstək müqaviləsində birinci cavab öhdəliyi", "2026 · SLA şərtləri"],
  ],
  servicesTitle: "Xidmət indeksi",
  servicesMeta: "Bölmə 01 · 12 xidmət",
  servicesSecondary: "Əlavə xidmətlər",
  services: [
    ["IT infrastrukturu", "Server, şəbəkə və iş stansiyalarının qurulması, miqrasiyası və aylıq dəstəyi."],
    ["CRM və ERP tətbiqi", "Bitrix24, Odoo və fərdi sistemlərin tətbiqi; satış, anbar və maliyyə proseslərinin birləşdirilməsi."],
    ["Data analitikası", "Məlumat mənbələrinin birləşdirilməsi, təmizlənməsi və hesabat panelləri."],
    ["Veb və e-ticarət", "Korporativ saytlar, e-ticarət və mövcud sistemlərlə inteqrasiya."],
    ["Rəqəmsal marketinq", "Axtarış və sosial kanallarda kampaniya idarəsi, kontent və ölçmə."],
    ["Keyfiyyət təminatı", "Manual və avtomatlaşdırılmış test, reqressiya dəstləri, buraxılış auditi."],
    ["Mobil tətbiqlərin hazırlanması", "iOS və Android üçün tətbiqlər: layihələndirmə, hazırlanma, store-a yerləşdirmə və versiya dəstəyi."],
    ["Bot həlləri", "Telegram və WhatsApp botları: sifariş qəbulu, bildirişlər və mövcud sistemlərlə inteqrasiya."],
    ["Süni intellekt həlləri", "Sənəd emalı, müştəri sorğularının cavablandırılması və daxili axtarış üçün model tətbiqi."],
    ["AI ilə video hazırlanması", "Məhsul təqdimatı, təlim və sosial kanal videoları: mətn, səs və montaj AI alətləri ilə."],
    ["Konsultasiya", "Mövcud sistemlərin auditi, texnoloji seçim və rəqəmsallaşma planının hazırlanması — saatlıq və ya layihə üzrə."],
    ["Günlük kirayə idarəetməsi", "Rezervasiya, qonaq kommunikasiyası, qiymətləndirmə və təmizlik qrafikinin uzaqdan idarəsi."],
  ],
  projects: {
    eyebrow: "Bölmə 02 · Layihələr",
    title: "İstehsalatda olan layihələr",
    items: [
      ["Korporativ sayt və məzmun paneli", "Landing page-dən tam saytadək; müştəri komandası məzmunu özü idarə edir.", "2026"],
      ["bbq.az", "Ölkə üzrə fəaliyyət göstərən marketinq agentliyinin korporativ saytı.", "2026"],
    ],
  },
  caseStudy: {
    eyebrow: "Bölmə 03 · Layihə icmalı",
    title: "Korporativ sayt və məzmun idarəetmə paneli",
    labels: ["Müştəri", "Müddət", "İş", "İl"],
    facts: ["Bakıda fəaliyyət göstərən şirkət", "3 ay", "Korporativ sayt və məzmun idarəetmə paneli", "2026"],
    blocks: [
      ["Vəziyyət", "Müştərinin yalnız bir səhifəlik landing page-i var idi. Məzmun statik idi — hər dəyişiklik üçün kənar icraçıya müraciət etmək lazım gəlirdi. Xəbər, elan və ya genişləndirilmiş məhsul məlumatı yerləşdirmək praktiki olaraq mümkün deyildi."],
      ["Yanaşma", "İşə görüşlə başladıq: kimin nəyi, hansı tezliklə redaktə edəcəyini və mövcud iş axınının harada dayandığını müəyyən etdik. Sonra dizayn, ardınca tam sayt və admin panel. Panel rollara görə giriş, səhifə və xəbər redaktoru, media kitabxanası ilə təhvil verildi."],
      ["Nəticə", "Məzmun dəyişikliyi artıq kənar asılılıq deyil — müştəri komandası saytı özü redaktə edir. Xəbər bölməsi işə düşdü; şirkət istifadəçilərinə əvvəllər saytda yer verə bilmədiyi ətraflı məlumatı indi özü yerləşdirir."],
    ],
  },
  sectionIndex: [["#xidmetler", "Xidmətlər"], ["#layiheler", "Layihələr"], ["#layihe-icmali", "Layihə icmalı"], ["#texnologiya", "Standartlar"], ["#karyera", "Karyera"], ["#elaqe", "Əlaqə"]],
  quoteEyebrow: "Mövqe",
  quote: "Bizim işimizin ölçüsü təqdimat deyil — altıncı aydan sonra sistemin neçə dəfə dayandığıdır.",
  quoteName: "nobug",
  quoteTitle: "Mövqe · Bakı, 2026",
  aboutP1: "nobug 2026-cı ildə Bakıda quruldu. Komanda mühəndislik, QA və dəstək istiqamətlərini əhatə edir. İlk layihələrimiz beic.az və bbq.az saytlarıdır.",
  aboutP2: "Layihələri bir neçə podratçı arasında bölmürük. Analitika, tətbiq və təhvildən sonrakı dəstək eyni komandanın məsuliyyətindədir; hər mərhələnin təhvil sənədi və müddəti müqavilədə göstərilir.",
  techTitle: "Standartlar və sertifikatlar",
  techNote: "Sertifikatlaşma prosesi hələ başlamamışdır. Aşağıda işdə istifadə etdiyimiz praktika və alətlər göstərilib.",
  techHead: ["Sahə", "Yanaşma", "Alət və platforma", "Vəziyyət"],
  techRows: [
    ["Məlumatın qorunması", "Şifrələnmiş ehtiyat nüsxə, bərpa testi", "Azure Backup", "Tətbiq olunur"],
    ["Giriş idarəsi", "Rol əsaslı giriş, iki faktorlu doğrulama", "Microsoft Entra ID", "Tətbiq olunur"],
    ["Kod və buraxılış", "Kod baxışı, avtomatik test, versiya tarixçəsi", "GitHub Actions", "Tətbiq olunur"],
    ["Monitorinq", "Sistem və API izlənməsi, hadisə bildirişi", "Zabbix, Grafana", "Tətbiq olunur"],
    ["ISO/IEC 27001", "Sertifikatlaşma", "—", "Planlaşdırılır"],
  ],
  techFootnote: "Sertifikat əldə olunduqca cədvələ nömrə və etibarlılıq tarixi əlavə olunur.",
  careersTitle: "Komandaya qoşulmaq",
  careersText: "Hazırda açıq vakansiya yoxdur. Mühəndislik, QA və dəstək istiqamətləri üzrə müraciətlər il boyu qəbul olunur və növbəti açılışda nəzərdən keçirilir.",
  careersLink: "Müraciət göndər",
  contactEyebrow: "Əlaqə",
  contactTitle: "Layihənin ilkin qiymətləndirməsi",
  contactText: "İlk görüş və ilkin qiymətləndirmə ödənişsizdir. Adətən bir iş günü ərzində cavab veririk.",
  contactEmailLabel: "E-poçt",
  contactRows: [["Ünvan", "Bakı, Azərbaycan"], ["İş saatları", "B.e — Cümə, 09:00 — 18:00"]],
  contactReplyNote: "Yazılı müraciətlərə bir iş günü ərzində cavab veririk.",
  formLabel: "Qısa sorğu",
  fieldName: "Ad Soyad",
  fieldEmail: "E-poçt",
  fieldMessage: "Mövzu",
  formSubmit: "Göndər",
  formSending: "Göndərilir…",
  formSent: "Sorğunuz qeydə alındı. Bir iş günü ərzində cavab veririk.",
  formError: "Göndərmək alınmadı. Bir az sonra yenidən cəhd edin və ya birbaşa e-poçt yazın.",
  footerCols: [
    ["Xidmətlər", ["IT infrastrukturu", "CRM və ERP", "Mobil tətbiqlər", "Süni intellekt həlləri", "AI ilə video", "Konsultasiya"]],
    ["Şirkət", ["Haqqında", "Karyera", "Əlaqə"]],
    ["Hüquqi", ["Məxfilik siyasəti", "İstifadə şərtləri", "Məlumatların emalı"]],
  ],
  footerContact: "Əlaqə",
  legal: ['"nobug" MMC', "Bakı, Azərbaycan", "© 2026"],
  menu: "Menyu",
  home: "Ana səhifə",
};

const en: Dictionary = {
  meta: {
    title: "nobug — IT company, Baku",
    description: "End-to-end delivery across software, infrastructure and analytics. Planning, implementation and post-handover support are carried out by one team.",
  },
  nav: [["#xidmetler", "Solutions"], ["#texnologiya", "Technology"], ["#haqqinda", "About"], ["#karyera", "Careers"], ["#elaqe", "Contact"]],
  cta: "Discuss a project",
  eyebrow: "nobug · Baku · since 2026",
  h1: "The system we hand over runs.",
  heroText: "End-to-end delivery across software, infrastructure and analytics. Planning, implementation and post-handover support are carried out by one team.",
  heroLink: "Discuss a project",
  figLabel: "Fig.",
  captions: {
    hero: "Network switch and cable rack",
    band: "Server room, Baku",
    services: "Server cabinet, structured cabling",
    about: "Baku, seaside boulevard",
    tech: "Glass facade of an office building",
    careers: "At work: a three-monitor workstation",
  },
  alt01: "Close-up of a network switch with orange and blue cables plugged into its ports",
  alt02: "One-point perspective of a data hall: server racks on both sides, a light strip on the ceiling",
  alt03: "Open server cabinet with densely routed network cabling",
  alt04: "Baku seaside boulevard with the modern skyline, daytime",
  alt05: "A person working at three monitors in a dark room, code on the screens",
  alt07: "Glass facade of a modern office building, diagonal view",
  figures: [
    ["12", "service areas", "2026 · service catalogue"],
    ["2", "projects in production", "2026 · beic.az, bbq.az"],
    ["< 2 hours", "first-response commitment in the support agreement", "2026 · SLA terms"],
  ],
  servicesTitle: "Service index",
  servicesMeta: "Section 01 · 12 services",
  servicesSecondary: "Additional services",
  services: [
    ["IT infrastructure", "Deployment, migration and monthly support of servers, networks and workstations."],
    ["CRM and ERP implementation", "Bitrix24, Odoo and custom systems; consolidating sales, inventory and finance."],
    ["Data analytics", "Consolidating and cleaning data sources, and the reporting layer on top of them."],
    ["Web and e-commerce", "Corporate sites, e-commerce and integration with existing systems."],
    ["Digital marketing", "Campaign management across search and social, content and measurement."],
    ["Quality assurance", "Manual and automated testing, regression suites, release audits."],
    ["Mobile development", "iOS and Android applications: design, build, store submission and version support."],
    ["Bot solutions", "Telegram and WhatsApp bots: order intake, notifications and integration with existing systems."],
    ["AI solutions", "Model deployment for document processing, customer enquiry handling and internal search."],
    ["AI-assisted video production", "Product, training and social-channel video: script, voice and edit produced with AI tooling."],
    ["Consulting", "Audits of existing systems, technology selection and digitalisation planning — hourly or per project."],
    ["Short-term rental management", "Remote handling of reservations, guest communication, pricing and cleaning schedules."],
  ],
  projects: {
    eyebrow: "Section 02 · Projects",
    title: "Projects in production",
    items: [
      ["Corporate site and content panel", "From a landing page to a full site; the client's team manages the content themselves.", "2026"],
      ["bbq.az", "Corporate site of a marketing agency operating nationwide.", "2026"],
    ],
  },
  caseStudy: {
    eyebrow: "Section 03 · Case study",
    title: "Corporate site and content management panel",
    labels: ["Client", "Duration", "Work", "Year"],
    facts: ["A company based in Baku", "3 months", "Corporate site and content management panel", "2026"],
    blocks: [
      ["Situation", "The client had a single-page landing page. The content was static — every change meant going back to an external contractor. Publishing news, announcements or extended product information was practically impossible."],
      ["Approach", "We started with a meeting: who edits what, how often, and where the existing workflow broke down. Then design, followed by the full site and the admin panel. The panel was handed over with role-based access, a page and news editor, and a media library."],
      ["Result", "Content changes are no longer an external dependency — the client's team edits the site themselves. The news section is live; the company now publishes the detailed information it previously had no place for on the site."],
    ],
  },
  sectionIndex: [["#xidmetler", "Services"], ["#layiheler", "Projects"], ["#layihe-icmali", "Case study"], ["#texnologiya", "Standards"], ["#karyera", "Careers"], ["#elaqe", "Contact"]],
  quoteEyebrow: "Position",
  quote: "Our work is not measured by the presentation — it is measured by how many times the system stopped after month six.",
  quoteName: "nobug",
  quoteTitle: "Position · Baku, 2026",
  aboutP1: "nobug was founded in Baku in 2026. The team covers engineering, QA and support. Our first projects are the beic.az and bbq.az sites.",
  aboutP2: "We do not split projects across several contractors. Analysis, implementation and post-handover support sit with the same team; each stage's deliverable and deadline is named in the contract.",
  techTitle: "Standards and certifications",
  techNote: "Certification has not yet started. The table lists the practices and tooling we work with.",
  techHead: ["Area", "Approach", "Tooling", "Status"],
  techRows: [
    ["Data protection", "Encrypted backups, restore testing", "Azure Backup", "In use"],
    ["Access control", "Role-based access, two-factor authentication", "Microsoft Entra ID", "In use"],
    ["Code and releases", "Code review, automated tests, version history", "GitHub Actions", "In use"],
    ["Monitoring", "System and API monitoring, incident alerts", "Zabbix, Grafana", "In use"],
    ["ISO/IEC 27001", "Certification", "—", "Planned"],
  ],
  techFootnote: "Certificate numbers and validity dates will be added to this table as they are issued.",
  careersTitle: "Joining the team",
  careersText: "There are no open positions at the moment. Applications for engineering, QA and support are accepted year-round and considered at the next opening.",
  careersLink: "Send an application",
  contactEyebrow: "Contact",
  contactTitle: "Initial project assessment",
  contactText: "The first meeting and initial assessment are free of charge. We usually reply within one business day.",
  contactEmailLabel: "Email",
  contactRows: [["Address", "Baku, Azerbaijan"], ["Hours", "Mon — Fri, 09:00 — 18:00"]],
  contactReplyNote: "We reply to written enquiries within one business day.",
  formLabel: "Short enquiry",
  fieldName: "Full name",
  fieldEmail: "Email",
  fieldMessage: "Subject",
  formSubmit: "Send",
  formSending: "Sending…",
  formSent: "Your enquiry has been logged. We reply within one business day.",
  formError: "Sending failed. Please try again in a moment or email us directly.",
  footerCols: [
    ["Solutions", ["IT infrastructure", "CRM and ERP", "Mobile development", "AI solutions", "AI video", "Consulting"]],
    ["Company", ["About", "Careers", "Contact"]],
    ["Legal", ["Privacy policy", "Terms of use", "Data processing"]],
  ],
  footerContact: "Contact",
  legal: ['"nobug" LLC', "Baku, Azerbaijan", "© 2026"],
  menu: "Menu",
  home: "Home",
};

const ru: Dictionary = {
  meta: {
    title: "nobug — IT-компания, Баку",
    description: "Реализация под ключ в разработке, инфраструктуре и аналитике. Планирование, внедрение и поддержку после сдачи ведёт одна команда.",
  },
  nav: [["#xidmetler", "Услуги"], ["#texnologiya", "Технологии"], ["#haqqinda", "О компании"], ["#karyera", "Карьера"], ["#elaqe", "Контакты"]],
  cta: "Обсудить проект",
  eyebrow: "nobug · Баку · с 2026 года",
  h1: "Сданная нами система работает.",
  heroText: "Реализация под ключ в разработке, инфраструктуре и аналитике. Планирование, внедрение и поддержку после сдачи ведёт одна команда.",
  heroLink: "Обсудить проект",
  figLabel: "Рис.",
  captions: {
    hero: "Сетевой коммутатор и кабельная стойка",
    band: "Серверная, Баку",
    services: "Серверный шкаф, структурированная кабельная система",
    about: "Баку, приморский бульвар",
    tech: "Стеклянный фасад офисного здания",
    careers: "Рабочий момент: рабочее место с тремя мониторами",
  },
  alt01: "Крупный план сетевого коммутатора: оранжевые и синие кабели, подключённые к портам",
  alt02: "Одноточечная перспектива дата-зала: серверные стойки по обеим сторонам, световая полоса на потолке",
  alt03: "Открытый серверный шкаф с плотно уложенными сетевыми кабелями",
  alt04: "Приморский бульвар Баку и современный силуэт города днём",
  alt05: "Человек работает за тремя мониторами в тёмной комнате, на экранах код",
  alt07: "Стеклянный фасад современного офисного здания, диагональный ракурс",
  figures: [
    ["12", "направлений услуг", "2026 · каталог услуг"],
    ["2", "проекта в работе", "2026 · beic.az, bbq.az"],
    ["< 2 часов", "обязательство по первому ответу в договоре поддержки", "2026 · условия SLA"],
  ],
  servicesTitle: "Указатель услуг",
  servicesMeta: "Раздел 01 · 12 услуг",
  servicesSecondary: "Дополнительные услуги",
  services: [
    ["IT-инфраструктура", "Развёртывание, миграция и месячная поддержка серверов, сетей и рабочих станций."],
    ["Внедрение CRM и ERP", "Bitrix24, Odoo и индивидуальные системы; объединение продаж, склада и финансов."],
    ["Аналитика данных", "Объединение и очистка источников данных и слой отчётности над ними."],
    ["Веб и e-commerce", "Корпоративные сайты, e-commerce и интеграция с существующими системами."],
    ["Цифровой маркетинг", "Ведение кампаний в поиске и социальных каналах, контент и измерение."],
    ["Контроль качества", "Ручное и автоматизированное тестирование, регрессия, аудит перед релизом."],
    ["Мобильная разработка", "Приложения для iOS и Android: проектирование, разработка, публикация в сторах и поддержка версий."],
    ["Боты", "Боты в Telegram и WhatsApp: приём заказов, уведомления и интеграция с существующими системами."],
    ["Решения на основе ИИ", "Внедрение моделей для обработки документов, ответов на обращения клиентов и внутреннего поиска."],
    ["Производство видео с ИИ", "Продуктовые, обучающие и социальные видео: сценарий, озвучка и монтаж с использованием ИИ-инструментов."],
    ["Консультации", "Аудит существующих систем, выбор технологий и план цифровизации — почасово или в рамках проекта."],
    ["Управление посуточной арендой", "Удалённое ведение бронирований, общения с гостем, цен и графика уборки."],
  ],
  projects: {
    eyebrow: "Раздел 02 · Проекты",
    title: "Проекты в эксплуатации",
    items: [
      ["Корпоративный сайт и панель контента", "От лендинга до полноценного сайта; команда клиента управляет контентом сама.", "2026"],
      ["bbq.az", "Корпоративный сайт маркетингового агентства, работающего по всей стране.", "2026"],
    ],
  },
  caseStudy: {
    eyebrow: "Раздел 03 · Обзор проекта",
    title: "Корпоративный сайт и панель управления контентом",
    labels: ["Клиент", "Срок", "Работа", "Год"],
    facts: ["Компания, работающая в Баку", "3 месяца", "Корпоративный сайт и панель управления контентом", "2026"],
    blocks: [
      ["Ситуация", "У клиента был только одностраничный лендинг. Контент был статичным — для каждого изменения приходилось обращаться к внешнему исполнителю. Разместить новость, объявление или расширенную информацию о продукте было практически невозможно."],
      ["Подход", "Начали со встречи: определили, кто и что редактирует, с какой периодичностью и где останавливается текущий рабочий процесс. Затем дизайн, потом полный сайт и админ-панель. Панель сдана с ролевым доступом, редактором страниц и новостей и медиатекой."],
      ["Результат", "Изменение контента больше не внешняя зависимость — команда клиента редактирует сайт сама. Раздел новостей запущен; компания теперь сама публикует подробную информацию, для которой раньше не было места на сайте."],
    ],
  },
  sectionIndex: [["#xidmetler", "Услуги"], ["#layiheler", "Проекты"], ["#layihe-icmali", "Обзор проекта"], ["#texnologiya", "Стандарты"], ["#karyera", "Карьера"], ["#elaqe", "Контакты"]],
  quoteEyebrow: "Позиция",
  quote: "Нашу работу измеряет не презентация, а то, сколько раз система остановилась после шестого месяца.",
  quoteName: "nobug",
  quoteTitle: "Позиция · Баку, 2026",
  aboutP1: "nobug основан в Баку в 2026 году. Команда закрывает разработку, QA и поддержку. Наши первые проекты — сайты beic.az и bbq.az.",
  aboutP2: "Мы не делим проекты между несколькими подрядчиками. Аналитика, внедрение и поддержка после сдачи — ответственность одной команды; результат и срок каждого этапа зафиксированы в договоре.",
  techTitle: "Стандарты и сертификаты",
  techNote: "Сертификация ещё не начата. В таблице перечислены практики и инструменты, с которыми мы работаем.",
  techHead: ["Область", "Подход", "Инструменты", "Статус"],
  techRows: [
    ["Защита данных", "Шифрованные резервные копии, тест восстановления", "Azure Backup", "Используется"],
    ["Управление доступом", "Ролевой доступ, двухфакторная аутентификация", "Microsoft Entra ID", "Используется"],
    ["Код и релизы", "Код-ревью, автотесты, история версий", "GitHub Actions", "Используется"],
    ["Мониторинг", "Наблюдение за системами и API, оповещения", "Zabbix, Grafana", "Используется"],
    ["ISO/IEC 27001", "Сертификация", "—", "Планируется"],
  ],
  techFootnote: "Номера сертификатов и сроки действия будут добавлены в таблицу по мере их получения.",
  careersTitle: "Работа в команде",
  careersText: "Открытых вакансий сейчас нет. Заявки по направлениям разработки, QA и поддержки принимаются круглый год и рассматриваются при следующем наборе.",
  careersLink: "Отправить заявку",
  contactEyebrow: "Контакты",
  contactTitle: "Предварительная оценка проекта",
  contactText: "Первая встреча и предварительная оценка бесплатны. Обычно отвечаем в течение одного рабочего дня.",
  contactEmailLabel: "E-mail",
  contactRows: [["Адрес", "Баку, Азербайджан"], ["Часы работы", "Пн — Пт, 09:00 — 18:00"]],
  contactReplyNote: "На письменные обращения отвечаем в течение одного рабочего дня.",
  formLabel: "Короткий запрос",
  fieldName: "Имя и фамилия",
  fieldEmail: "E-mail",
  fieldMessage: "Тема",
  formSubmit: "Отправить",
  formSending: "Отправка…",
  formSent: "Запрос зафиксирован. Отвечаем в течение одного рабочего дня.",
  formError: "Не удалось отправить. Попробуйте ещё раз чуть позже или напишите нам напрямую.",
  footerCols: [
    ["Услуги", ["IT-инфраструктура", "CRM и ERP", "Мобильная разработка", "Решения на основе ИИ", "Видео с ИИ", "Консультации"]],
    ["Компания", ["О компании", "Карьера", "Контакты"]],
    ["Юридическое", ["Политика конфиденциальности", "Условия использования", "Обработка данных"]],
  ],
  footerContact: "Контакты",
  legal: ['ООО "nobug"', "Баку, Азербайджан", "© 2026"],
  menu: "Меню",
  home: "Главная",
};

export const DICT: Record<Locale, Dictionary> = { az, en, ru };
export const getDict = (locale: Locale) => DICT[locale];

// Footer "Şirkət" column → anchors
export const FOOTER_COMPANY_ANCHORS = ["#haqqinda", "#karyera", "#elaqe"];
