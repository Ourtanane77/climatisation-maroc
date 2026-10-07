<?php

namespace App\Filament\Resources\Users;

use App\Filament\Resources\Users\Pages\ManageUsers;
use App\Models\User;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

/** Back-office users and roles (admin, gestionnaire). Resellers are managed in "Revendeurs". Admins only. */
class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    protected static string|UnitEnum|null $navigationGroup = 'Configuration';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Utilisateurs';

    protected static ?string $modelLabel = 'utilisateur';

    protected static ?string $pluralModelLabel = 'utilisateurs';

    /** @var array<string, string> */
    public const ROLES = [User::ROLE_ADMIN => 'Administrateur', User::ROLE_MANAGER => 'Gestionnaire', User::ROLE_RESELLER => 'Revendeur'];

    public static function canAccess(): bool
    {
        return (bool) auth()->user()?->hasRole(User::ROLE_ADMIN);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->columns(2)->components([
            TextInput::make('name')->label('Nom')->required()->maxLength(255),
            TextInput::make('email')->label('E-mail')->email()->required()->unique(ignoreRecord: true),
            TextInput::make('phone')->label('Téléphone')->tel()->unique(ignoreRecord: true),
            Select::make('roles')->label('Rôle')->relationship('roles', 'name')
                ->getOptionLabelFromRecordUsing(fn ($record) => self::ROLES[$record->name] ?? $record->name)
                ->multiple()->preload()->required(),
            TextInput::make('password')->label('Mot de passe')->password()->revealable()
                ->minLength(12) // staff accounts reach the whole back office
                ->required(fn (string $operation) => $operation === 'create')
                ->dehydrated(fn (?string $state) => filled($state))
                ->helperText('Laisser vide pour ne pas le changer.'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('Nom')->searchable()->weight('bold'),
                TextColumn::make('email')->label('E-mail')->searchable(),
                TextColumn::make('roles.name')->label('Rôle')->badge()->formatStateUsing(fn (string $state) => self::ROLES[$state] ?? $state),
                TextColumn::make('created_at')->label('Créé le')->date('d/m/Y'),
            ])
            ->filters([
                SelectFilter::make('role')->label('Rôle')->options(self::ROLES)
                    ->query(fn (Builder $query, array $data) => $data['value'] ? $query->whereHas('roles', fn (Builder $r) => $r->where('name', $data['value'])) : $query),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make()->hidden(fn (User $record) => $record->is(auth()->user())),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageUsers::route('/')];
    }
}
