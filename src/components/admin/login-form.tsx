"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/admin/schemas";
import { api } from "@/lib/admin/client";
import { Button } from "./ui/button";
import { Card, CardBody } from "./ui/card";
import { Field, Input } from "./ui/field";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await api("/api/admin/auth/login", { method: "POST", body: JSON.stringify(values) });
      toast.success("Xoş gəldiniz");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Giriş alınmadı");
    }
  });

  return (
    <Card>
      <CardBody>
        <h1 className="text-lg font-semibold">Panelə giriş</h1>
        <p className="mt-1 text-sm text-ad-muted-fg">Məzmunu idarə etmək üçün hesabınızla daxil olun.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Field label="E-poçt" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" autoFocus aria-invalid={!!errors.email} {...register("email")} />
          </Field>
          <Field label="Şifrə" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
          </Field>

          {error && (
            <p className="rounded-lg bg-ad-danger/10 px-3 py-2 text-sm text-ad-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Daxil ol
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
