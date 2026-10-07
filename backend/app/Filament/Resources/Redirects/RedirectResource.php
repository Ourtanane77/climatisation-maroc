<?php

namespace App\Filament\Resources\Redirects;

use App\Filament\Resources\Redirects\Pages\ManageRedirects;
use App\Models\Redirect;
use App\Models\User;
use BackedEnum;
use Closure;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

/** Old path → new path (301), checked by the front office before showing a 404. Admins only. */
class RedirectResource extends Resource
{
    protected static ?string $model = Redirect::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowUturnRight;

    protected static string|UnitEnum|null $navigationGroup = 'Configuration';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Redirections';

    protected static ?string $modelLabel = 'redirection';

    protected static ?string $pluralModelLabel = 'redirections';

    public static function canAccess(): bool
    {
        return (bool) auth()->user()?->hasRole(User::ROLE_ADMIN);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->columns(1)->components([
            // Stored normalised (Redirect::normalize): uniqueness is checked on that form, so
            // "/Ancienne-Page/" and "/ancienne-page" are the same address.
            TextInput::make('from_path')->label('Ancienne adresse')->required()->placeholder('/home/devis')
                ->helperText('Chemin seul, sans le nom de domaine.')
                ->rule(fn (?Redirect $record) => function (string $attribute, mixed $value, Closure $fail) use ($record): void {
                    $exists = Redirect::query()->where('from_path', Redirect::normalize((string) $value))
                        ->when($record, fn ($q) => $q->whereKeyNot($record->getKey()))->exists();
                    if ($exists) {
                        $fail('Une redirection existe déjà pour cette adresse.');
                    }
                }),
            TextInput::make('to_path')->label('Nouvelle adresse')->required()->placeholder('/demander-un-devis')
                ->rule('regex:#^(/|https?://)#')
                ->validationMessages(['regex' => 'Indiquez un chemin commençant par « / » ou une adresse complète (https://…).'])
                ->rule(fn (Get $get) => function (string $attribute, mixed $value, Closure $fail) use ($get): void {
                    if (Redirect::normalize((string) $value) === Redirect::normalize((string) $get('from_path'))) {
                        $fail('La nouvelle adresse doit être différente de l’ancienne.');
                    }
                }),
            Select::make('status_code')->label('Type')->options([301 => 'Définitive (301)', 302 => 'Temporaire (302)'])->default(301)->required(),
            TextInput::make('note')->label('Note'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('hits', 'desc')
            ->columns([
                TextColumn::make('from_path')->label('Ancienne adresse')->searchable()->copyable(),
                TextColumn::make('to_path')->label('Nouvelle adresse')->searchable(),
                TextColumn::make('status_code')->label('Code')->badge(),
                TextColumn::make('hits')->label('Utilisations')->sortable()->alignCenter(),
                TextColumn::make('last_hit_at')->label('Dernière utilisation')->since()->placeholder('—'),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()])
            ->toolbarActions([BulkActionGroup::make([DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageRedirects::route('/')];
    }
}
