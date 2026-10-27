# Arfro: creative brief (owner, 2026-10-27)

Condensed from the owner's brief « ARFRO — Reimagining climate comfort in Morocco ». The French
copy below is the owner's own and may be used as written. Arfro only: Climatisation Maroc keeps
its design.

## Decisions taken when the work started (2026-10-27)

- **Photos.** Build with the existing assets (`design/uploads/`, `frontend/public/design/`:
  `cover-ariha` Marrakech living room, `solutions-category` hotel lobby, product cut-outs, brand
  logos) and back-office image slots for every photo the brief asks for (office, restaurant, hotel,
  technician, exteriors). No AI-generated images until the owner approves them. A section whose
  photo slot is empty uses a typographic/editorial layout, never a broken or placeholder image.
- **Services (ARFRO Care).** Only services the site already offers: installation (on quote),
  technical visit (priced in Réglages), advice by phone/WhatsApp (« Conseil » phone in Réglages).
  Maintenance and repairs are not advertised until the owner confirms them.
- **Real projects and testimonials.** None exist: the components are built and stay hidden until
  real, verified entries are added in the back office.
- **Order.** Design system → home + navigation → product/category pages + professional journey → QA.

## Brand

- ARFRO, the online store of **Ariha Froid** (Marrakech, since 2008), a **distributor** of
  international brands (LG, Carrier, CIAT, Fitco…). Never present a third-party product as made
  by ARFRO.
- Categories: climatisation, chauffe-eau, ventilation, gaines, cuivre et accessoires frigorifiques,
  pièces de rechange, solutions professionnelles.
- Audiences: particuliers, installateurs/techniciens, entreprises, hôtels et restaurants,
  architectes et promoteurs, professionnels du bâtiment.
- Ambition: Morocco's premium climate-comfort specialist (confort, expertise, fiabilité,
  innovation, service professionnel, efficacité énergétique, relation durable).
- Signature: **ARFRO — Le confort, notre signature.** Campaign line: **Le confort qui change tout.**
- Tone: premium, human, clear, expert, reassuring, modern. Short confident headlines, no clichés,
  no exaggerated promises, don't repeat the same expressions everywhere.

## Creative direction

- **Engineered comfort. Human experience.** Technology precision + warmth of Moroccan homes.
  Not an electronics retailer, not a SaaS template. Strong typography, architectural compositions,
  editorial whitespace, cinematic storytelling, refined product presentation.
- Avoid: rounded-card grids everywhere, random gradients, pills and badges overload, glassmorphism,
  3D, discount-driven hero, fake testimonials/statistics, unverified claims, placeholder buttons,
  broken links, non-functional interactions.
- **Colours:** Primary Blue `#105BA8`, Deep Navy `#101C30`, Electric Blue `#1684E8`, Soft Ice
  `#F2F7FB`, White `#FFFFFF`, Graphite `#252B35`, Warm Neutral `#F5F3EF`. Use blue intelligently;
  alternate bright editorial, warm lifestyle and a few dark technology sections.
- **Typography:** contemporary sans (Manrope is already loaded in the project). Oversized
  editorial headlines where appropriate.
- **Visual signature — « The flow of comfort »:** airflow as a recognisable motif: thin flowing
  curves, soft blue airflow lines, smooth temperature transitions, scroll-driven air motion.
  Subtle, never a showcase.
- **Motion:** GSAP (+ ScrollTrigger) where it adds value: staggered reveals, gentle parallax, image
  clip reveals, airflow line drawing, small purposeful hovers. Transform/opacity only, no layout
  shift, reduced-motion support, optimised for mid-range Android, don't animate everything.

## Home page (13 sections)

1. **Cinematic hero.** Eyebrow « ARFRO — EXPERT DU CONFORT CLIMATIQUE ». H1 **Le confort qui change
   tout.** Text « Des solutions pensées pour rafraîchir, chauffer et améliorer votre quotidien. »
   CTA « Découvrir nos solutions », secondary « Trouver ma climatisation ». Full-width Moroccan
   interior (outside heat, inside comfort). Staggered headline reveal, gentle image movement,
   elegant scroll indicator. No discount advert in the hero (promotions stay reachable elsewhere).
2. **Manifesto.** **Le confort ne se résume pas à une température.** « C'est la sensation d'être
   parfaitement bien chez soi. C'est un environnement où l'on travaille mieux, où l'on se repose
   pleinement et où chaque instant devient plus agréable. » Expertise + selected technologies +
   personalised support. Large editorial type, architectural photo, airflow line linking text and
   image. CTA « Découvrir ARFRO ».
3. **Environments.** **À chaque espace, son confort.** MAISON « Un confort sur mesure pour votre
   quotidien. » (CTA « Explorer les solutions maison ») · BUREAUX « Des environnements pensés pour la
   performance. » · HÔTELLERIE « Une expérience de confort à la hauteur de vos invités. » ·
   RESTAURATION « Le bien-être de vos clients commence par l'ambiance. » Editorial large-photo layout
   (horizontal experience or alternating panels, not four cards), hover reveals, intuitive mobile.
4. **Technology.** **La technologie au service de votre bien-être.** Dark navy section: inverter,
   energy efficiency, intelligent regulation, quiet operation, filtration / connected control only
   where real products support it. Product photography, hotspots, animated airflow paths. No
   unverified claims.
5. **Featured products.** **Des équipements sélectionnés pour votre confort.** Premium cards: large
   image, manufacturer, model, key specs, BTU, price in Dhs, availability, few badges, actions
   « Découvrir » + « Comparer ». Collections: Climatisation, Chauffe-eau, Ventilation, Solutions
   professionnelles. Real catalogue data only.
6. **ARFRO Care.** **Votre confort mérite un accompagnement durable.** Pillars Installation /
   Entretien / Assistance — only real services (see decisions). Technician photo slot. CTA
   « Découvrir nos services ».
7. **Climate advisor.** **Le bon climatiseur. Pour le bon espace.** Steps: pièce (Chambre, Salon,
   Bureau, Commerce, Autre) → superficie (slider/input) → ville (Moroccan cities) → détails (hauteur
   sous plafond, exposition, isolation, occupants, sources de chaleur) → solution: estimated BTU,
   explanation, recommended categories, three real products, levels Essentiel / Confort / Premium.
   Transparent rules, no engineering-accuracy claims, offer a professional assessment.
8. **Real projects.** **Le confort prend vie.** Only real verified projects: built hidden.
9. **ARFRO Business.** **La performance climatique au service de vos projets.** Consultation,
   equipment selection, technical support, professional quotations, larger installations. CTAs
   « Parler à un expert », « Demander un devis ».
10. **Partner brands.** **Des marques reconnues. Une expertise de confiance.** Official logos only.
11. **Trust.** **Votre confiance fait notre différence.** Real information only (delivery,
    payment, installation commitments, support availability); no invented ratings or counts.
12. **Journal.** **Mieux comprendre le confort.** Magazine layout of real articles. CTA « Explorer
    nos conseils ». Hidden when there are no published articles for Arfro.
13. **Final statement.** **Le confort commence ici.** « Avec ARFRO, chaque espace devient un lieu
    où il fait bon vivre. » CTAs « Découvrir nos solutions », « Contacter ARFRO ».

## Navigation

Main: Climatisation, Chauffe-eau, Ventilation, Accessoires, Solutions professionnelles, Services,
Conseils. Utility: Particuliers / Professionnels, Suivi de commande, Demander un devis, Contact,
compte, recherche, panier. Mega menus: subcategories, product images, featured collections, buying
guides, quick access to help. Usability first.

## Later rounds

Product detail pages (hero, advantages, technology, specs, documents, services, comparison,
related, buying guidance, structured data), category pages, professional journey (catalogue,
specs, quotations, consultation, documentation; pro prices never public), mobile-first polish,
Core Web Vitals, accessibility, SEO preservation (URLs, canonicals, structured data, sitemap).
