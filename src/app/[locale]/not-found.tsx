import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <>
      <Header />
      <main className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-en text-8xl font-extrabold text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-extrabold">{t("notFoundTitle")}</h1>
        <p className="mt-2 max-w-md text-muted">{t("notFoundBody")}</p>
        <Button asChild size="lg" className="mt-8"><Link href="/">{t("goHome")}</Link></Button>
      </main>
    </>
  );
}
