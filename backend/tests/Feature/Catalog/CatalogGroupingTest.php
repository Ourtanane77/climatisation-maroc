<?php

use App\Support\Catalog\CatalogGrouper;
use App\Support\Catalog\CatalogImporter;

/*
| Grouping of data/catalog.json into families, as reviewed with the client
| (docs/catalog-grouping.md).
*/

beforeEach(function () {
    $this->rows = CatalogImporter::make()->load()['products'];
    $this->families = collect((new CatalogGrouper(config('catalog')))->group($this->rows))->keyBy('name');
});

it('groups the 106 rows into 62 families, 17 of them with variants', function () {
    expect(count($this->rows))->toBe(106)
        ->and($this->families)->toHaveCount(62)
        ->and($this->families->filter(fn ($f) => count($f['rows']) > 1))->toHaveCount(17);
});

it('orders power variants and keeps references', function () {
    $lg = $this->families['LG Dual Inverter'];

    expect(array_column($lg['rows'], 'sku'))->toBe(['D10AWH.NW0', 'D13AJH.N', 'D19AKH.NK0', 'D24AKH-N'])
        ->and($lg['labels'])->toBe(["9\u{00A0}000 BTU", "12\u{00A0}000 BTU", "18\u{00A0}000 BTU", "24\u{00A0}000 BTU"])
        ->and($lg['category_path'])->toBe('climatisation/mural');
});

it('treats colour as a variant attribute for air conditioners only', function () {
    $fitco = $this->families['Fitco Mural Inverter'];

    expect($fitco['rows'])->toHaveCount(8)
        ->and($fitco['labels'][0])->toBe("9\u{00A0}000 BTU · Blanc")
        ->and($fitco['labels'][1])->toBe("9\u{00A0}000 BTU · Noir")
        ->and($this->families)->toHaveKey('Carrier Miroir Inverter Noir R32')   // black by name
        ->and($this->families)->toHaveKey('Scotch Noir GT')                    // accessory: colour stays in the name
        ->and($this->families)->toHaveKey('Support Megalife Blanc GT');
});

it('groups capacities and diameters only for the listed families', function () {
    expect($this->families['Chauffe-eau Solaire Simsek Circuit Fermé']['labels'])->toBe(['200 L', '300 L', '500 L'])
        ->and($this->families['Ventilateur de Gaine Nanyo Galvanisé']['labels'])->toBe(['Ø 100', 'Ø 125', 'Ø 160', 'Ø 200', 'Ø 315'])
        ->and($this->families['Flexible Souple Esbo 10 m']['rows'])->toHaveCount(4)
        // Accessories by size stay separate products (client decision 4).
        ->and($this->families)->toHaveKeys(['Bande Perforée 10 m', 'Bande Perforée 25 m', 'Colle PVC 1 kg', 'Colle PVC 125 ml']);
});

it('places products in the new sub-categories by name', function () {
    expect($this->families['Multizone']['category_path'])->toBe('ventilation/multizone')
        ->and($this->families['Flexible Calorifugé Q160 Arfro 10 m']['category_path'])->toBe('gaines/flexibles-isoles')
        ->and($this->families['Télécommande LG Split']['category_path'])->toBe('pieces-de-rechange/telecommandes')
        ->and($this->families['Trappe de Visite Modèle 60X60']['category_path'])->toBe('pieces-de-rechange/trappes-de-visite')
        ->and($this->families['Pompe à Vide Value 115']['category_path'])->toBe('pieces-de-rechange/outillage')
        ->and($this->families['Filtre Eau 7 Étapes Vivo Pompe Inox']['category_path'])->toBe('pieces-de-rechange');
});
