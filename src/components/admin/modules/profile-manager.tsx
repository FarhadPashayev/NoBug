"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/lib/admin/client";
import { passwordSchema, profileSchema, type PasswordInput, type ProfileInput } from "@/lib/admin/schemas";
import type { SessionUser } from "@/lib/auth/session";
import { Button } from "../ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "../ui/card";
import { Field, Input } from "../ui/field";

export function ProfileManager({ user }: { user: SessionUser }) {
  const router = useRouter();

  const profile = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name, email: user.email } });
  const password = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  const saveProfile = useMutation({
    mutationFn: (values: ProfileInput) => api("/api/admin/auth/profile", { method: "PATCH", body: JSON.stringify(values) }),
    onSuccess: () => {
      toast.success("Profil yeniləndi");
      router.refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const savePassword = useMutation({
    mutationFn: (values: PasswordInput) => api("/api/admin/auth/password", { method: "POST", body: JSON.stringify(values) }),
    onSuccess: () => {
      toast.success("Şifrə dəyişdirildi");
      password.reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={profile.handleSubmit((v) => saveProfile.mutateAsync(v))} noValidate>
        <Card>
          <CardHeader title="Profil" description="Ad və e-poçt ünvanı." />
          <CardBody className="space-y-4">
            <Field label="Ad" htmlFor="name" error={profile.formState.errors.name?.message}>
              <Input id="name" autoComplete="name" {...profile.register("name")} />
            </Field>
            <Field label="E-poçt" htmlFor="profile-email" error={profile.formState.errors.email?.message}>
              <Input id="profile-email" type="email" autoComplete="email" {...profile.register("email")} />
            </Field>
          </CardBody>
          <CardFooter>
            <Button type="submit" loading={saveProfile.isPending}>
              Yadda saxla
            </Button>
          </CardFooter>
        </Card>
      </form>

      <form onSubmit={password.handleSubmit((v) => savePassword.mutateAsync(v))} noValidate>
        <Card>
          <CardHeader title="Şifrə" description="Ən azı 10 simvol." />
          <CardBody className="space-y-4">
            <Field label="Cari şifrə" htmlFor="currentPassword" error={password.formState.errors.currentPassword?.message}>
              <Input id="currentPassword" type="password" autoComplete="current-password" {...password.register("currentPassword")} />
            </Field>
            <Field label="Yeni şifrə" htmlFor="newPassword" error={password.formState.errors.newPassword?.message}>
              <Input id="newPassword" type="password" autoComplete="new-password" {...password.register("newPassword")} />
            </Field>
            <Field label="Yeni şifrə (təkrar)" htmlFor="confirmPassword" error={password.formState.errors.confirmPassword?.message}>
              <Input id="confirmPassword" type="password" autoComplete="new-password" {...password.register("confirmPassword")} />
            </Field>
          </CardBody>
          <CardFooter>
            <Button type="submit" loading={savePassword.isPending}>
              Şifrəni dəyiş
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
