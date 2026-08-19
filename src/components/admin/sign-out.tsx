"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/admin/actions";

export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => { await signOut(); router.push("/admin/login"); router.refresh(); })}
      disabled={pending}
      className="inline-flex items-center gap-1 hover:text-danger disabled:opacity-50"
    >
      <LogOut className="size-3.5" />{label}
    </button>
  );
}
