import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dict";
import type { ShowcaseCopy } from "@/lib/i18n/showcase";
import { ChannelIcon, type Channel } from "@/components/chrome/channels";
import { Rise } from "@/components/ui/motion";
import { TrackedAnchor } from "@/components/ui/tracked";
import type { AnalyticsEvent } from "@/lib/analytics";
import { ContactForm } from "./contact-form";
import { SectionHead } from "./section-head";

/** GA4 event for a channel link (the same names the previous site used). */
function channelEvent(id: Channel["id"], lang: Locale): AnalyticsEvent | null {
  if (id === "email") return { name: "contact_email_click", params: { locale: lang } };
  if (id === "whatsapp") return { name: "contact_whatsapp_click", params: { locale: lang } };
  if (id === "phone") return { name: "contact_phone_click", params: { locale: lang } };
  return null; // social profiles have no event of their own
}

function ChannelLink({ event, ...props }: React.ComponentProps<"a"> & { event: AnalyticsEvent | null }) {
  return event ? <TrackedAnchor event={event} {...props} /> : <a {...props} />;
}

/** Form + direct channels (WhatsApp, phone, e-mail, Instagram, LinkedIn — whichever the panel has). */
export function ContactSection({ index, lang, t, sc, channels, services, address, hours }: { index: number; lang: Locale; t: Dictionary; sc: ShowcaseCopy; channels: Channel[]; services: string[]; address: string; hours: string }) {
  return (
    <section id="elaqe" className="scroll-mt-6 px-gutter py-[clamp(72px,10vw,160px)]">
      <SectionHead index={index} title={sc.sections.contact} lead={t.contactTitle} />
      <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
        <Rise className="flex flex-col gap-8">
          <p className="max-w-[36ch] text-[15px] leading-[1.6] text-paper/65">{t.contactText}</p>
          <ul className="grid gap-2">
            {channels.map((c) => (
              <li key={c.id}>
                <ChannelLink
                  href={c.href}
                  event={channelEvent(c.id, lang)}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex min-h-12 items-center gap-4 border-b border-ink-line py-2 transition-colors hover:border-paper/40"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink-900 text-paper/80 transition-colors group-hover:bg-yellow group-hover:text-ink-950">
                    <ChannelIcon id={c.id} size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] text-paper/60">{c.label}</span>
                    <span className="block truncate text-[15px]">{c.value}</span>
                  </span>
                </ChannelLink>
              </li>
            ))}
          </ul>
          {(address || hours) && (
            <div className="text-[14px] leading-[1.6] text-paper/55">
              {address && <p>{address}</p>}
              {hours && <p>{hours}</p>}
            </div>
          )}
        </Rise>
        <Rise delay={0.08}>
          <ContactForm
            lang={lang}
            services={services}
            t={{
              ...sc.form,
              submit: t.formSubmit,
              sending: t.formSending,
              sent: t.formSent,
              error: t.formError,
              required: t.fieldRequired,
              emailInvalid: t.fieldEmailInvalid,
              nameInvalid: t.fieldNameInvalid,
            }}
          />
        </Rise>
      </div>
    </section>
  );
}
