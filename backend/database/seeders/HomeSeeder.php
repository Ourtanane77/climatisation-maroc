<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\ProductVariant;
use App\Settings\HomeSettings;
use App\Support\Sites\Sites;
use App\Support\Sites\SiteSettings;
use Illuminate\Database\Seeder;

/**
 * Home page sections, with the products the design shows (design/Accueil.dc.html). Every site gets
 * the same product lists (home, home_arfro…), so a fresh install's arfro.com home is not empty; the
 * owner then edits each site's home in the back office.
 */
class HomeSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Sites::keys() as $site) {
            $this->fill(SiteSettings::for(HomeSettings::class, $site));
        }
    }

    private function fill(HomeSettings $settings): void
    {
        // "Nouveaux produits": LG Gainable 36000/48000, chauffe-eau solaire Simsek 300/500 L.
        $settings->new_product_ids = $this->families(['ABNW36GM2S1.ENWBME', 'CHAUFF0061']);
        // "Promotions" rail: LG Dual, Fitco Mural Inverter, Carrier Mural Inverter R32, CIAT, Carrier Miroir, LG Artcool.
        $settings->promo_product_ids = $this->families(['D13AJH.N', 'FSW12T24PM/N', '42QHG009D8SC-R32', '38HG09VSA', '42QHG012D8S-BM', 'UA19MKH0.NJ0']);
        // "Gaines circulaires": the whole Gaines range is shown automatically (rigid ducts first);
        // this list only puts chosen families first.
        $settings->ducts_product_ids = [];
        // "Cuivre, gaz et pièces de rechange".
        $settings->supplies_product_ids = $this->families(['CUIV0005', 'CUIV0006', 'CUIV0018', 'GAZ00042', 'CLIM00076', 'CLIM00080']);
        // Brand marquee in the design order (independent of the listings' brand order).
        $marquee = ['lg', 'carrier', 'ciat', 'fitco', 'simsek', 'gs', 'lafarga', 'alpha', 'arfro'];
        $brandIds = Brand::query()->whereIn('slug', $marquee)->pluck('id', 'slug');
        $settings->brand_ids = collect($marquee)->map(fn (string $slug) => $brandIds[$slug] ?? null)->filter()->values()->all();
        // Mega menu featured product per range.
        $settings->mega_featured = array_filter([
            'climatisation' => $this->families(['D13AJH.N'])[0] ?? null,
            'chauffe-eau' => $this->families(['CHAUFF0061'])[0] ?? null,
            'ventilation' => $this->families(['VENT0160'])[0] ?? null,
            'gaines' => $this->families(['CLIM00319'])[0] ?? null,
            'cuivre-et-gaz' => $this->families(['CUIV0006'])[0] ?? null,
            'pieces-de-rechange' => $this->families(['CLIM00080'])[0] ?? null,
        ]);
        $settings->save();
    }

    /**
     * Distinct family ids of these SKUs, in order.
     *
     * @param  list<string>  $skus
     * @return list<int>
     */
    private function families(array $skus): array
    {
        $map = ProductVariant::query()->whereIn('sku', $skus)->pluck('product_id', 'sku');

        return array_values(array_unique(array_filter(array_map(fn ($s) => $map[$s] ?? null, $skus))));
    }
}
