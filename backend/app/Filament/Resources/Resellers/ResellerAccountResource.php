<?php

namespace App\Filament\Resources\Resellers;

use App\Enums\ResellerStatus;
use App\Filament\Resources\Resellers\Pages\EditResellerAccount;
use App\Filament\Resources\Resellers\Pages\ListResellerAccounts;
use App\Mail\ResellerRefused;
use App\Mail\ResellerValidated;
use App\Models\ResellerAccount;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Mail;
use UnitEnum;

class ResellerAccountResource extends Resource
{
    protected static ?string $model = ResellerAccount::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingStorefront;

    protected static string|UnitEnum|null $navigationGroup = 'Ventes';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Revendeurs';

    protected static ?string $modelLabel = 'compte revendeur';

    protected static ?string $pluralModelLabel = 'comptes revendeurs';

    protected static ?string $recordTitleAttribute = 'company';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        $count = ResellerAccount::query()->where('status', ResellerStatus::EnAttente)->count();

        return $count ? (string) $count : null;
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Demandes à valider';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Société')->columnSpanFull()->columns(2)->schema([
                TextInput::make('company')->label('Société')->required(),
                TextInput::make('ice')->label('ICE')->required()->length(15)->rule('digits:15'),
                Select::make('city_id')->label('Ville')->relationship('city', 'name')->searchable()->preload(),
                Select::make('activity')->label('Activité')->options(ResellerAccount::ACTIVITIES)->required(),
                TextInput::make('contact_name')->label('Contact'),
                TextInput::make('phone')->label('Téléphone')->tel()->required(),
                Textarea::make('message')->label('Message')->rows(3)->columnSpanFull()->disabled(),
            ]),
            Section::make('Décision')->columnSpanFull()->schema([
                Grid::make(3)->schema([
                    Select::make('status')->label('Statut')->options(ResellerStatus::class)->disabled()->dehydrated(false),
                    TextInput::make('decided_at')->label('Décidé le')->disabled()->dehydrated(false),
                    TextInput::make('decidedBy.name')->label('Par')->disabled()->dehydrated(false),
                ]),
                Textarea::make('refusal_reason')->label('Motif du refus')->rows(2)->disabled(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(fn ($query) => $query->with(['user', 'city']))
            ->columns([
                TextColumn::make('created_at')->label('Demande le')->date('d/m/Y')->sortable(),
                TextColumn::make('company')->label('Société')->searchable()->weight('bold')->description(fn (ResellerAccount $r) => 'ICE '.$r->ice),
                TextColumn::make('activity')->label('Activité')->formatStateUsing(fn (string $state) => ResellerAccount::ACTIVITIES[$state] ?? $state),
                TextColumn::make('city.name')->label('Ville'),
                TextColumn::make('contact_name')->label('Contact')->description(fn (ResellerAccount $r) => $r->phone),
                TextColumn::make('user.email')->label('E-mail')->searchable(),
                TextColumn::make('status')->label('Statut')->badge(),
            ])
            ->recordActions([
                self::validateAction(),
                self::refuseAction(),
                EditAction::make(),
            ]);
    }

    public static function validateAction(): Action
    {
        return Action::make('validate')
            ->label('Valider')
            ->icon('heroicon-o-check-circle')
            ->color('success')
            ->visible(fn (ResellerAccount $record) => $record->status !== ResellerStatus::Valide)
            ->requiresConfirmation()
            ->modalDescription('Le revendeur pourra se connecter et verra les tarifs revendeur. Il est prévenu par e-mail.')
            ->action(function (ResellerAccount $record) {
                $record->update(['status' => ResellerStatus::Valide, 'decided_at' => now(), 'decided_by' => auth()->id(), 'refusal_reason' => null]);
                if ($record->user->email) {
                    Mail::to($record->user->email)->queue(new ResellerValidated($record));
                }
                Notification::make()->title("Compte {$record->company} validé")->success()->send();
            });
    }

    public static function refuseAction(): Action
    {
        return Action::make('refuse')
            ->label('Refuser')
            ->icon('heroicon-o-x-circle')
            ->color('danger')
            ->visible(fn (ResellerAccount $record) => $record->status !== ResellerStatus::Refuse)
            ->schema([Textarea::make('reason')->label('Motif (communiqué au demandeur)')->rows(3)])
            ->action(function (ResellerAccount $record, array $data) {
                $record->update(['status' => ResellerStatus::Refuse, 'decided_at' => now(), 'decided_by' => auth()->id(), 'refusal_reason' => $data['reason'] ?? null]);
                $record->user->tokens()->delete();
                if ($record->user->email) {
                    Mail::to($record->user->email)->queue(new ResellerRefused($record));
                }
                Notification::make()->title("Compte {$record->company} refusé")->send();
            });
    }

    public static function getPages(): array
    {
        return [
            'index' => ListResellerAccounts::route('/'),
            'edit' => EditResellerAccount::route('/{record}/edit'),
        ];
    }
}
