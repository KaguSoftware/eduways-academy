/**
 * Logo files live in public/brand/universities/logos/<slug>.png and are keyed by the
 * university slug — see the manifest alongside them for provenance and ink notes.
 *
 * Every mark here is dark-ink or carries its own opaque plate, so all of them read
 * correctly on the light surfaces the site uses — none needs inverting. A few marks
 * ship their own full-bleed background (white lettering on a brand colour); the
 * manifest flags those with a `plate` field.
 */
export const universityLogos: Record<string, string> = {
  "acibadem-university": "/brand/universities/logos/acibadem-university.png",
  "altinbas-university": "/brand/universities/logos/altinbas-university.png",
  "bahcesehir-university": "/brand/universities/logos/bahcesehir-university.png",
  "beykent-university": "/brand/universities/logos/beykent-university.png",
  "beykoz-university": "/brand/universities/logos/beykoz-university.png",
  "bezmialem-vakif-university": "/brand/universities/logos/bezmialem-vakif-university.png",
  "bilgi-university": "/brand/universities/logos/bilgi-university.png",
  "biruni-university": "/brand/universities/logos/biruni-university.png",
  "bogazici-university": "/brand/universities/logos/bogazici-university.png",
  "demiroglu-bilim-university": "/brand/universities/logos/demiroglu-bilim-university.png",
  "dogus-university": "/brand/universities/logos/dogus-university.png",
  "fatih-sultan-mehmet-vakif-university": "/brand/universities/logos/fatih-sultan-mehmet-vakif-university.png",
  "fenerbahce-university": "/brand/universities/logos/fenerbahce-university.png",
  "galatasaray-university": "/brand/universities/logos/galatasaray-university.png",
  "halic-university": "/brand/universities/logos/halic-university.png",
  "ibn-haldun-university": "/brand/universities/logos/ibn-haldun-university.png",
  "isik-university": "/brand/universities/logos/isik-university.png",
  "istanbul-29-mayis-university": "/brand/universities/logos/istanbul-29-mayis-university.png",
  "istanbul-arel-university": "/brand/universities/logos/istanbul-arel-university.png",
  "istanbul-atlas-university": "/brand/universities/logos/istanbul-atlas-university.png",
  "istanbul-aydin-university": "/brand/universities/logos/istanbul-aydin-university.png",
  "istanbul-esenyurt-university": "/brand/universities/logos/istanbul-esenyurt-university.png",
  "istanbul-galata-university": "/brand/universities/logos/istanbul-galata-university.png",
  "istanbul-gelisim-university": "/brand/universities/logos/istanbul-gelisim-university.png",
  "istanbul-health-and-technology-university": "/brand/universities/logos/istanbul-health-and-technology-university.png",
  "istanbul-kent-university": "/brand/universities/logos/istanbul-kent-university.png",
  "istanbul-kultur-university": "/brand/universities/logos/istanbul-kultur-university.png",
  "istanbul-medeniyet-university": "/brand/universities/logos/istanbul-medeniyet-university.png",
  "istanbul-okan-university": "/brand/universities/logos/istanbul-okan-university.png",
  "istanbul-rumeli-university": "/brand/universities/logos/istanbul-rumeli-university.png",
  "istanbul-sabahattin-zaim-university": "/brand/universities/logos/istanbul-sabahattin-zaim-university.png",
  "istanbul-technical-university": "/brand/universities/logos/istanbul-technical-university.png",
  "istanbul-ticaret-university": "/brand/universities/logos/istanbul-ticaret-university.png",
  "istanbul-topkapi-university": "/brand/universities/logos/istanbul-topkapi-university.png",
  "istanbul-university": "/brand/universities/logos/istanbul-university.png",
  "istanbul-university-cerrahpasa": "/brand/universities/logos/istanbul-university-cerrahpasa.png",
  "istanbul-yeni-yuzyil-university": "/brand/universities/logos/istanbul-yeni-yuzyil-university.png",
  "istinye-university": "/brand/universities/logos/istinye-university.png",
  "kadir-has-university": "/brand/universities/logos/kadir-has-university.png",
  "koc-university": "/brand/universities/logos/koc-university.png",
  "maltepe-university": "/brand/universities/logos/maltepe-university.png",
  "marmara-university": "/brand/universities/logos/marmara-university.png",
  "medipol-university": "/brand/universities/logos/medipol-university.png",
  "mimar-sinan-fine-arts-university": "/brand/universities/logos/mimar-sinan-fine-arts-university.png",
  "nisantasi-university": "/brand/universities/logos/nisantasi-university.png",
  "ozyegin-university": "/brand/universities/logos/ozyegin-university.png",
  "piri-reis-university": "/brand/universities/logos/piri-reis-university.png",
  "sabanci-university": "/brand/universities/logos/sabanci-university.png",
  "turkish-german-university": "/brand/universities/logos/turkish-german-university.png",
  "uskudar-university": "/brand/universities/logos/uskudar-university.png",
  "yeditepe-university": "/brand/universities/logos/yeditepe-university.png",
  "yildiz-technical-university": "/brand/universities/logos/yildiz-technical-university.png",
};

export const universityLogo = (slug: string): string | null => universityLogos[slug] ?? null;

/**
 * Silhouette of each mark, measured from its alpha channel — `round` for a disc or seal,
 * `wide` for a wordmark wider than 1.6:1, `square` for everything else. The card frames the
 * logo by this so a round mark is never boxed and a rectangular one never has its corners
 * rounded off. Kept in sync with the `shape` field in the logo manifest.
 */
export type LogoShape = "round" | "square" | "wide";

export const universityLogoShapes: Record<string, LogoShape> = {
  "acibadem-university": "wide",
  "altinbas-university": "wide",
  "bahcesehir-university": "square",
  "beykent-university": "round",
  "beykoz-university": "wide",
  "bezmialem-vakif-university": "wide",
  "bilgi-university": "wide",
  "biruni-university": "wide",
  "bogazici-university": "round",
  "demiroglu-bilim-university": "wide",
  "dogus-university": "round",
  "fatih-sultan-mehmet-vakif-university": "wide",
  "fenerbahce-university": "wide",
  "galatasaray-university": "square",
  "halic-university": "square",
  "ibn-haldun-university": "square",
  "isik-university": "wide",
  "istanbul-29-mayis-university": "square",
  "istanbul-arel-university": "round",
  "istanbul-atlas-university": "round",
  "istanbul-aydin-university": "round",
  "istanbul-esenyurt-university": "square",
  "istanbul-galata-university": "square",
  "istanbul-gelisim-university": "wide",
  "istanbul-health-and-technology-university": "wide",
  "istanbul-kent-university": "square",
  "istanbul-kultur-university": "round",
  "istanbul-medeniyet-university": "wide",
  "istanbul-okan-university": "square",
  "istanbul-rumeli-university": "round",
  "istanbul-sabahattin-zaim-university": "round",
  "istanbul-technical-university": "square",
  "istanbul-ticaret-university": "wide",
  "istanbul-topkapi-university": "wide",
  "istanbul-university": "round",
  "istanbul-university-cerrahpasa": "round",
  "istanbul-yeni-yuzyil-university": "round",
  "istinye-university": "wide",
  "kadir-has-university": "wide",
  "koc-university": "wide",
  "maltepe-university": "wide",
  "marmara-university": "square",
  "medipol-university": "wide",
  "mimar-sinan-fine-arts-university": "wide",
  "nisantasi-university": "square",
  "ozyegin-university": "wide",
  "piri-reis-university": "round",
  "sabanci-university": "wide",
  "turkish-german-university": "wide",
  "uskudar-university": "round",
  "yeditepe-university": "wide",
  "yildiz-technical-university": "round",
};

/** Shape for a logo path such as "/brand/universities/logos/koc-university.png". */
export function logoShape(logo: string | null | undefined): LogoShape {
  return universityLogoShapes[logoSlug(logo)] ?? "square";
}

/**
 * Intrinsic width ÷ height of each PNG, taken from the logo manifest. A fixed square slot
 * squeezes a 4:1 wordmark down to a sliver, so anywhere the layout can spare the width the
 * slot is sized from this instead: fixed height, width from the mark's own proportions.
 */
export const universityLogoAspects: Record<string, number> = {
  "acibadem-university": 4.06,
  "altinbas-university": 3.18,
  "bahcesehir-university": 0.79,
  "beykent-university": 1.0,
  "beykoz-university": 3.46,
  "bezmialem-vakif-university": 2.06,
  "bilgi-university": 4.41,
  "biruni-university": 1.79,
  "bogazici-university": 1.0,
  "demiroglu-bilim-university": 4.61,
  "dogus-university": 1.0,
  "fatih-sultan-mehmet-vakif-university": 2.17,
  "fenerbahce-university": 2.12,
  "galatasaray-university": 0.79,
  "halic-university": 0.84,
  "ibn-haldun-university": 1.53,
  "isik-university": 5.75,
  "istanbul-29-mayis-university": 1.0,
  "istanbul-arel-university": 1.03,
  "istanbul-atlas-university": 1.01,
  "istanbul-aydin-university": 1.0,
  "istanbul-esenyurt-university": 0.81,
  "istanbul-galata-university": 0.79,
  "istanbul-gelisim-university": 3.1,
  "istanbul-health-and-technology-university": 2.1,
  "istanbul-kent-university": 1.0,
  "istanbul-kultur-university": 1.16,
  "istanbul-medeniyet-university": 2.18,
  "istanbul-okan-university": 1.29,
  "istanbul-rumeli-university": 1.0,
  "istanbul-sabahattin-zaim-university": 1.0,
  "istanbul-technical-university": 0.71,
  "istanbul-ticaret-university": 2.07,
  "istanbul-topkapi-university": 2.94,
  "istanbul-university": 1.0,
  "istanbul-university-cerrahpasa": 1.0,
  "istanbul-yeni-yuzyil-university": 1.0,
  "istinye-university": 4.2,
  "kadir-has-university": 3.1,
  "koc-university": 4.7,
  "maltepe-university": 5.69,
  "marmara-university": 1.12,
  "medipol-university": 3.28,
  "mimar-sinan-fine-arts-university": 4.57,
  "nisantasi-university": 0.97,
  "ozyegin-university": 3.37,
  "piri-reis-university": 1.0,
  "sabanci-university": 2.35,
  "turkish-german-university": 4.34,
  "uskudar-university": 1.0,
  "yeditepe-university": 2.63,
  "yildiz-technical-university": 1.0,
};

/**
 * Marks that ship a full-bleed opaque background rather than transparency. They need the
 * backing plate painted in their own colour and clipped tight to the artwork, otherwise the
 * plate's hard corners sit inside a white chip and read as a mistake.
 */
export const universityLogoPlates: Record<string, string> = {
  "acibadem-university": "#ffffff",
  "istanbul-29-mayis-university": "#1f83c0",
  "istanbul-kent-university": "#800426",
  "sabanci-university": "#004089",
};

const logoSlug = (logo: string | null | undefined) => logo?.split("/").pop()?.replace(/\.png$/, "") ?? "";

/** Width ÷ height for a logo path; falls back to 1 (square) for unknown marks. */
export function logoAspect(logo: string | null | undefined): number {
  return universityLogoAspects[logoSlug(logo)] ?? 1;
}

/** Baked-in background colour for a logo path, or null when the mark is transparent. */
export function logoPlate(logo: string | null | undefined): string | null {
  return universityLogoPlates[logoSlug(logo)] ?? null;
}
