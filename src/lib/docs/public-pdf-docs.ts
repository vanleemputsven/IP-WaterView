/**
 * Publieke PDF’s in `public/docs/`. Alleen hier gedefinieerde paden worden in de UI getoond.
 * Nieuwe bestanden: bestand in `public/docs/` zetten en hier een regel toevoegen.
 */
export const publicPdfDocuments = [
  {
    href: "/docs/01_Solution_Design_Waterview_r0955672.pdf",
    title: "Solution design",
  },
  {
    href: "/docs/02_Systeemuitleg_Waterview_r0955672.pdf",
    title: "Systeemuitleg",
  },
  {
    href: "/docs/03_API_documentatie_Waterview_r0955672.pdf",
    title: "API-documentatie (PDF)",
  },
  {
    href: "/docs/04_Handleiding_Waterview_r0955672.pdf",
    title: "Handleiding",
  },
  {
    href: "/docs/05_Integratie_van_onderzoek_Waterview_r0955672.pdf",
    title: "Integratie van onderzoek",
  },
  {
    href: "/docs/06_Proces_Documentatie_Waterview_r0955672.pdf",
    title: "Procesdocumentatie",
  },
] as const;

export type PublicPdfDocument = (typeof publicPdfDocuments)[number];
