<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Enums\OrderStatus;
use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

/**
 * Order detail with the status workflow: only the transitions allowed from the current status
 * are offered (Nouvelle → Confirmée → Expédiée → Livrée, or Annulée before delivery).
 *
 * @property Order $record
 */
class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        $labels = [
            OrderStatus::Confirmee->value => ['Confirmer', 'heroicon-o-check'],
            OrderStatus::Expediee->value => ['Marquer expédiée', 'heroicon-o-truck'],
            OrderStatus::Livree->value => ['Marquer livrée', 'heroicon-o-check-badge'],
            OrderStatus::Annulee->value => ['Annuler', 'heroicon-o-x-circle'],
        ];

        $transitions = array_map(function (OrderStatus $status) use ($labels) {
            [$label, $icon] = $labels[$status->value];

            return Action::make('to_'.$status->value)
                ->label($label)
                ->icon($icon)
                ->color($status->getColor())
                ->requiresConfirmation()
                ->modalHeading("{$label} la commande {$this->record->reference} ?")
                ->schema([Textarea::make('note')->label('Note (facultatif)')->rows(2)])
                ->action(function (array $data) use ($status) {
                    $this->record->transitionTo($status, auth()->user(), $data['note'] ?? null);
                    Notification::make()->title('Statut mis à jour : '.$status->getLabel())->success()->send();
                    $this->refreshFormData(['status']);
                });
        }, $this->record->status->next());

        return [
            ...$transitions,
            ActionGroup::make([
                Action::make('note')->label('Note interne')->icon('heroicon-o-pencil-square')
                    ->fillForm(fn () => ['internal_note' => $this->record->internal_note])
                    ->schema([Textarea::make('internal_note')->label('Note interne')->rows(4)])
                    ->action(fn (array $data) => $this->record->update(['internal_note' => $data['internal_note']])),
                Action::make('print')->label('Imprimer le bon de commande')->icon('heroicon-o-printer')
                    ->url(fn () => route('admin.orders.print', $this->record))->openUrlInNewTab(),
            ]),
        ];
    }
}
