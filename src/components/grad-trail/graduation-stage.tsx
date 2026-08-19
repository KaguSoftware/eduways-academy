"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptionalGradTrail } from "./grad-trail-context";

/** Intrinsic size of /assets/student-*.svg (viewBox 420×600). */
const STUDENT = { w: 420, h: 600 };

/**
 * The footer "stage": the student who catches the cap, and the Graduate button that
 * makes them throw it. The figure deliberately sits *outside* the lifted content
 * container (z-index auto) so the cap, drawn by <GradTrail> at z-index 1, lands on
 * top of the head; the button is lifted to z-index 2 like the rest of the content.
 */
export function GraduationStage() {
  const t = useTranslations("footer");
  const trail = useOptionalGradTrail();
  const pose = trail?.pose ?? "before";
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const hintId = React.useId();

  const onGraduate = () => {
    if (trail) trail.throwHat(btnRef.current);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="grad-stage-wrap relative flex flex-col items-center pt-12 md:pt-14">
      <div data-grad-stage data-pose={pose} className="grad-stage" aria-hidden>
        <Image src="/assets/student-before-throw.svg" alt="" width={STUDENT.w} height={STUDENT.h} unoptimized draggable={false} className="grad-stage__figure grad-stage__figure--before" />
        <Image src="/assets/student-after-throw.svg" alt="" width={STUDENT.w} height={STUDENT.h} unoptimized draggable={false} className="grad-stage__figure grad-stage__figure--after" />
      </div>
      <Button ref={btnRef} type="button" size="md" variant="dark" onClick={onGraduate} className="relative z-[2] mt-3" aria-describedby={hintId} data-grad-button>
        <GraduationCap aria-hidden />
        {t("graduate")}
      </Button>
      <span id={hintId} className="sr-only">{t("graduateHint")}</span>
    </div>
  );
}
