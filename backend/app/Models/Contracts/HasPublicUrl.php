<?php

namespace App\Models\Contracts;

/** A model with a public front-office page. */
interface HasPublicUrl
{
    /** Path on the public site, e.g. "/produit/lg-dual-inverter". */
    public function url(): string;
}
