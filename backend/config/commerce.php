<?php

return [

    /*
    | Basket "Pour l'installation" suggestions when the basket's products have no accessories
    | of their own: the three references drawn in design/Panier.dc.html (SUGG). Missing or
    | unpublished references are skipped.
    */
    'default_suggestions' => ['CUIV0005', 'CUIV0006', 'CLIM00080'],

    'suggestion_count' => 3,

    // Minimum time (milliseconds, the `_t` unit of every form) between showing a form and posting it.
    'min_form_milliseconds' => 3000,

];
