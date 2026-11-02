import type { Locale } from "@/lib/i18n/config";

// Delivered client sites, shipped with the code so they can be previewed on
// dev before they reach production (dev and production share one database).
// A project created in the panel with the same slug replaces the entry here.
// Facts only: what each site is and what it contains — no invented figures.
// TODO(content): year and duration once the team confirms them.

type L = Record<Locale, string>;
export type PortfolioItem = {
  slug: string;
  url: string;
  /** service slug the work belongs to — it follows that card in the carousel */
  service: string;
  title: L;
  short: L;
  body: L;
  tags: string[];
  year: string;
  cover: string;
  gallery: { src: string; alt: L }[];
};

const shot = (slug: string, file: string) => `/assets/work/${slug}/${file}.webp`;

export const PORTFOLIO: PortfolioItem[] = [
  {
    slug: "kandar",
    url: "https://kandar.az/az",
    service: "web",
    title: { az: "Kandar", en: "Kandar", ru: "Kandar" },
    short: {
      az: "Fərdi mebel istehsalçısı KANDAR Concept Store üçün korporativ sayt.",
      en: "Corporate website for KANDAR Concept Store, a bespoke furniture maker.",
      ru: "Корпоративный сайт KANDAR Concept Store — производителя мебели на заказ.",
    },
    body: {
      az: "<p>KANDAR fərdi dizayn, keyfiyyətli material və peşəkar istehsalı bir araya gətirən mebel brendidir. Sayt brendin estetikasını daşıyan sakit, fotoşəkil önə çıxan dizaynla qurulub.</p><p>Bölmələr: seçilmiş interyer layihələri, jurnal, xəbərlər, şirkət haqqında məlumat və görüş təyini. Sayt Azərbaycan və ingilis dillərindədir, mobil cihazlar üçün ayrıca uyğunlaşdırılıb.</p>",
      en: "<p>KANDAR is a furniture brand that brings together bespoke design, quality materials and professional manufacturing. The site is built around a calm, photography-led design that carries the brand's look.</p><p>Sections: selected interior projects, a journal, news, the company story and appointment booking. The site is in Azerbaijani and English and is tailored for mobile devices.</p>",
      ru: "<p>KANDAR — мебельный бренд, объединяющий индивидуальный дизайн, качественные материалы и профессиональное производство. Сайт построен на спокойном дизайне с акцентом на фотографии.</p><p>Разделы: избранные интерьерные проекты, журнал, новости, информация о компании и запись на встречу. Сайт на азербайджанском и английском языках, адаптирован для мобильных устройств.</p>",
    },
    tags: ["Next.js"],
    year: "",
    cover: shot("kandar", "cover"),
    gallery: [
      { src: shot("kandar", "s1"), alt: { az: "Kandar saytı: şirkət haqqında bölmə", en: "Kandar site: about section", ru: "Сайт Kandar: раздел о компании" } },
      { src: shot("kandar", "s2"), alt: { az: "Kandar saytı: seçilmiş layihələr", en: "Kandar site: selected projects", ru: "Сайт Kandar: избранные проекты" } },
      { src: shot("kandar", "mobile"), alt: { az: "Kandar saytının mobil görünüşü", en: "Kandar site on a phone", ru: "Сайт Kandar на телефоне" } },
    ],
  },
  {
    slug: "beic",
    url: "https://beic.az/",
    service: "web",
    title: { az: "BEIC", en: "BEIC", ru: "BEIC" },
    short: {
      az: "1997-ci ildən fəaliyyət göstərən xaricdə təhsil mərkəzi BEIC üçün sayt.",
      en: "Website for BEIC, an education-abroad centre operating since 1997.",
      ru: "Сайт BEIC — центра образования за рубежом, работающего с 1997 года.",
    },
    body: {
      az: "<p>BEIC Azərbaycanda xaricdə təhsil üzrə ilk mərkəz kimi tanınır. Sayt tələbələrə və valideynlərə mərkəzin bütün istiqamətlərini bir yerdə təqdim edir.</p><p>Bölmələr: imtahanlara hazırlıq (IELTS, TOEFL, SAT), xaricdə təhsil, internat məktəbləri, universitet turları, danışıq klubları və yay məktəbləri, xəbərlər və tədbirlər. Hər səhifədən WhatsApp və telefonla birbaşa əlaqə mümkündür.</p>",
      en: "<p>BEIC is known as the first education-abroad centre in Azerbaijan. The site presents all of the centre's programmes to students and parents in one place.</p><p>Sections: test preparation (IELTS, TOEFL, SAT), study abroad, boarding schools, university tours, speaking clubs and summer schools, news and events. WhatsApp and phone contact are one tap away on every page.</p>",
      ru: "<p>BEIC известен как первый в Азербайджане центр образования за рубежом. Сайт собирает все направления центра в одном месте для студентов и родителей.</p><p>Разделы: подготовка к экзаменам (IELTS, TOEFL, SAT), обучение за рубежом, школы-пансионы, университетские туры, разговорные клубы и летние школы, новости и события. Связь по WhatsApp и телефону доступна на каждой странице.</p>",
    },
    tags: ["Next.js"],
    year: "",
    cover: shot("beic", "cover"),
    gallery: [
      { src: shot("beic", "s1"), alt: { az: "BEIC saytı: proqramlar", en: "BEIC site: programmes", ru: "Сайт BEIC: программы" } },
      { src: shot("beic", "s2"), alt: { az: "BEIC saytı: xəbərlər və tədbirlər", en: "BEIC site: news and events", ru: "Сайт BEIC: новости и события" } },
      { src: shot("beic", "mobile"), alt: { az: "BEIC saytının mobil görünüşü", en: "BEIC site on a phone", ru: "Сайт BEIC на телефоне" } },
    ],
  },
  {
    slug: "bormark",
    url: "https://bormarkglobal.com/",
    service: "web",
    title: { az: "Bormark Supply", en: "Bormark Supply", ru: "Bormark Supply" },
    short: {
      az: "Çindən Azərbaycana təchizat tərəfdaşı Bormark Supply üçün üçdilli sayt.",
      en: "Trilingual website for Bormark Supply, a China-to-Azerbaijan sourcing partner.",
      ru: "Трёхъязычный сайт Bormark Supply — партнёра по поставкам из Китая в Азербайджан.",
    },
    body: {
      az: "<p>Bormark Supply Çindən Azərbaycana tədarükçü axtarışı, fabrik yoxlanışı, satınalma, keyfiyyət nəzarəti, logistika və gömrük xidmətlərini bir tərəfdaşda birləşdirir. Sayt bu marşrutu addım-addım, animasiyalı hekayə kimi göstərir.</p><p>Bölmələr: xidmətlər, sahələr, iş prosesi, keyslər, tez-tez verilən suallar və təklif forması. Sayt Azərbaycan, ingilis və rus dillərindədir; scroll animasiyaları GSAP və Lenis ilə qurulub.</p>",
      en: "<p>Bormark Supply brings supplier search, factory audits, purchasing, quality control, logistics and customs for China-to-Azerbaijan trade under one partner. The site tells that route step by step as an animated story.</p><p>Sections: services, industries, how the work is done, case studies, FAQ and a quote form. The site is in Azerbaijani, English and Russian; the scroll animations are built with GSAP and Lenis.</p>",
      ru: "<p>Bormark Supply объединяет поиск поставщиков, аудит фабрик, закупки, контроль качества, логистику и таможню на маршруте Китай — Азербайджан. Сайт рассказывает этот маршрут шаг за шагом в виде анимированной истории.</p><p>Разделы: услуги, отрасли, этапы работы, кейсы, частые вопросы и форма запроса. Сайт на азербайджанском, английском и русском; анимации прокрутки построены на GSAP и Lenis.</p>",
    },
    tags: ["Astro", "GSAP", "Lenis"],
    year: "",
    cover: shot("bormark", "cover"),
    gallery: [
      { src: shot("bormark", "s1"), alt: { az: "Bormark saytı: marşrut animasiyası", en: "Bormark site: route animation", ru: "Сайт Bormark: анимация маршрута" } },
      { src: shot("bormark", "s2"), alt: { az: "Bormark saytı: xidmətlər", en: "Bormark site: services", ru: "Сайт Bormark: услуги" } },
      { src: shot("bormark", "mobile"), alt: { az: "Bormark saytının mobil görünüşü", en: "Bormark site on a phone", ru: "Сайт Bormark на телефоне" } },
    ],
  },
];
