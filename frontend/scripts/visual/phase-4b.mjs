// Phase 4b: product page, brand page, compare. `node scripts/visual-compare.mjs phase-4b`
// [name, design page, site path, action, options]
const pairs = [
  ["produit", "Produit LG Dual Inverter.dc.html", "/produit/lg-dual-inverter?v=D13AJH.N", null, { full: true }],
  ["produit-top", "Produit LG Dual Inverter.dc.html", "/produit/lg-dual-inverter?v=D13AJH.N", null, {}],
  ["produit-rupture", "Produit LG Dual Inverter.dc.html?stock=1", "/produit/cuivre-34-15-m", null, {}],
  ["comparer", "Comparer.dc.html", "/comparer?p=D13AJH.N,42QHG012D8SC-R32,FSW12T24PM%2FN", null, { full: true }],
  ["marque-lg", "Marque LG.dc.html", "/marques/lg", null, { full: true }],
  ["marques", null, "/marques", null, {}],
];

export default pairs;

export const actions = {};
