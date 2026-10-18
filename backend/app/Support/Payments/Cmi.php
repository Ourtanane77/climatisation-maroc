<?php

namespace App\Support\Payments;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Settings\PaymentSettings;
use App\Support\Commerce\OrderPlacer;
use App\Support\Sites\Sites;
use App\Support\Sites\SiteSettings;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * CMI e-commerce gateway (Centre Monétique Interbancaire), « 3D Pay Hosting »: the customer's
 * browser posts a signed form to CMI, pays on CMI's page, CMI calls our callback server to server,
 * then sends the browser back to okUrl / failUrl.
 *
 * Security:
 * - every message is signed with the store key (hash « ver3 »: SHA-512 over the sorted values),
 *   checked with hash_equals; the key never leaves the server;
 * - only the callback marks an order paid, after checking the hash, the order, the amount and the
 *   currency; it answers ACTION=POSTAUTH (capture) only then; the browser return never pays;
 * - the amount is the order total computed on the server when the order was placed.
 */
final class Cmi
{
    public const GATEWAYS = [
        'production' => 'https://payment.cmi.co.ma/fim/est3Dgate',
        'test' => 'https://testpayment.cmi.co.ma/fim/est3Dgate',
    ];

    /** ISO 4217 numeric code of the dirham. */
    public const CURRENCY = '504';

    /** Callback answers CMI expects. */
    public const CAPTURE = 'ACTION=POSTAUTH';

    public const ACKNOWLEDGED = 'APPROVED';

    public const FAILURE = 'FAILURE';

    /** Fields of a CMI message kept in order_payments. */
    private const RECORDED = [
        'oid', 'ProcReturnCode', 'Response', 'TransId', 'AuthCode', 'HostRefNum', 'amount', 'currency',
        'MaskedPan', 'mdStatus', 'ErrMsg', 'EXTRA.TRXDATE', 'EXTRA_TRXDATE',
    ];

    /** Card payment offered on a site (default: the current one): enabled and fully configured. */
    public static function available(?string $site = null): bool
    {
        $settings = self::settings($site);

        return $settings->cmi_enabled && trim($settings->cmi_client_id) !== '' && filled($settings->cmi_store_key);
    }

    public static function settings(?string $site = null): PaymentSettings
    {
        return SiteSettings::for(PaymentSettings::class, $site);
    }

    /** The order can be paid now: card order, not paid yet, not cancelled, gateway available. */
    public static function payable(Order $order): bool
    {
        return $order->payment_method === PaymentMethod::Carte
            && $order->payment_status !== PaymentStatus::Payee
            && $order->status !== OrderStatus::Annulee
            && self::available($order->site);
    }

    /**
     * The form the browser posts to CMI.
     *
     * @return array{url: string, fields: array<string, string>}
     */
    public static function form(Order $order): array
    {
        $settings = self::settings($order->site);
        $site = Sites::get($order->site);
        $api = $site->url.'/api/v1/payments/cmi';

        $fields = [
            'clientid' => trim($settings->cmi_client_id),
            'storetype' => '3D_PAY_HOSTING',
            'hashAlgorithm' => 'ver3',
            'TranType' => 'PreAuth',
            'currency' => self::CURRENCY,
            'amount' => self::amount((int) $order->total),
            'oid' => $order->reference,
            'okUrl' => $api.'/retour',
            'failUrl' => $api.'/retour',
            'callbackUrl' => $api.'/callback',
            'shopurl' => $site->url.'/panier',
            'lang' => 'fr',
            'rnd' => Str::random(20),
            'encoding' => 'UTF-8',
            'refreshtime' => '5',
            'AutoRedirect' => 'true',
            'CallbackResponse' => 'true',
            'BillToName' => self::clean($order->customer_name, 60),
            'BillToStreet1' => self::clean($order->address, 120),
            'BillToCity' => self::clean((string) $order->city_name, 60),
            'BillToCountry' => '504',
            'email' => self::clean((string) $order->email, 120),
            'tel' => self::clean((string) $order->phone, 20),
        ];
        $fields['HASH'] = self::hash($fields, (string) $settings->cmi_store_key);

        return ['url' => self::GATEWAYS[$settings->cmi_mode] ?? self::GATEWAYS['production'], 'fields' => $fields];
    }

    /**
     * Hash « ver3 » (CMI integration kit): parameter names sorted case-insensitively, HASH and
     * encoding left out, each value trimmed with « \ » and « | » escaped, joined with « | », then
     * the escaped store key; SHA-512, base64 of the binary digest.
     *
     * @param  array<string, mixed>  $params
     */
    public static function hash(array $params, string $storeKey): string
    {
        $keys = array_map('strval', array_keys($params));
        natcasesort($keys);

        $plain = '';
        foreach ($keys as $key) {
            if (in_array(strtolower($key), ['hash', 'encoding'], true)) {
                continue;
            }
            $value = is_scalar($params[$key]) ? (string) $params[$key] : '';
            $value = trim(html_entity_decode((string) preg_replace("/\n$/", '', $value), ENT_QUOTES, 'UTF-8'));
            $plain .= self::escape($value).'|';
        }

        return base64_encode(hash('sha512', $plain.self::escape($storeKey), true));
    }

    /** @param  array<string, mixed>  $params */
    public static function verify(array $params, string $storeKey): bool
    {
        $received = $params['HASH'] ?? $params['hash'] ?? null;

        return $storeKey !== '' && is_string($received) && $received !== '' && hash_equals(self::hash($params, $storeKey), $received);
    }

    /**
     * Server-to-server callback: records the message and answers CMI.
     *
     * @param  array<string, mixed>  $params
     */
    public static function handleCallback(array $params): string
    {
        $order = self::orderFor($params);
        if (! $order) {
            Log::warning('CMI callback: unknown order', ['oid' => $params['oid'] ?? null]);

            return self::FAILURE;
        }

        return Sites::runAs($order->site, function () use ($order, $params) {
            $valid = self::verify($params, (string) self::settings($order->site)->cmi_store_key);
            self::record($order, $params, $valid);

            if (! $valid) {
                Log::warning('CMI callback: invalid hash', ['order' => $order->reference]);

                return self::FAILURE;
            }

            if ((string) ($params['ProcReturnCode'] ?? '') !== '00') {
                self::markFailed($order);

                return self::ACKNOWLEDGED;
            }

            $paid = false;
            $answer = DB::transaction(function () use ($order, $params, &$paid) {
                /** @var Order $locked */
                $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
                $transaction = Str::limit((string) ($params['TransId'] ?? ''), 64, '');
                $amountMatches = self::centimes($params['amount'] ?? null) === (int) $locked->total;
                $currencyMatches = (string) ($params['currency'] ?? self::CURRENCY) === self::CURRENCY;

                if ($locked->payment_method !== PaymentMethod::Carte || $locked->status === OrderStatus::Annulee || ! $amountMatches || ! $currencyMatches) {
                    Log::warning('CMI callback: approved payment refused', [
                        'order' => $locked->reference,
                        'amount' => $params['amount'] ?? null,
                        'currency' => $params['currency'] ?? null,
                        'status' => $locked->status->value,
                    ]);

                    return self::FAILURE;
                }
                if ($locked->payment_status === PaymentStatus::Payee) {
                    // Same transaction notified again: capture again (idempotent). Another one: never charge twice.
                    return (string) $locked->payment_transaction_id === $transaction ? self::CAPTURE : self::FAILURE;
                }

                $locked->update([
                    'payment_status' => PaymentStatus::Payee,
                    'paid_at' => now(),
                    'payment_transaction_id' => $transaction !== '' ? $transaction : null,
                ]);
                $paid = true;

                return self::CAPTURE;
            });

            // The order e-mails of a card order leave once it is paid (OrderPlacer). A mail failure
            // must never cost the capture: the order is paid, CMI still gets ACTION=POSTAUTH.
            if ($paid) {
                try {
                    app(OrderPlacer::class)->notify($order->fresh() ?? $order);
                } catch (Throwable $e) {
                    report($e);
                }
            }

            return $answer;
        });
    }

    /**
     * Browser return from CMI (okUrl / failUrl): where to send the customer. The access token is
     * only given back once the hash proves the message comes from CMI. A verified decline marks
     * the payment failed; only the callback marks it paid.
     *
     * @param  array<string, mixed>  $params
     */
    public static function returnUrl(array $params): string
    {
        $order = self::orderFor($params);
        if (! $order) {
            return Sites::get()->url.'/suivi-commande';
        }
        $site = Sites::get($order->site);
        if (! self::verify($params, (string) self::settings($order->site)->cmi_store_key)) {
            return $site->url.'/suivi-commande?ref='.rawurlencode($order->reference);
        }

        $approved = (string) ($params['ProcReturnCode'] ?? '') === '00';
        if (! $approved) {
            self::markFailed($order);
        }

        return $site->url.'/commande/confirmation?'.http_build_query([
            'ref' => $order->reference,
            't' => $order->access_token,
            'paiement' => $approved ? 'ok' : 'echec',
        ]);
    }

    /** "5700.00" for 570000 centimes. */
    public static function amount(int $centimes): string
    {
        return number_format($centimes / 100, 2, '.', '');
    }

    private static function centimes(mixed $amount): ?int
    {
        $amount = str_replace(',', '.', trim(is_scalar($amount) ? (string) $amount : ''));

        return is_numeric($amount) ? (int) round(((float) $amount) * 100) : null;
    }

    /** @param  array<string, mixed>  $params */
    private static function orderFor(array $params): ?Order
    {
        $oid = strtoupper(trim(is_scalar($params['oid'] ?? null) ? (string) $params['oid'] : ''));

        return preg_match('/^[A-Z]{2,5}-\d{4}-\d{5}$/', $oid) ? Order::query()->where('reference', $oid)->first() : null;
    }

    private static function markFailed(Order $order): void
    {
        Order::query()->whereKey($order->id)
            ->where('payment_method', PaymentMethod::Carte->value)
            ->where('payment_status', PaymentStatus::EnAttente->value)
            ->update(['payment_status' => PaymentStatus::Echouee->value]);
    }

    /**
     * Audit row. Only the fields of RECORDED are kept (no customer data, no 3-D Secure data), and
     * nothing but the order id when the signature is wrong (anyone can post to the callback).
     * Recording never stops the answer to CMI.
     *
     * @param  array<string, mixed>  $params
     */
    private static function record(Order $order, array $params, bool $valid): void
    {
        $text = function (string $key, int $max) use ($params): ?string {
            $value = is_scalar($params[$key] ?? null) ? (string) $params[$key] : '';
            $value = mb_scrub($value, 'UTF-8');

            return Str::limit($value, $max, '') ?: null;
        };

        try {
            $payload = [];
            foreach ($valid ? self::RECORDED : ['oid'] as $key) {
                if (($value = $text($key, 255)) !== null) {
                    $payload[$key] = $value;
                }
            }

            $order->payments()->create([
                'provider' => 'cmi',
                'proc_return_code' => $valid ? $text('ProcReturnCode', 8) : null,
                'response' => $valid ? $text('Response', 32) : null,
                'transaction_id' => $valid ? $text('TransId', 64) : null,
                'amount' => $valid ? self::centimes($params['amount'] ?? null) : null,
                'valid_hash' => $valid,
                'payload' => $payload,
            ]);
        } catch (Throwable $e) {
            report($e);
        }
    }

    /**
     * Raw form parameters of a request from CMI, exactly as sent: Laravel's input is trimmed
     * (Unicode spaces too), emptied to null and has dots in names replaced, which would break the
     * hash of an otherwise genuine message.
     *
     * @return array<string, string>
     */
    public static function rawParams(string $body): array
    {
        $params = [];
        foreach (explode('&', $body) as $pair) {
            if ($pair === '') {
                continue;
            }
            [$key, $value] = array_pad(explode('=', $pair, 2), 2, '');
            $params[urldecode($key)] = urldecode($value);
        }

        return $params;
    }

    private static function escape(string $value): string
    {
        return str_replace('|', '\\|', str_replace('\\', '\\\\', $value));
    }

    /**
     * One line of plain text for the customer fields sent to CMI: control characters and Unicode
     * spaces become ASCII spaces, cut first and trimmed last, so no value starts or ends with a
     * character a trim could later remove.
     */
    private static function clean(string $value, int $max): string
    {
        $value = (string) preg_replace('/[\x00-\x1F\x7F\p{Z}\x{00AD}\x{200B}-\x{200D}\x{FEFF}]+/u', ' ', $value);

        return trim(Str::limit($value, $max, ''));
    }
}
