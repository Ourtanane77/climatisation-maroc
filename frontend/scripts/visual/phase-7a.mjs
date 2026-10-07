// Phase 7a (home, calculator, blog, article): `node scripts/visual-compare.mjs phase-7a`.
// [name, design page, site path, action, options]
const pairs = [
  ["accueil", "Accueil.dc.html", "/", null, { full: true }],
  ["calculateur", "Calculateur puissance.dc.html", "/calculateur-puissance", null, { full: true }],
  ["blog", "Blog.dc.html", "/blog", null, { full: true }],
  ["blog-categorie", "Blog categorie.dc.html?c=guides", "/blog/categorie/guides", null, { full: true }],
  ["article", "Article puissance climatiseur.dc.html", "/blog/quelle-puissance-de-climatiseur-pour-ma-piece", null, { full: true }],
];

export default pairs;

export const actions = {};
