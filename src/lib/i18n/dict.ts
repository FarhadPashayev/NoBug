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
  cap01: string;
  cap02: string;
  cap03: string;
  cap04: string;
  cap05: string;
  cap07: string;
  alt01: string;
  alt02: string;
  alt03: string;
  alt04: string;
  alt05: string;
  alt07: string;
  figures: [string, string, string][]; // value, label, source
  servicesTitle: string;
  servicesMeta: string;
  services: [string, string][]; // title, one-line description — index = ?xidmet
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
  clientsLabel: string;
  clients: string[];
  careersTitle: string;
  careersText: string;
  careersCount: string;
  careersCountLabel: string;
  careersLink: string;
  contactEyebrow: string;
  contactTitle: string;
  contactText: string;
  contactRows: [string, string][];
  formLabel: string;
  fieldName: string;
  fieldEmail: string;
  fieldMessage: string;
  formSubmit: string;
  formSending: string;
  formSent: string;
  formError: string;
  footerCols: [string, string[]][];
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
  cap01: "Şək. 01 — Kommutator rafı, əməliyyat mərkəzi",
  cap02: "Şək. 02 — Server otağı, Bakı",
  cap03: "Şək. 03 — Struktur kabel sistemi",
  cap04: "Şək. 04 — Bakı. nobug burada fəaliyyət göstərir",
  cap05: "Şək. 05 — Fasad gridi, ofis binası",
  cap07: "Şək. 07 — Monitorinq göstəriciləri, aylıq kəsik",
  alt01: "Tünd port matrisi: sıra-sıra şəbəkə portları, üçü aksent rəngdə işıqlı",
  alt02: "Data zalının tək nöqtəli perspektivi: iki tərəfdə server rafları, tavanda işıq zolağı",
  alt03: "Şəbəkə topologiyası: nöqtələr və nazik xətlər, sahəni kəsən bir aksent marşrut",
  alt04: "Kontur sahəsi: sıx izoxətlər, aralarında bir neçə aksent xətt",
  alt05: "Fasad gridi: kvadrat pəncərə modulları, biri aksent rəngdə",
  alt07: "Sütunlu data sahəsi: aylıq dəyərlər, bir sütun aksent rəngdə",
  figures: [
    ["12", "xidmət istiqaməti", "2026 · xidmət kataloqu"],
    ["3", "istifadədə olan layihə", "2026 · beic.az, bbq.az, yins.az"],
    ["< 2 saat", "dəstək müqaviləsində birinci cavab öhdəliyi", "2026 · SLA şərtləri"],
  ],
  servicesTitle: "Xidmət indeksi",
  servicesMeta: "Bölmə 01 · 01—12",
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
  quoteEyebrow: "Mövqe",
  quote: "Bizim işimizin ölçüsü təqdimat deyil — altıncı aydan sonra sistemin neçə dəfə dayandığıdır.",
  quoteName: "nobug",
  quoteTitle: "Mövqe · Bakı, 2026",
  aboutP1: "nobug 2026-cı ildə Bakıda quruldu. Komanda mühəndislik, QA və dəstək istiqamətlərini əhatə edir. İlk layihələrimiz beic.az, bbq.az və yins.az saytlarıdır.",
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
  clientsLabel: "Müştərilər",
  clients: ["beic.az", "bbq.az", "yins.az"],
  careersTitle: "Komandaya qoşulmaq",
  careersText: "Hazırda açıq vakansiya yoxdur. Mühəndis, QA və dəstək istiqamətləri üzrə müraciətlər il boyu qəbul olunur və növbəti açılışda nəzərə alınır.",
  careersCount: "—",
  careersCountLabel: "açıq vakansiya, 2026",
  careersLink: "Müraciət göndər",
  contactEyebrow: "Əlaqə",
  contactTitle: "Layihənin ilkin qiymətləndirməsi",
  contactText: "İlk görüş və ilkin qiymətləndirmə ödənişsizdir. Adətən bir iş günü ərzində cavab veririk.",
  contactRows: [["E-poçt", "no.bug.mmc@gmail.com"], ["Ünvan", "Bakı, Azərbaycan"], ["İş saatları", "B.e — Cümə, 09:00 — 18:00"]],
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
    ["Əlaqə", ["no.bug.mmc@gmail.com", "LinkedIn"]],
  ],
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
  cap01: "Fig. 01 — Switch rack, operations floor",
  cap02: "Fig. 02 — Server room, Baku",
  cap03: "Fig. 03 — Structured cabling system",
  cap04: "Fig. 04 — Baku. nobug operates from here",
  cap05: "Fig. 05 — Facade grid, office building",
  cap07: "Fig. 07 — Monitoring readings, monthly cut",
  alt01: "Dark port matrix: rows of network ports, three lit in the accent colour",
  alt02: "One-point perspective of a data hall: server racks on both sides, a light strip on the ceiling",
  alt03: "Network topology: nodes and hairline edges, one accent route crossing the field",
  alt04: "Contour field: dense isolines with a few accent-coloured contours",
  alt05: "Facade grid: square window modules, one in the accent colour",
  alt07: "Bar data field: monthly values, one bar in the accent colour",
  figures: [
    ["12", "service areas", "2026 · service catalogue"],
    ["3", "projects in production", "2026 · beic.az, bbq.az, yins.az"],
    ["< 2 hours", "first-response commitment in the support agreement", "2026 · SLA terms"],
  ],
  servicesTitle: "Service index",
  servicesMeta: "Section 01 · 01—12",
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
  quoteEyebrow: "Position",
  quote: "Our work is not measured by the presentation — it is measured by how many times the system stopped after month six.",
  quoteName: "nobug",
  quoteTitle: "Position · Baku, 2026",
  aboutP1: "nobug was founded in Baku in 2026. The team covers engineering, QA and support. Our first projects are the beic.az, bbq.az and yins.az sites.",
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
  clientsLabel: "Clients",
  clients: ["beic.az", "bbq.az", "yins.az"],
  careersTitle: "Joining the team",
  careersText: "There are no open positions at the moment. Applications for engineering, QA and support are accepted year-round and considered at the next opening.",
  careersCount: "—",
  careersCountLabel: "open positions, 2026",
  careersLink: "Send an application",
  contactEyebrow: "Contact",
  contactTitle: "Initial project assessment",
  contactText: "The first meeting and initial assessment are free of charge. We usually reply within one business day.",
  contactRows: [["Email", "no.bug.mmc@gmail.com"], ["Address", "Baku, Azerbaijan"], ["Hours", "Mon — Fri, 09:00 — 18:00"]],
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
    ["Contact", ["no.bug.mmc@gmail.com", "LinkedIn"]],
  ],
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
  cap01: "Рис. 01 — Стойка коммутаторов, операционный зал",
  cap02: "Рис. 02 — Серверная, Баку",
  cap03: "Рис. 03 — Структурированная кабельная система",
  cap04: "Рис. 04 — Баку. nobug работает отсюда",
  cap05: "Рис. 05 — Фасадная сетка, офисное здание",
  cap07: "Рис. 07 — Показатели мониторинга, месячный срез",
  alt01: "Тёмная матрица портов: ряды сетевых портов, три подсвечены акцентным цветом",
  alt02: "Одноточечная перспектива дата-зала: серверные стойки по обеим сторонам, световая полоса на потолке",
  alt03: "Сетевая топология: узлы и тонкие связи, один акцентный маршрут через поле",
  alt04: "Контурное поле: плотные изолинии и несколько акцентных контуров",
  alt05: "Фасадная сетка: квадратные оконные модули, один акцентного цвета",
  alt07: "Столбчатое поле данных: месячные значения, один столбец акцентного цвета",
  figures: [
    ["12", "направлений услуг", "2026 · каталог услуг"],
    ["3", "проекта в работе", "2026 · beic.az, bbq.az, yins.az"],
    ["< 2 часов", "обязательство по первому ответу в договоре поддержки", "2026 · условия SLA"],
  ],
  servicesTitle: "Указатель услуг",
  servicesMeta: "Раздел 01 · 01—12",
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
  quoteEyebrow: "Позиция",
  quote: "Нашу работу измеряет не презентация, а то, сколько раз система остановилась после шестого месяца.",
  quoteName: "nobug",
  quoteTitle: "Позиция · Баку, 2026",
  aboutP1: "nobug основан в Баку в 2026 году. Команда закрывает разработку, QA и поддержку. Наши первые проекты — сайты beic.az, bbq.az и yins.az.",
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
  clientsLabel: "Клиенты",
  clients: ["beic.az", "bbq.az", "yins.az"],
  careersTitle: "Работа в команде",
  careersText: "Открытых вакансий сейчас нет. Заявки на позиции разработки, QA и поддержки принимаются круглый год и рассматриваются при следующем наборе.",
  careersCount: "—",
  careersCountLabel: "открытые позиции, 2026",
  careersLink: "Отправить заявку",
  contactEyebrow: "Контакты",
  contactTitle: "Предварительная оценка проекта",
  contactText: "Первая встреча и предварительная оценка бесплатны. Обычно отвечаем в течение одного рабочего дня.",
  contactRows: [["E-mail", "no.bug.mmc@gmail.com"], ["Адрес", "Баку, Азербайджан"], ["Часы работы", "Пн — Пт, 09:00 — 18:00"]],
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
    ["Контакты", ["no.bug.mmc@gmail.com", "LinkedIn"]],
  ],
  legal: ['ООО "nobug"', "Баку, Азербайджан", "© 2026"],
  menu: "Меню",
  home: "Главная",
};

export const DICT: Record<Locale, Dictionary> = { az, en, ru };
export const getDict = (locale: Locale) => DICT[locale];

// Footer "Xidmətlər" column → service index (for the ?xidmet= deep link)
export const FOOTER_SERVICE_INDEX = [0, 1, 6, 8, 9, 10];
// Footer "Şirkət" column → anchors
export const FOOTER_COMPANY_ANCHORS = ["#haqqinda", "#karyera", "#elaqe"];
