<?php

namespace App\Http\Controllers\Api\Leads;

use App\Enums\LeadType;
use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Models\SectorPage;
use App\Rules\MoroccanPhone;
use App\Support\Leads\FormGuard;
use App\Support\Leads\LeadOptions;
use App\Support\Leads\LeadRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Public forms that become leads in the back office (Demandes): quote request, contact message,
 * sector quote, stock alert. Field rules follow the design forms; messages are in French.
 */
class LeadController extends Controller
{
    public function __construct(private LeadRecorder $recorder) {}

    /** Demander un devis (multipart: optional plan or photo, image or PDF, 10 MB max). */
    public function quote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_kind' => ['required', Rule::in(LeadOptions::CUSTOMER_KINDS)],
            'name' => ['required', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:160'],
            'phone' => ['required', new MoroccanPhone],
            'email' => ['nullable', 'email', 'max:160'],
            'city' => ['nullable', 'string', 'exists:cities,name'],
            'surface' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'project_type' => ['nullable', Rule::in(LeadOptions::PROJECT_TYPES)],
            'space_type' => ['nullable', Rule::in(LeadOptions::SPACE_TYPES)],
            'message' => ['nullable', 'string', 'max:5000'],
            'attachment' => ['nullable', 'file', 'max:10240', 'mimes:jpg,jpeg,png,webp,gif,heic,pdf'],
        ], [
            'name.required' => 'Indiquez votre nom.',
            'attachment.max' => 'Le fichier dépasse 10 Mo.',
            'attachment.mimes' => 'Joignez une image ou un PDF.',
        ]);

        if (FormGuard::isSpam($request)) {
            return self::ok();
        }

        $path = $request->file('attachment')?->store('leads/'.now()->format('Y/m'), 'local');

        $this->recorder->record(LeadType::Devis, [
            'customer_kind' => $data['customer_kind'],
            'name' => $data['name'],
            'company' => $data['customer_kind'] === 'professionnel' ? ($data['company'] ?? null) : null,
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'city_name' => $data['city'] ?? null,
            'surface' => $data['surface'] ?? null,
            'project_type' => $data['project_type'] ?? null,
            'space_type' => $data['space_type'] ?? null,
            'message' => $data['message'] ?? null,
            'attachment_path' => $path ?: null,
        ], $request);

        return self::ok();
    }

    /** Contact page "Écrivez-nous". */
    public function contact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'phone' => ['required', new MoroccanPhone('Saisissez 10 chiffres, par exemple 06 12 34 56 78.')],
            'email' => ['nullable', 'email', 'max:160'],
            'subject' => ['nullable', Rule::in(LeadOptions::CONTACT_SUBJECTS)],
            'message' => ['nullable', 'string', 'max:5000'],
        ]);

        if (FormGuard::isSpam($request)) {
            return self::ok();
        }

        $this->recorder->record(LeadType::Contact, [
            'name' => $data['name'] ?? null,
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'] ?? null,
        ], $request);

        return self::ok();
    }

    /** Quote form of a sector page (e.g. /solutions/restaurants). */
    public function sector(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sector_slug' => ['required', 'string'],
            'name' => ['nullable', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:160'],
            'phone' => ['required', new MoroccanPhone('Saisissez 10 chiffres, par exemple 06 12 34 56 78.')],
            'email' => ['nullable', 'email', 'max:160'],
            'city' => ['nullable', 'string', 'exists:cities,name'],
            'surface' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'project_type' => ['nullable', Rule::in(LeadOptions::PROJECT_TYPES)],
            'message' => ['nullable', 'string', 'max:5000'],
        ]);

        $sector = SectorPage::query()->published()->where('slug', $data['sector_slug'])->first();
        if (! $sector) {
            return response()->json([
                'message' => 'Ce secteur est introuvable.',
                'errors' => ['sector_slug' => ['Ce secteur est introuvable.']],
            ], 422);
        }

        if (FormGuard::isSpam($request)) {
            return self::ok();
        }

        $this->recorder->record(LeadType::Secteur, [
            'customer_kind' => 'professionnel',
            'name' => $data['name'] ?? null,
            'company' => $data['company'] ?? null,
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'city_name' => $data['city'] ?? null,
            'surface' => $data['surface'] ?? null,
            'project_type' => $data['project_type'] ?? null,
            'message' => $data['message'] ?? null,
        ], $request, $sector);

        return self::ok();
    }

    /** "Me prévenir" on an out-of-stock product. */
    public function stockAlert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sku' => ['required', 'string', 'exists:product_variants,sku'],
            'phone' => ['required', new MoroccanPhone('Saisissez 10 chiffres, par exemple 06 12 34 56 78.')],
        ], [
            'sku.exists' => 'Ce produit est introuvable.',
        ]);

        if (FormGuard::isSpam($request)) {
            return self::ok();
        }

        $variant = ProductVariant::query()->with('product')->where('sku', $data['sku'])->firstOrFail();

        $this->recorder->record(LeadType::AlerteStock, [
            'phone' => $data['phone'],
            'product_variant_id' => $variant->id,
            'subject' => $variant->displayName().' ('.$variant->sku.')',
        ], $request, $variant->product);

        return self::ok();
    }

    private static function ok(): JsonResponse
    {
        return response()->json(['ok' => true]);
    }
}
