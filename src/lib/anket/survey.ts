import type { Locale } from "@/lib/i18n/config";

// Sorğu — lifted verbatim from SERVICES + SURVEY in `nobug Sorgu.dc.html`.
// Service index (0…11) is shared with the landing page and the ?xidmet= link.
// Question shape: [label, options, multiFlag?] — multiFlag === 1 → multi-select.

export type QuestionRow = [string, string[], 1?];

export type SurveyLocale = {
  home: string;
  eyebrow: string;
  title: string;
  note: string;
  pick: string;
  pickNote: string;
  change: string;
  back: string;
  next: string;
  send: string;
  sending: string;
  error: string;
  multi: string;
  step: string;
  contactTitle: string;
  name: string;
  namePh: string;
  channel: string;
  channels: [string, string][]; // label, placeholder — index: 0 email · 1 phone · 2 whatsapp
  phone: string; // optional phone field (shown when the chosen channel is email)
  message: string; // optional free-text field
  optional: string; // "(istəyə bağlı)"
  consent: string; // consent sentence; the privacy-policy title is rendered as a link after it
  consentLink: string;
  errors: { name: string; contact: string; email: string; consent: string };
  sentTitle: string;
  sentText: string;
  sentNext: string; // what happens next
  errorDirect: string; // "… or write to us directly:" (email follows)
  again: string;
  summary: string;
  services: string[];
  q: QuestionRow[][];
  // email copy
  mailTag: string;
  mailService: string;
  mailName: string;
  mailContact: string;
  mailDate: string;
  confirmSubject: string;
  confirmBody: (name: string, service: string) => string;
};

export { resolveService } from "@/lib/services";
export const CHANNEL_IDS = ["email", "phone", "whatsapp"] as const;
export type ChannelId = (typeof CHANNEL_IDS)[number];

const az: SurveyLocale = {
  home: "Ana səhifə",
  eyebrow: "Sorğu",
  title: "Üç sual, bir dəqiqə",
  note: "Xidməti seçin. Cavablar e-poçtla bizə gəlir; bir iş günü ərzində qiymətləndirmə ilə qayıdırıq.",
  pick: "Hansı istiqamətdə kömək lazımdır?",
  pickNote: "Bir neçə istiqamət lazımdırsa, ən vacibini seçin — qalanını danışarıq.",
  change: "Dəyiş",
  back: "Geri",
  next: "Davam et",
  send: "Göndər",
  sending: "Göndərilir…",
  error: "Göndərmək alınmadı. Bir az sonra yenidən cəhd edin.",
  multi: "birdən çox seçmək olar",
  step: "Addım",
  contactTitle: "Sizinlə necə əlaqə saxlayaq?",
  name: "Adınız",
  namePh: "Ad, soyad",
  channel: "Əlaqə kanalı",
  channels: [["E-poçt", "ad@sirket.az"], ["Telefon", "+994 XX XXX XX XX"], ["WhatsApp", "WhatsApp nömrəsi"]],
  phone: "Telefon",
  message: "Mesaj",
  optional: "istəyə bağlı",
  consent: "Məlumatlarımın müraciətə cavab vermək üçün emalına razıyam.",
  consentLink: "Məxfilik siyasəti",
  errors: { name: "Adınızı yazın.", contact: "Əlaqə məlumatını yazın.", email: "E-poçt ünvanı düzgün deyil.", consent: "Davam etmək üçün razılıq lazımdır." },
  sentTitle: "Sorğu qeydə alındı.",
  sentText: "Cavablarınız seçilmiş xidmətlə birlikdə bizə çatdı.",
  sentNext: "Növbəti addım: bir iş günü ərzində seçdiyiniz kanalla sizinlə əlaqə saxlayır, qısa görüş təyin edir və ilkin qiymətləndirmə veririk.",
  errorDirect: "Göndərmək alınmadı. Yenidən cəhd edin və ya birbaşa yazın:",
  again: "Yeni sorğu",
  summary: "Seçilmiş xidmət",
  services: ["IT infrastrukturu", "CRM və ERP tətbiqi", "Data analitikası", "Veb və e-ticarət", "Rəqəmsal marketinq", "Keyfiyyət təminatı", "Mobil tətbiqlərin hazırlanması", "Bot həlləri", "Süni intellekt həlləri", "AI ilə video hazırlanması", "Konsultasiya", "Günlük kirayə idarəetməsi"],
  q: [
    [["Neçə işçi sistemlə işləyir?", ["1—10", "11—50", "51—200", "200+"]], ["Hazırda IT-ni kim idarə edir?", ["Daxili işçi", "Kənar şirkət", "Özüm", "Heç kim"]], ["Bir dəfəlik iş, yoxsa aylıq dəstək?", ["Bir dəfəlik", "Aylıq dəstək", "Hələ bilmirəm"]]],
    [["Məlumat hazırda harada saxlanılır?", ["Excel", "Hazır proqram", "WhatsApp", "Sistemsiz"]], ["Neçə nəfər istifadə edəcək?", ["1—5", "6—20", "21—50", "50+"]], ["Hansı proseslər sistemə düşür?", ["Satış", "Anbar", "Maliyyə", "Kadrlar", "İstehsal"], 1]],
    [["Məlumat hazırda harada yığılır?", ["Excel", "Verilənlər bazası", "Proqramlarda dağınıq", "Yığılmır"]], ["Hesabatlar necə hazırlanır?", ["Əl ilə", "Proqram avtomatik", "Hazırlanmır"]], ["Hesabata kim baxacaq?", ["Rəhbərlik", "Şöbə müdirləri", "Bütün komanda"]]],
    [["Hansı tip sayt lazımdır?", ["Korporativ", "E-ticarət", "Landing", "Yenilənmə"]], ["Hansı dillərdə?", ["Azərbaycan", "İngilis", "Rus"], 1], ["Mətn və şəkillər hazırdır?", ["Hazırdır", "Qismən", "Yoxdur"]]],
    [["Hansı kanallardan istifadə edirsiniz?", ["Instagram", "Facebook", "Google", "TikTok", "Heç biri"], 1], ["Aylıq reklam büdcəsi?", ["500 ₼-dək", "500—2 000 ₼", "2 000—5 000 ₼", "5 000 ₼+"]], ["Əsas məqsəd?", ["Satış artımı", "Tanınırlıq", "Müraciət toplama"]]],
    [["Məhsul hansı mərhələdədir?", ["İşlənir", "Buraxılışa hazır", "Canlıdadır"]], ["Nə tip məhsuldur?", ["Veb", "Mobil", "Hər ikisi", "Daxili sistem"]], ["Nə lazımdır?", ["Bir dəfəlik audit", "Davamlı manual test", "Avtomatlaşdırma"]]],
    [["Hansı platformalar lazımdır?", ["iOS", "Android", "Hər ikisi"]], ["Mövcud məhsul var?", ["Sıfırdan", "Mövcud tətbiqin inkişafı", "Saytın mobil versiyası"]], ["Əsas funksiya?", ["Sifariş və ödəniş", "Hesabat və panel", "Məzmun", "Daxili istifadə"]]],
    [["Bot hansı platformada olacaq?", ["Telegram", "WhatsApp", "Hər ikisi"]], ["Bot nə edəcək?", ["Sifariş qəbulu", "Bildiriş", "Sual-cavab", "Daxili proses"], 1], ["Mövcud sistemlə bağlanmalıdır?", ["Bəli, CRM", "Bəli, anbar/saytla", "Xeyr", "Bilmirəm"]]],
    [["Hansı işi AI-a vermək istəyirsiniz?", ["Müştəri sorğuları", "Sənəd emalı", "Daxili axtarış", "Proqnoz"], 1], ["Məlumat həssasdır?", ["Bəli, qapalı model lazımdır", "Xeyr", "Bilmirəm"]], ["Hazırda necə aparılır?", ["Əl ilə", "Qismən avtomatlaşdırılmış", "Aparılmır"]]],
    [["Video nə üçündür?", ["Məhsul təqdimatı", "Təlim", "Sosial kanal", "Reklam"], 1], ["Aylıq nə qədər video?", ["1—2", "3—8", "8+", "Bir dəfəlik"]], ["Hazır material var?", ["Mətn hazırdır", "Yalnız ideya", "Mövcud videolar var"]]],
    [["Konsultasiya nə barədədir?", ["Texnoloji seçim", "Mövcud sistemin auditi", "Rəqəmsallaşma planı", "Komanda quruluşu"]], ["Qərar nə vaxta lazımdır?", ["Bu ay", "1—3 ay", "Müddət yoxdur"]], ["Format?", ["Saatlıq görüş", "Yazılı hesabat", "Fərqi yoxdur"]]],
    [["Neçə obyektiniz var?", ["1—2", "3—10", "10+"]], ["Hansı platformalarda yerləşdirirsiniz?", ["Airbnb", "Booking", "Instagram", "Yerli saytlar"], 1], ["Hansı hissə ən çox vaxt alır?", ["Qonaqla yazışma", "Check-in", "Təmizlik", "Qiymət"], 1]],
  ],
  mailTag: "[nobug sorğu]",
  mailService: "Xidmət",
  mailName: "Ad",
  mailContact: "Əlaqə",
  mailDate: "Tarix",
  confirmSubject: "nobug — sorğunuz qeydə alındı",
  confirmBody: (name, service) => `Salam, ${name}!\n\n"${service}" üzrə sorğunuzu aldıq. Adətən bir iş günü ərzində əlaqə saxlayırıq.\n\nnobug`,
};

const en: SurveyLocale = {
  home: "Home",
  eyebrow: "Enquiry",
  title: "Three questions, one minute",
  note: "Pick a service. The answers reach us by email; we come back with an assessment within one business day.",
  pick: "Where do you need help?",
  pickNote: "If you need several, pick the most important — we will discuss the rest.",
  change: "Change",
  back: "Back",
  next: "Continue",
  send: "Send",
  sending: "Sending…",
  error: "Sending failed. Please try again in a moment.",
  multi: "more than one may be selected",
  step: "Step",
  contactTitle: "How should we reach you?",
  name: "Your name",
  namePh: "First and last name",
  channel: "Contact channel",
  channels: [["Email", "name@company.com"], ["Phone", "+994 XX XXX XX XX"], ["WhatsApp", "WhatsApp number"]],
  phone: "Phone",
  message: "Message",
  optional: "optional",
  consent: "I agree to the processing of my data in order to respond to my enquiry.",
  consentLink: "Privacy policy",
  errors: { name: "Enter your name.", contact: "Enter your contact details.", email: "The email address is not valid.", consent: "Consent is required to continue." },
  sentTitle: "Your enquiry has been logged.",
  sentText: "Your answers reached us together with the selected service.",
  sentNext: "What happens next: within one business day we contact you through the channel you chose, arrange a short call and give an initial assessment.",
  errorDirect: "Sending failed. Try again or write to us directly:",
  again: "New enquiry",
  summary: "Selected service",
  services: ["IT infrastructure", "CRM and ERP implementation", "Data analytics", "Web and e-commerce", "Digital marketing", "Quality assurance", "Mobile development", "Bot solutions", "AI solutions", "AI-assisted video production", "Consulting", "Short-term rental management"],
  q: [
    [["How many staff work with the systems?", ["1—10", "11—50", "51—200", "200+"]], ["Who runs IT today?", ["In-house", "External firm", "I do", "Nobody"]], ["One-off work or monthly support?", ["One-off", "Monthly support", "Not sure yet"]]],
    [["Where is the data kept today?", ["Excel", "Existing software", "WhatsApp", "No system"]], ["How many people will use it?", ["1—5", "6—20", "21—50", "50+"]], ["Which processes move into the system?", ["Sales", "Inventory", "Finance", "HR", "Production"], 1]],
    [["Where is data collected today?", ["Excel", "A database", "Scattered across tools", "Not collected"]], ["How are reports produced?", ["By hand", "Automatically", "Not produced"]], ["Who will read the reports?", ["Management", "Department heads", "The whole team"]]],
    [["What kind of site is needed?", ["Corporate", "E-commerce", "Landing", "Rebuild"]], ["Which languages?", ["Azerbaijani", "English", "Russian"], 1], ["Are copy and images ready?", ["Ready", "Partly", "No"]]],
    [["Which channels do you use?", ["Instagram", "Facebook", "Google", "TikTok", "None"], 1], ["Monthly ad budget?", ["Under 500 ₼", "500—2 000 ₼", "2 000—5 000 ₼", "5 000 ₼+"]], ["Main goal?", ["Sales growth", "Awareness", "Lead capture"]]],
    [["What stage is the product at?", ["In development", "Pre-release", "Live"]], ["What kind of product?", ["Web", "Mobile", "Both", "Internal system"]], ["What do you need?", ["One-off audit", "Ongoing manual testing", "Automation"]]],
    [["Which platforms?", ["iOS", "Android", "Both"]], ["Is there an existing product?", ["From scratch", "Extending an app", "Mobile version of a site"]], ["Core function?", ["Orders and payment", "Reporting", "Content", "Internal use"]]],
    [["Which platform for the bot?", ["Telegram", "WhatsApp", "Both"]], ["What will the bot do?", ["Take orders", "Notifications", "Q & A", "Internal process"], 1], ["Must it connect to a system?", ["Yes, CRM", "Yes, inventory or site", "No", "Not sure"]]],
    [["Which work should AI take over?", ["Customer enquiries", "Document processing", "Internal search", "Forecasting"], 1], ["Is the data sensitive?", ["Yes, closed model needed", "No", "Not sure"]], ["How is it handled today?", ["By hand", "Partly automated", "Not handled"]]],
    [["What is the video for?", ["Product", "Training", "Social channel", "Advertising"], 1], ["How many videos per month?", ["1—2", "3—8", "8+", "One-off"]], ["Is material ready?", ["Script ready", "Idea only", "Existing footage"]]],
    [["What is the consultation about?", ["Technology selection", "Audit of current systems", "Digitalisation plan", "Team structure"]], ["When is the decision needed?", ["This month", "1—3 months", "No deadline"]], ["Format?", ["Hourly sessions", "Written report", "Either"]]],
    [["How many properties?", ["1—2", "3—10", "10+"]], ["Where do you list them?", ["Airbnb", "Booking", "Instagram", "Local sites"], 1], ["What takes most of your time?", ["Guest messaging", "Check-in", "Cleaning", "Pricing"], 1]],
  ],
  mailTag: "[nobug sorğu][EN]",
  mailService: "Service",
  mailName: "Name",
  mailContact: "Contact",
  mailDate: "Date",
  confirmSubject: "nobug — your enquiry has been logged",
  confirmBody: (name, service) => `Hi ${name},\n\nWe received your "${service}" enquiry and usually make contact within one business day.\n\nnobug`,
};

const ru: SurveyLocale = {
  home: "Главная",
  eyebrow: "Запрос",
  title: "Три вопроса, одна минута",
  note: "Выберите услугу. Ответы приходят к нам по e-mail; возвращаемся с оценкой в течение одного рабочего дня.",
  pick: "В каком направлении нужна помощь?",
  pickNote: "Если направлений несколько, выберите самое важное — остальное обсудим.",
  change: "Изменить",
  back: "Назад",
  next: "Продолжить",
  send: "Отправить",
  sending: "Отправка…",
  error: "Не удалось отправить. Попробуйте ещё раз чуть позже.",
  multi: "можно выбрать несколько",
  step: "Шаг",
  contactTitle: "Как с вами связаться?",
  name: "Ваше имя",
  namePh: "Имя и фамилия",
  channel: "Канал связи",
  channels: [["E-mail", "name@company.com"], ["Телефон", "+994 XX XXX XX XX"], ["WhatsApp", "Номер WhatsApp"]],
  phone: "Телефон",
  message: "Сообщение",
  optional: "необязательно",
  consent: "Я согласен(а) на обработку моих данных для ответа на запрос.",
  consentLink: "Политика конфиденциальности",
  errors: { name: "Укажите имя.", contact: "Укажите контактные данные.", email: "Адрес электронной почты указан неверно.", consent: "Для продолжения нужно согласие." },
  sentTitle: "Запрос зафиксирован.",
  sentText: "Ваши ответы дошли до нас вместе с выбранной услугой.",
  sentNext: "Что дальше: в течение одного рабочего дня мы свяжемся с вами по выбранному каналу, назначим короткий созвон и дадим предварительную оценку.",
  errorDirect: "Не удалось отправить. Попробуйте ещё раз или напишите напрямую:",
  again: "Новый запрос",
  summary: "Выбранная услуга",
  services: ["IT-инфраструктура", "Внедрение CRM и ERP", "Аналитика данных", "Веб и e-commerce", "Цифровой маркетинг", "Контроль качества", "Мобильная разработка", "Боты", "Решения на основе ИИ", "Производство видео с ИИ", "Консультации", "Управление посуточной арендой"],
  q: [
    [["Сколько сотрудников работает с системами?", ["1—10", "11—50", "51—200", "200+"]], ["Кто сейчас ведёт IT?", ["Свой сотрудник", "Внешняя компания", "Я сам", "Никто"]], ["Разовая работа или месячная поддержка?", ["Разовая", "Месячная поддержка", "Пока не знаю"]]],
    [["Где сейчас хранятся данные?", ["Excel", "Готовая программа", "WhatsApp", "Без системы"]], ["Сколько человек будет работать?", ["1—5", "6—20", "21—50", "50+"]], ["Какие процессы уходят в систему?", ["Продажи", "Склад", "Финансы", "Кадры", "Производство"], 1]],
    [["Где собираются данные?", ["Excel", "База данных", "Разбросаны по программам", "Не собираются"]], ["Как готовятся отчёты?", ["Вручную", "Автоматически", "Не готовятся"]], ["Кто будет смотреть отчёты?", ["Руководство", "Руководители отделов", "Вся команда"]]],
    [["Какой сайт нужен?", ["Корпоративный", "E-commerce", "Landing", "Переделка"]], ["На каких языках?", ["Азербайджанский", "Английский", "Русский"], 1], ["Тексты и изображения готовы?", ["Готовы", "Частично", "Нет"]]],
    [["Какие каналы используете?", ["Instagram", "Facebook", "Google", "TikTok", "Никакие"], 1], ["Месячный бюджет на рекламу?", ["до 500 ₼", "500—2 000 ₼", "2 000—5 000 ₼", "5 000 ₼+"]], ["Главная цель?", ["Рост продаж", "Узнаваемость", "Сбор обращений"]]],
    [["На каком этапе продукт?", ["В разработке", "Перед релизом", "Уже в продакшене"]], ["Какой это продукт?", ["Веб", "Мобильный", "Оба", "Внутренняя система"]], ["Что нужно?", ["Разовый аудит", "Постоянное ручное тестирование", "Автоматизация"]]],
    [["Какие платформы нужны?", ["iOS", "Android", "Обе"]], ["Есть существующий продукт?", ["С нуля", "Развитие приложения", "Мобильная версия сайта"]], ["Основная функция?", ["Заказы и оплата", "Отчётность", "Контент", "Внутреннее использование"]]],
    [["На какой платформе бот?", ["Telegram", "WhatsApp", "Обе"]], ["Что будет делать бот?", ["Принимать заказы", "Уведомления", "Вопрос-ответ", "Внутренний процесс"], 1], ["Нужна связь с системой?", ["Да, CRM", "Да, склад или сайт", "Нет", "Не знаю"]]],
    [["Какую работу передать ИИ?", ["Обращения клиентов", "Обработка документов", "Внутренний поиск", "Прогноз"], 1], ["Данные чувствительные?", ["Да, нужна закрытая модель", "Нет", "Не знаю"]], ["Как это делается сейчас?", ["Вручную", "Частично автоматизировано", "Не делается"]]],
    [["Для чего видео?", ["Продукт", "Обучение", "Социальные каналы", "Реклама"], 1], ["Сколько видео в месяц?", ["1—2", "3—8", "8+", "Разово"]], ["Материал готов?", ["Сценарий готов", "Только идея", "Есть съёмки"]]],
    [["О чём консультация?", ["Выбор технологий", "Аудит систем", "План цифровизации", "Структура команды"]], ["Когда нужно решение?", ["В этом месяце", "1—3 месяца", "Без срока"]], ["Формат?", ["Часовые встречи", "Письменный отчёт", "Без разницы"]]],
    [["Сколько объектов?", ["1—2", "3—10", "10+"]], ["Где размещаете?", ["Airbnb", "Booking", "Instagram", "Локальные сайты"], 1], ["Что забирает больше всего времени?", ["Переписка с гостем", "Check-in", "Уборка", "Цены"], 1]],
  ],
  mailTag: "[nobug sorğu][RU]",
  mailService: "Услуга",
  mailName: "Имя",
  mailContact: "Контакт",
  mailDate: "Дата",
  confirmSubject: "nobug — запрос зафиксирован",
  confirmBody: (name, service) => `Здравствуйте, ${name}!\n\nМы получили ваш запрос по направлению «${service}» и обычно связываемся в течение одного рабочего дня.\n\nnobug`,
};

export const SURVEY: Record<Locale, SurveyLocale> = { az, en, ru };
export const getSurvey = (locale: Locale) => SURVEY[locale];


// Wire format for POST /api/anket
export type AnketPayload = {
  lang: Locale;
  service: number | string; // stable id ("web") or legacy index (3) — see lib/services.ts
  answers: Record<number, string | string[] | null>; // keyed by question index
  name: string;
  channel: ChannelId;
  contact: string;
  phone?: string; // optional, only when channel is email
  message?: string; // optional free text
  consent: boolean;
  website?: string; // honeypot — must stay empty
  openedAt: number; // Date.now() when the form was opened
};
