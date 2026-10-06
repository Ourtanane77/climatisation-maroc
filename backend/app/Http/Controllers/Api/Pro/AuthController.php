<?php

namespace App\Http\Controllers\Api\Pro;

use App\Http\Controllers\Controller;
use App\Mail\ResellerPasswordReset;
use App\Models\User;
use App\Rules\MoroccanPhone;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Reseller login for the pro space (Connexion). The Next.js server keeps the Sanctum token in an
 * httpOnly cookie and forwards it; only validated resellers can log in.
 */
class AuthController extends Controller
{
    public const TOKEN_DAYS = 30;

    private const BAD_CREDENTIALS = 'Identifiants incorrects. Vérifiez votre e-mail ou téléphone et votre mot de passe.';

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'login' => ['required', 'string', 'max:160'],
            'password' => ['required', 'string', 'max:120'],
        ]);

        $user = self::findReseller($data['login']);
        if (! $user || ! Hash::check($data['password'], $user->password) || ! $user->isValidatedReseller()) {
            return response()->json(['message' => self::BAD_CREDENTIALS, 'errors' => ['login' => [self::BAD_CREDENTIALS]]], 422);
        }

        $token = $user->createToken('front-office', ['pro'], now()->addDays(self::TOKEN_DAYS));

        return response()->json([
            'token' => $token->plainTextToken,
            'expiresAt' => $token->accessToken->expires_at?->toIso8601String(),
            'user' => self::present($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json(['ok' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json(['user' => self::present($user)]);
    }

    /** "Recevoir le lien": always answers the same way, whether an account matches or not. */
    public function forgot(Request $request): JsonResponse
    {
        $data = $request->validate(['login' => ['required', 'string', 'max:160']]);

        $user = self::findReseller($data['login']);
        if ($user?->email && $user->resellerAccount) {
            $token = Password::broker()->createToken($user);
            Mail::to($user->email)->queue(new ResellerPasswordReset($user, $token));
        }

        return response()->json(['ok' => true]);
    }

    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'max:120'],
        ], [
            'password.required' => '8 caractères minimum.',
            'password.min' => '8 caractères minimum.',
        ]);

        $status = Password::broker()->reset(
            ['email' => mb_strtolower($data['email']), 'token' => $data['token'], 'password' => $data['password']],
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();
                $user->tokens()->delete();
                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            $message = 'Ce lien n’est plus valide. Demandez un nouveau lien.';

            return response()->json(['message' => $message, 'errors' => ['token' => [$message]]], 422);
        }

        return response()->json(['ok' => true]);
    }

    /** A reseller by e-mail or Moroccan phone number (login accepts both). */
    private static function findReseller(string $login): ?User
    {
        $login = trim($login);
        $query = User::query()->role(User::ROLE_RESELLER)->with('resellerAccount');

        if (str_contains($login, '@')) {
            return $query->where('email', mb_strtolower($login))->first();
        }

        $phone = MoroccanPhone::normalize($login);

        return $phone !== '' ? $query->where('phone', $phone)->first() : null;
    }

    /** @return array{name: string, company: string|null, email: string, phone: string|null} */
    public static function present(User $user): array
    {
        return [
            'name' => $user->name,
            'company' => $user->resellerAccount?->company,
            'email' => $user->email,
            'phone' => $user->phone,
        ];
    }
}
