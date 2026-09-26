import sanitizeHtml from "sanitize-html";

/**
 * Rich-text HTML (Tiptap) is sanitized on the way in (server actions) and
 * again on the way out (public render): only the tags the editor can
 * produce survive, links are limited to http(s)/mailto, no inline handlers.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "h2", "h3", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "a", "blockquote", "code", "pre", "hr"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }) },
  disallowedTagsMode: "discard",
};

export const sanitizeRichText = (html: string) => sanitizeHtml(html ?? "", OPTIONS).trim();

/** Apply to every language of a localized rich-text value. */
export const sanitizeLocalized = <T extends Record<string, string>>(value: T): T => Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeRichText(v)])) as T;
