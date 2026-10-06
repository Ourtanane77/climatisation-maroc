<?php

namespace App\Filament\Resources\Leads;

use App\Enums\LeadStatus;
use App\Filament\Resources\Leads\Pages\ListLeads;
use App\Filament\Resources\Leads\Pages\ViewLead;
use App\Models\Lead;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\KeyValueEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;
use UnitEnum;

class LeadResource extends Resource
{
    protected static ?string $model = Lead::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedInboxArrowDown;

    protected static string|UnitEnum|null $navigationGroup = 'Ventes';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Demandes';

    protected static ?string $modelLabel = 'demande';

    protected static ?string $pluralModelLabel = 'demandes';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        $count = Lead::query()->where('status', LeadStatus::Nouveau)->count();

        return $count ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(3)->columnSpanFull()->schema([
                Section::make('Demande')->schema([
                    TextEntry::make('type')->label('Type')->badge(),
                    TextEntry::make('status')->label('Statut')->badge(),
                    TextEntry::make('created_at')->label('Reçue le')->dateTime('d/m/Y à H:i'),
                    TextEntry::make('source_url')->label('Page d’origine')->placeholder('—'),
                ]),
                Section::make('Contact')->schema([
                    TextEntry::make('name')->label('Nom')->placeholder('—'),
                    TextEntry::make('company')->label('Société')->placeholder('—'),
                    TextEntry::make('phone')->label('Téléphone')->url(fn (Lead $record) => $record->phone ? 'tel:'.$record->phone : null)->placeholder('—'),
                    TextEntry::make('email')->label('E-mail')->placeholder('—'),
                    TextEntry::make('city_name')->label('Ville')->placeholder('—'),
                    TextEntry::make('customer_kind')->label('Profil')->placeholder('—'),
                ]),
                Section::make('Projet')->schema([
                    TextEntry::make('subject')->label('Sujet')->placeholder('—'),
                    TextEntry::make('project_type')->label('Type de projet')->placeholder('—'),
                    TextEntry::make('space_type')->label('Type d’espace')->placeholder('—'),
                    TextEntry::make('surface')->label('Surface')->suffix(' m²')->placeholder('—'),
                    TextEntry::make('variant.sku')->label('Produit (alerte stock)')->placeholder('—'),
                ]),
            ]),
            Section::make('Message')->columnSpanFull()->schema([
                TextEntry::make('message')->hiddenLabel()->placeholder('Aucun message.'),
                TextEntry::make('attachment_path')->label('Pièce jointe')
                    ->formatStateUsing(fn ($state) => $state ? basename($state) : null)
                    ->url(fn (Lead $record) => $record->attachment_path ? route('admin.leads.attachment', $record) : null, true)
                    ->placeholder('Aucune'),
                KeyValueEntry::make('payload')->label('Autres champs')->visible(fn (Lead $record) => ! empty($record->payload)),
            ]),
            Section::make('Note interne')->columnSpanFull()->schema([
                TextEntry::make('internal_note')->hiddenLabel()->placeholder('Aucune note.'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Reçue le')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('type')->label('Type')->badge(),
                TextColumn::make('name')->label('Nom')->searchable()->description(fn (Lead $record) => $record->company),
                TextColumn::make('phone')->label('Téléphone')->searchable(),
                TextColumn::make('city_name')->label('Ville'),
                TextColumn::make('message')->label('Message')->limit(60)->toggleable(),
                TextColumn::make('status')->label('Statut')->badge(),
            ])
            ->filters([
                SelectFilter::make('status')->label('Statut')->options(LeadStatus::class),
            ])
            ->recordActions([
                ViewAction::make(),
                Action::make('done')->label('Traité')->icon('heroicon-o-check')->color('success')
                    ->visible(fn (Lead $record) => $record->status === LeadStatus::Nouveau)
                    ->action(fn (Lead $record) => $record->update(['status' => LeadStatus::Traite])),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('done')->label('Marquer traitées')->icon('heroicon-o-check')
                        ->action(fn (Collection $records) => Lead::query()->whereKey($records->modelKeys())->update(['status' => LeadStatus::Traite]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('archive')->label('Archiver')->icon('heroicon-o-archive-box')
                        ->action(fn (Collection $records) => Lead::query()->whereKey($records->modelKeys())->update(['status' => LeadStatus::Archive]))
                        ->deselectRecordsAfterCompletion(),
                ]),
            ]);
    }

    /** @return array<string, int> new leads per type, for the tab badges */
    public static function newCounts(): array
    {
        return Lead::query()->where('status', LeadStatus::Nouveau)
            ->selectRaw('type, count(*) as n')->groupBy('type')->pluck('n', 'type')->all();
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLeads::route('/'),
            'view' => ViewLead::route('/{record}'),
        ];
    }
}
