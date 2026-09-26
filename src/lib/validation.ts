/**
 * Field rules shared by the public forms (client) and /api/leads (server).
 * Names: letters of any script, marks, spaces, hyphens and apostrophes only —
 * no <, >, /, quotes or digits. E-mail: one @, a dotted domain with a
 * 2+ letter TLD, ASCII local part.
 */
export const NAME_RE = /^[\p{L}\p{M}]+(?:[\s'’-]+[\p{L}\p{M}]+)*$/u;
export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
/** characters that never belong in a name, subject or e-mail */
export const FORBIDDEN_RE = /[<>"'\/\\]/;

export const isValidName = (v: string) => v.trim().length >= 2 && v.trim().length <= 120 && NAME_RE.test(v.trim());
export const isValidEmail = (v: string) => v.trim().length <= 160 && !FORBIDDEN_RE.test(v) && EMAIL_RE.test(v.trim());
