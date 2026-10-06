<?php

namespace App\Filament\Resources\Redirects;

use App\Filament\Resources\Redirects\Pages\ManageRedirects;
use App\Models\Redirect;
use App\Models\User;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
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
            TextInput::make('from_path')->label('Ancienne adresse')->required()->placeholder('/home/devis')
                ->unique(ignoreRecord: true)->helperText('Chemin seul, sans le nom de domaine.'),
            TextInput::make('to_path')->label('Nouvelle adresse')->required()->placeholder('/demander-un-devis'),
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
