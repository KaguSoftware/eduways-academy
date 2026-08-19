import { notFound } from "next/navigation";

/** Catch-all inside the locale segment so unknown paths render the localized not-found page. */
export default function CatchAll() {
  notFound();
}
