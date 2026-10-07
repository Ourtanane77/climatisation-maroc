<?php

use App\Support\Text\FrenchTypography;

const NB = "\u{00A0}";
const NNB = "\u{202F}";

it('puts no-break spaces where French typography needs them', function (string $in, string $out) {
    expect(FrenchTypography::apply($in))->toBe($out);
})->with([
    'colon' => ['Ventes : 0666-854184', 'Ventes'.NB.': 0666-854184'],
    'question mark' => ['Quelle puissance choisir ?', 'Quelle puissance choisir'.NNB.'?'],
    'exclamation' => ['Merci !', 'Merci'.NNB.'!'],
    'percent' => ['jusqu’à 70 % d’économie', 'jusqu’à 70'.NNB.'% d’économie'],
    'guillemets' => ['« Pour l’installation »', '«'.NB.'Pour l’installation'.NB.'»'],
    'thousands and unit' => ['9 000 BTU', '9'.NB.'000'.NB.'BTU'],
    'unit' => ['Couronne de 15 m', 'Couronne de 15'.NB.'m'],
    'decimal unit' => ['Gaz R410A 11,3 kg', 'Gaz R410A 11,3'.NB.'kg'],
    'square metres' => ['jusqu’à 20 m²', 'jusqu’à 20'.NB.'m²'],
    'apostrophe' => ["l'appel de confirmation", 'l’appel de confirmation'],
]);

it('leaves codes, links, times and phone numbers alone', function (string $text) {
    expect(FrenchTypography::apply($text))->toBe($text);
})->with([
    'url' => ['https://climatisationmaroc.com/produit/x?v=D13AJH.N'],
    'sku' => ['FSW09T24PM/N'],
    'time' => ['Lundi – Samedi, 9h – 19h'],
    'phone by pairs' => ['06 12 34 56 78'],
    'phone dashed' => ['0666-854184'],
    'word starting like a unit' => ['24 mois de garantie'],
]);
