"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { bootstrapPanel } from "@/actions/bootstrap";
import { Button } from "./ui/button";
import { Card, CardBody } from "./ui/card";

/** Shown on the login page until the first admin exists. */
export function BootstrapCard() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    const res = await bootstrapPanel();
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Panel quraşdırıldı — indi daxil olun");
    router.refresh();
  }

  return (
    <Card className="mt-4 border-ad-accent/40">
      <CardBody className="space-y-3 text-sm">
        <p className="font-medium text-ad-fg">İlkin quraşdırma</p>
        <p className="text-ad-muted-fg">
          Bazada hələ hesab yoxdur. Bu düymə <code className="rounded bg-ad-muted px-1.5 py-0.5 font-mono text-xs">ADMIN_EMAIL</code> /{" "}
          <code className="rounded bg-ad-muted px-1.5 py-0.5 font-mono text-xs">ADMIN_PASSWORD</code> ilə admin hesabı yaradır və saytın hazırkı məzmununu bazaya köçürür.
        </p>
        <Button onClick={run} loading={busy} className="w-full">
          Quraşdır
        </Button>
      </CardBody>
    </Card>
  );
}
