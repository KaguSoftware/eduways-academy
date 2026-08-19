import type { UniversityWithRelations } from "./types";

/** Slim the hydrated university for client components (list/compare) — drops heavy relations. */
export function slimUniversity(u: UniversityWithRelations): UniversityWithRelations {
  return {
    ...u,
    description: u.description,
    programs: u.programs.map((p) => ({ ...p, faculty: { fa: "", en: "" }, tuition_note: null })),
    requirements: [],
    scholarships: [],
    rankings: [],
  };
}
