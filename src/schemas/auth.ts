import { z } from "zod";
import { required } from "./common";

export const loginSchema = z.object({
  email: z.string().trim().email("Düzgün e-poçt deyil"),
  password: z.string().min(8, "Ən azı 8 simvol"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: required(120),
  email: z.string().trim().email("Düzgün e-poçt deyil"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Cari şifrəni yazın"),
    newPassword: z.string().min(10, "Ən azı 10 simvol"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Şifrələr uyğun gəlmir" });
export type PasswordInput = z.infer<typeof passwordSchema>;
