// Phase 7b (agent E): solutions, sectors, services, static and legal pages, plan du site, 404.
// `node scripts/visual-compare.mjs phase-7b` from frontend/. Legal pages are unpublished in the
// dev database: publish one temporarily to capture "cgv".
const pairs = [
  ["solutions", "Solutions professionnelles.dc.html", "/solutions", null, { full: true }],
  ["restaurants", "Restaurants.dc.html", "/solutions/restaurants", null, { full: true }],
  ["service-installation", "Service.dc.html", "/services/installation", null, { full: true }],
  ["service-visite", "Service.dc.html?s=visite", "/services/visite-technique", null, { full: true }],
  ["service-sav", "Service.dc.html?s=sav", "/services/service-apres-vente", null, { full: true }],
  ["services", null, "/services", null, { full: true }],
  ["a-propos", "A propos.dc.html", "/a-propos", null, { full: true }],
  ["livraison", "Livraison et paiement.dc.html", "/livraison-et-paiement", null, { full: true }],
  ["cgv", "CGV.dc.html", "/cgv", null, { full: true }],
  ["404", "Page introuvable.dc.html", "/page-qui-n-existe-pas", null, { full: true }],
  ["plan-du-site", "Plan du site.dc.html", "/plan-du-site", null, { full: true }],
];

export default pairs;

export const actions = {};
