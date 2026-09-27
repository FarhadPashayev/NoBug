import bcrypt from "bcryptjs";

/**
 * Cost 10: ~60–90 ms on Vercel's CPUs instead of ~350 ms at 12 — the login
 * round trip is dominated by this. Hashes made with a higher cost still
 * verify; `needsRehash` lets the login path upgrade them transparently.
 */
const ROUNDS = 10;

export const hashPassword = (plain: string) => bcrypt.hash(plain, ROUNDS);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
export const needsRehash = (hash: string) => bcrypt.getRounds(hash) !== ROUNDS;
