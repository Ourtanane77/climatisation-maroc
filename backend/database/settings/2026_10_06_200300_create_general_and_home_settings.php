<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Initial settings, taken from the design files (phones, stores, hours, promo bar, visit price)
 * and from the current site (social links). Home product lists are filled by the seeders.
 */
return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.phones', [
            ['label' => 'Ventes', 'display' => '0666-854184'],
            ['label' => 'Conseil', 'display' => '0666-088348'],
            ['label' => 'Projets et revendeurs', 'display' => '0666-602599'],
            ['label' => 'Fixe', 'display' => '0524-306850'],
            ['label' => 'Service facturation', 'display' => '0666-661882'],
        ]);
        $this->migrator->add('general.email', 'ecom@arihafroid.com');
        $this->migrator->add('general.whatsapp_number', '212666854184');
        $this->migrator->add('general.sales_phone', '0666-854184');
        $this->migrator->add('general.stores', [
            ['name' => 'Magasin Sakar', 'address' => 'Lot Sakar Villa 107, Marrakech 40070'],
            ['name' => 'Magasin Al Manar', 'address' => 'Magasin 60-2, Imm 50 Al Manar, Marrakech 40100'],
        ]);
        $this->migrator->add('general.hours', 'Lundi – Samedi, 9h – 19h');
        $this->migrator->add('general.socials', [
            'facebook' => 'https://web.facebook.com/maroc.climatisation',
            'instagram' => 'https://www.instagram.com/arihafroid_climatisation/',
            'tiktok' => 'https://www.tiktok.com/@arihafroid_climatisation',
        ]);
        $this->migrator->add('general.promo_bar_text', "Super promo : jusqu'à -30 % sur les climatiseurs");
        $this->migrator->add('general.promo_bar_link_label', 'Voir les promotions');
        $this->migrator->add('general.promo_bar_link_url', '/promotions');
        $this->migrator->add('general.technical_visit_price', 30000);
        $this->migrator->add('general.about_footer', 'Climatisation Maroc est un site e-commerce spécialisé dans la vente des systèmes de climatisation, avec livraison gratuite sur tout le Maroc. Le site est une propriété de la société Ariha Froid, fournisseur de climatisation et de froid à Marrakech depuis 2008, pour les professionnels comme les particuliers.');

        $this->migrator->add('home.hero_title', "Jusqu'à -30 % sur toute la gamme de climatiseurs");
        $this->migrator->add('home.hero_subtitle', 'Le confort au cœur de votre quotidien');
        $this->migrator->add('home.hero_image', null);
        $this->migrator->add('home.hero_cta_label', 'Voir les promotions');
        $this->migrator->add('home.hero_cta_url', '/promotions');
        $this->migrator->add('home.new_product_ids', []);
        $this->migrator->add('home.promo_product_ids', []);
        $this->migrator->add('home.ducts_product_ids', []);
        $this->migrator->add('home.supplies_product_ids', []);
        $this->migrator->add('home.brand_ids', []);
        $this->migrator->add('home.mega_featured', []);
    }
};
