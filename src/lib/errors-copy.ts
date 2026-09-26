import type { Locale } from "@/lib/i18n/config";

export const ERROR_COPY: Record<Locale, { title: string; text: string; retry: string; home: string; offline: string; online: string }> = {
  az: { title: "Nəsə səhv getdi", text: "Səhifə yüklənərkən xəta baş verdi. Yenidən cəhd edin — problem davam edərsə, bir az sonra qayıdın.", retry: "Yenidən cəhd et", home: "Ana səhifə", offline: "İnternet bağlantısı yoxdur. Bəzi funksiyalar işləməyə bilər.", online: "Bağlantı bərpa olundu." },
  en: { title: "Something went wrong", text: "The page failed to load. Try again — if it keeps happening, come back a little later.", retry: "Try again", home: "Home", offline: "You are offline. Some features may not work.", online: "Back online." },
  ru: { title: "Что-то пошло не так", text: "Не удалось загрузить страницу. Попробуйте ещё раз — если проблема повторяется, вернитесь чуть позже.", retry: "Повторить", home: "Главная", offline: "Нет подключения к интернету. Некоторые функции могут не работать.", online: "Соединение восстановлено." },
};
