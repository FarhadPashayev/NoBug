import type { Locale } from "./config";

// Copy for the WebGL showcase redesign (home hero, case-study pages, About
// drawer, extended contact form). The long-form company copy (about, FAQ,
// services) still lives in dict.ts / the database; this file only holds the
// new interface strings. Facts only — no invented clients, team or figures.

export type ShowcaseCopy = {
  about: string;
  contact: string;
  close: string;
  headline: string;
  subline: string;
  cta: string;
  scrollHint: string;
  carouselLabel: string; // aria-roledescription region label
  carouselHelp: string; // screen-reader instructions
  dragHint: string; // one-time hint under the carousel
  standardsLead: string;
  work: { kind: string; nextLabel: string; ctaTitle: string; ctaText: string; cta: string };
  open: string;
  prev: string;
  next: string;
  loading: string;
  sections: { services: string; process: string; numbers: string; clients: string; projects: string; testimonials: string; faq: string; standards: string; contact: string };
  servicesLead: string;
  processLead: string;
  process: [string, string][]; // step, text
  qaNote: string;
  projectsEmpty: string;
  case: { viewLive: string; screens: string; category: string; client: string; year: string; duration: string; stack: string; service: string; projects: string; projectsAll: string; ctaTitle: string; ctaText: string; asked: string; progress: string; backHome: string };
  drawer: { title: string; who: string; founded: string; mission: string; services: string; numbers: string; team: string; how: string };
  form: {
    name: string;
    company: string;
    phone: string;
    email: string;
    service: string;
    servicePlaceholder: string;
    serviceOther: string;
    budget: string;
    budgetPlaceholder: string;
    budgets: string[];
    message: string;
    optional: string;
    phoneInvalid: string;
    consent: string;
  };
  channels: { whatsapp: string; phone: string; email: string; instagram: string; linkedin: string };
  footerRights: string;
};

const az: ShowcaseCopy = {
  about: "Haqqımızda",
  contact: "Əlaqə",
  close: "Bağla",
  headline: "Biznesiniz üçün sayt, mobil tətbiq və sistemlər — test edilmiş, bugsuz.",
  subline: "Hər layihə təhvildən əvvəl peşəkar testdən keçir.",
  cta: "Layihəni müzakirə et",
  scrollHint: "Aşağı sürüşdür",
  carouselLabel: "Xidmətlər karuseli",
  carouselHelp: "Xidmətlər arasında keçid üçün sol və sağ oxlardan, açmaq üçün Enter düyməsindən istifadə edin.",
  dragHint: "Sürüşdürün və ya karta toxunun",
  standardsLead: "Məlumatın qorunması, giriş idarəsi, buraxılış və monitorinq — hər layihədə eyni qaydalar.",
  work: { kind: "Layihə", nextLabel: "Növbəti layihə", ctaTitle: "Bənzər layihə istəyirsiniz?", ctaText: "Üç qısa sual — bir iş günü ərzində qiymətləndirmə ilə qayıdırıq.", cta: "Layihəni müzakirə et" },
  open: "Aç",
  prev: "Əvvəlki",
  next: "Növbəti",
  loading: "Yüklənir",
  sections: { services: "Xidmətlər", process: "Necə işləyirik", numbers: "Rəqəmlər", clients: "Müştərilər", projects: "Seçilmiş layihələr", testimonials: "Rəylər", faq: "Suallar", standards: "Standartlar", contact: "Əlaqə" },
  servicesLead: "Hər xidməti ayrıca da, hamısını birlikdə də götürmək olar.",
  processLead: "Analizdən dəstəyə qədər beş mərhələ — hamısı bir komandada.",
  process: [
    ["Analiz", "Biznes prosesinizi, istifadəçiləri və hədəfləri öyrənirik; tapşırıq sənədi və müddət razılaşdırılır."],
    ["Dizayn", "İnterfeys prototipi və vizual dizayn — kod yazılmazdan əvvəl təsdiqlənir."],
    ["Hazırlanma", "Mərhələli inkişaf, hər həftə işləyən versiya və şəffaf hesabat."],
    ["Test (QA)", "Manual və avtomatlaşdırılmış test, reqressiya, performans və təhlükəsizlik yoxlaması."],
    ["Təhvil və dəstək", "Yerləşdirmə, sənədləşmə, komandanıza təlim və təhvildən sonrakı dəstək."],
  ],
  qaNote: "Hər layihə təhvildən əvvəl peşəkar testdən keçir — adımız buradan gəlir.",
  projectsEmpty: "Layihələr tezliklə əlavə olunacaq.",
  case: { viewLive: "Sayta bax", screens: "Ekranlar", category: "Kateqoriya", client: "Müştəri", year: "İl", duration: "Müddət", stack: "Texnologiyalar", service: "Xidmət", projects: "Bu istiqamətdə layihələr", projectsAll: "Seçilmiş layihələr", ctaTitle: "Bu xidmət sizə lazımdır?", ctaText: "Üç qısa sual — bir iş günü ərzində cavab veririk.", asked: "Sorğuda nə soruşuruq", progress: "Səhifə irəliləyişi", backHome: "Ana səhifəyə qayıt" },
  drawer: { title: "nobug haqqında", who: "Kimik", founded: "Quruluş ili", mission: "Missiya", services: "Xidmətlər", numbers: "Rəqəmlər", team: "Komanda", how: "Necə işləyirik" },
  form: {
    name: "Ad, soyad",
    company: "Şirkət",
    phone: "Telefon",
    email: "E-poçt",
    service: "Xidmət",
    servicePlaceholder: "Xidməti seçin",
    serviceOther: "Digər / hələ bilmirəm",
    budget: "Büdcə",
    budgetPlaceholder: "Büdcəni seçin",
    budgets: ["2 000 ₼-dək", "2 000 – 5 000 ₼", "5 000 – 15 000 ₼", "15 000 ₼-dan çox", "Hələ bilmirəm"],
    message: "Layihə haqqında qısaca",
    optional: "istəyə bağlı",
    phoneInvalid: "Telefon nömrəsini yoxlayın",
    consent: "Göndərməklə şəxsi məlumatların emalı ilə razılaşırsınız.",
  },
  channels: { whatsapp: "WhatsApp", phone: "Telefon", email: "E-poçt", instagram: "Instagram", linkedin: "LinkedIn" },
  footerRights: "Bütün hüquqlar qorunur.",
};

const en: ShowcaseCopy = {
  about: "About",
  contact: "Contact",
  close: "Close",
  headline: "Websites, mobile apps and business systems — tested, bug-free.",
  subline: "Every project goes through professional testing before delivery.",
  cta: "Discuss your project",
  scrollHint: "Scroll down",
  carouselLabel: "Services carousel",
  carouselHelp: "Use the left and right arrow keys to move between services and Enter to open one.",
  dragHint: "Swipe or tap a card",
  standardsLead: "Data protection, access control, releases and monitoring — the same rules on every project.",
  work: { kind: "Project", nextLabel: "Next project", ctaTitle: "Want something similar?", ctaText: "Three short questions — we come back with an estimate within one business day.", cta: "Discuss your project" },
  open: "Open",
  prev: "Previous",
  next: "Next",
  loading: "Loading",
  sections: { services: "Services", process: "How we work", numbers: "Numbers", clients: "Clients", projects: "Selected projects", testimonials: "Reviews", faq: "Questions", standards: "Standards", contact: "Contact" },
  servicesLead: "Take any service on its own or all of them together.",
  processLead: "Five stages from analysis to support — all within one team.",
  process: [
    ["Analysis", "We study your process, users and goals; the scope document and timeline are agreed."],
    ["Design", "Interface prototype and visual design — approved before any code is written."],
    ["Development", "Iterative build with a working version and a clear report every week."],
    ["Testing (QA)", "Manual and automated testing, regression, performance and security checks."],
    ["Delivery & support", "Deployment, documentation, training for your team and post-launch support."],
  ],
  qaNote: "Every project goes through professional testing before delivery — that's where our name comes from.",
  projectsEmpty: "Projects will be added soon.",
  case: { viewLive: "View live", screens: "Screens", category: "Category", client: "Client", year: "Year", duration: "Duration", stack: "Tech stack", service: "Service", projects: "Projects in this field", projectsAll: "Selected projects", ctaTitle: "Need this service?", ctaText: "Three short questions — we reply within one business day.", asked: "What the enquiry asks", progress: "Page progress", backHome: "Back to home" },
  drawer: { title: "About nobug", who: "Who we are", founded: "Founded", mission: "Mission", services: "Services", numbers: "Numbers", team: "Team", how: "How we work" },
  form: {
    name: "Full name",
    company: "Company",
    phone: "Phone",
    email: "Email",
    service: "Service",
    servicePlaceholder: "Choose a service",
    serviceOther: "Other / not sure yet",
    budget: "Budget",
    budgetPlaceholder: "Choose a budget",
    budgets: ["Up to 2,000 ₼", "2,000 – 5,000 ₼", "5,000 – 15,000 ₼", "Over 15,000 ₼", "Not sure yet"],
    message: "About the project, briefly",
    optional: "optional",
    phoneInvalid: "Please check the phone number",
    consent: "By sending you agree to the processing of your personal data.",
  },
  channels: { whatsapp: "WhatsApp", phone: "Phone", email: "Email", instagram: "Instagram", linkedin: "LinkedIn" },
  footerRights: "All rights reserved.",
};

const ru: ShowcaseCopy = {
  about: "О нас",
  contact: "Контакты",
  close: "Закрыть",
  headline: "Сайты, мобильные приложения и системы для бизнеса — протестированные, без багов.",
  subline: "Каждый проект проходит профессиональное тестирование перед сдачей.",
  cta: "Обсудить проект",
  scrollHint: "Прокрутите вниз",
  carouselLabel: "Карусель услуг",
  carouselHelp: "Используйте стрелки влево и вправо для перехода между услугами и Enter, чтобы открыть.",
  dragHint: "Листайте или нажмите на карточку",
  standardsLead: "Защита данных, управление доступом, релизы и мониторинг — одни правила в каждом проекте.",
  work: { kind: "Проект", nextLabel: "Следующий проект", ctaTitle: "Нужно что-то похожее?", ctaText: "Три коротких вопроса — вернёмся с оценкой в течение рабочего дня.", cta: "Обсудить проект" },
  open: "Открыть",
  prev: "Назад",
  next: "Далее",
  loading: "Загрузка",
  sections: { services: "Услуги", process: "Как мы работаем", numbers: "Цифры", clients: "Клиенты", projects: "Избранные проекты", testimonials: "Отзывы", faq: "Вопросы", standards: "Стандарты", contact: "Контакты" },
  servicesLead: "Любую услугу можно заказать отдельно или все вместе.",
  processLead: "Пять этапов от анализа до поддержки — в одной команде.",
  process: [
    ["Анализ", "Изучаем ваш процесс, пользователей и цели; согласуем техническое задание и сроки."],
    ["Дизайн", "Прототип интерфейса и визуальный дизайн — утверждаются до начала разработки."],
    ["Разработка", "Поэтапная разработка: каждую неделю рабочая версия и прозрачный отчёт."],
    ["Тестирование (QA)", "Ручное и автоматизированное тестирование, регрессия, проверка производительности и безопасности."],
    ["Сдача и поддержка", "Развёртывание, документация, обучение вашей команды и поддержка после запуска."],
  ],
  qaNote: "Каждый проект проходит профессиональное тестирование перед сдачей — отсюда и наше название.",
  projectsEmpty: "Проекты скоро появятся.",
  case: { viewLive: "Открыть сайт", screens: "Экраны", category: "Категория", client: "Клиент", year: "Год", duration: "Срок", stack: "Технологии", service: "Услуга", projects: "Проекты в этом направлении", projectsAll: "Избранные проекты", ctaTitle: "Нужна эта услуга?", ctaText: "Три коротких вопроса — отвечаем в течение рабочего дня.", asked: "Что мы спрашиваем в заявке", progress: "Прогресс страницы", backHome: "На главную" },
  drawer: { title: "О nobug", who: "Кто мы", founded: "Год основания", mission: "Миссия", services: "Услуги", numbers: "Цифры", team: "Команда", how: "Как мы работаем" },
  form: {
    name: "Имя, фамилия",
    company: "Компания",
    phone: "Телефон",
    email: "E-mail",
    service: "Услуга",
    servicePlaceholder: "Выберите услугу",
    serviceOther: "Другое / пока не знаю",
    budget: "Бюджет",
    budgetPlaceholder: "Выберите бюджет",
    budgets: ["До 2 000 ₼", "2 000 – 5 000 ₼", "5 000 – 15 000 ₼", "Более 15 000 ₼", "Пока не знаю"],
    message: "Коротко о проекте",
    optional: "необязательно",
    phoneInvalid: "Проверьте номер телефона",
    consent: "Отправляя форму, вы соглашаетесь на обработку персональных данных.",
  },
  channels: { whatsapp: "WhatsApp", phone: "Телефон", email: "E-mail", instagram: "Instagram", linkedin: "LinkedIn" },
  footerRights: "Все права защищены.",
};

const COPY: Record<Locale, ShowcaseCopy> = { az, en, ru };
export const getShowcaseCopy = (locale: Locale) => COPY[locale];
