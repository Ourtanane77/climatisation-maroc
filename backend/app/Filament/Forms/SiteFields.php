<?php

namespace App\Filament\Forms;

use App\Filament\Support\SiteScope;
use App\Models\Concerns\HasSites;
use App\Models\Contracts\HasPublicUrl;
use App\Support\Frontend\Revalidator;
use App\Support\Sites\Sites;
use Closure;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Livewire\Component;

/**
 * Back-office pieces for the two storefronts (config/sites.php): visibility per site, per-site
 * texts (site_content), per-site slugs, the site of orders and leads. Generic over the sites, so
 * a third storefront only needs its entry in config/sites.php.
 */
class SiteFields
{
    public const TEXT_HELP = 'Vide = texte principal repris. Réécrivez ce texte pour éviter le contenu dupliqué sur Google.';

    /** Hint on the main fields that have a per-site version. */
    public static function mainHint(): string
    {
        return 'texte principal ('.Sites::get()->name.')';
    }

    /** @return list<string> The sites with their own texts (all but the default one). */
    public static function otherSites(): array
    {
        return array_values(array_diff(Sites::keys(), [Sites::defaultKey()]));
    }

    // ---------------------------------------------------------------- visibility

    /**
     * « Visible sur »: the sites the record appears on. A user only toggles the sites they manage;
     * the other sites keep their value on save.
     *
     * @param  class-string<Model>  $model  a model using HasSites
     */
    public static function visibility(string $model): CheckboxList
    {
        return CheckboxList::make('sites')
            ->label('Visible sur')
            ->options(fn () => Sites::options())
            ->default(fn () => array_values(array_intersect(self::defaultSites($model), SiteScope::managed())))
            ->in(Sites::keys()) // disabled options keep their value: accept every site, mergeSites() guards
            ->disableOptionWhen(fn (string $value) => ! SiteScope::manages($value))
            ->columns(count(Sites::keys()))
            ->gridDirection('row')
            ->live()
            ->helperText('Aucune case cochée = masqué sur tous les sites.')
            ->dehydrateStateUsing(fn (?array $state, ?Model $record) => self::mergeSites($state, $record));
    }

    /**
     * Submitted sites limited to the managed ones, plus the record's other sites unchanged.
     *
     * @param  array<int, string>|null  $state
     * @return list<string>
     */
    public static function mergeSites(?array $state, ?Model $record): array
    {
        $managed = SiteScope::managed();
        /** @var array<int, string> $current */
        $current = $record?->getAttribute('sites') ?? [];
        $sites = [...array_diff($current, $managed), ...array_intersect($state ?? [], $managed)];

        return array_values(array_intersect(Sites::keys(), $sites));
    }

    /**
     * @param  class-string<Model>  $model
     * @return list<string>
     */
    private static function defaultSites(string $model): array
    {
        return method_exists($model, 'defaultSites') ? $model::defaultSites() : Sites::keys();
    }

    /**
     * Slug unique per site: no other record with this slug may share one of the selected sites.
     *
     * @param  class-string<Model>  $model
     */
    public static function uniqueSlugPerSite(string $model): Closure
    {
        return fn (Get $get, ?Model $record) => function (string $attribute, mixed $value, Closure $fail) use ($get, $record, $model) {
            $sites = self::mergeSites((array) ($get('sites') ?? []), $record);
            $other = self::slugOwner($model, (string) $value, $sites, $record);
            if ($other) {
                $shared = array_values(array_intersect($sites, $other->getAttribute('sites') ?? []));
                $fail(sprintf(
                    'Cette adresse est déjà utilisée sur %s par « %s ». Choisissez une autre adresse ou décochez ce site.',
                    implode(' et ', array_map(fn (string $s) => SiteScope::name($s), $shared)),
                    $other->getAttribute('title') ?? $other->getAttribute('name') ?? $other->getAttribute('slug'),
                ));
            }
        };
    }

    /**
     * Another record using this slug on one of the sites.
     *
     * @param  class-string<Model>  $model
     * @param  list<string>  $sites
     */
    public static function slugOwner(string $model, string $slug, array $sites, ?Model $ignore = null): ?Model
    {
        if ($sites === [] || $slug === '') {
            return null;
        }

        return $model::query()
            ->where('slug', $slug)
            ->when($ignore?->exists, fn (Builder $q) => $q->whereKeyNot($ignore->getKey()))
            ->where(function (Builder $q) use ($sites) {
                foreach ($sites as $site) {
                    $q->orWhereJsonContains('sites', $site);
                }
            })
            ->first();
    }

    // ---------------------------------------------------------------- per-site texts

    /**
     * Per-site text fields bound to site_content.<site>.<field>, plus the SEO overrides.
     * $fields: field => [label, type] with type text|textarea|rich (the main field's component).
     * A site the user does not manage is shown read-only and keeps its texts on save.
     *
     * @param  array<string, array{0: string, 1: string}>  $fields
     * @return list<Field>
     */
    public static function textFields(string $site, array $fields): array
    {
        $fields += [
            'seo_title' => ['Titre SEO (balise title)', 'text'],
            'seo_description' => ['Méta-description', 'textarea'],
            'seo_h1' => ['Titre principal (H1)', 'text'],
        ];
        $components = [];
        foreach ($fields as $field => [$label, $type]) {
            $path = "site_content.{$site}.{$field}";
            $component = match ($type) {
                'rich' => RichEditor::make($path),
                'textarea' => Textarea::make($path)->rows(3),
                default => TextInput::make($path)->maxLength($field === 'seo_title' ? 70 : 255),
            };
            if ($field === 'seo_description') {
                $component->maxLength(320);
            }
            $components[] = $component
                ->label($label)
                ->helperText(self::TEXT_HELP)
                ->columnSpanFull()
                ->disabled(fn () => ! SiteScope::manages($site))
                // Read-only for that user: keep the stored text whatever the browser sends.
                ->dehydrated()
                ->dehydrateStateUsing(fn (mixed $state, ?Model $record) => SiteScope::manages($site)
                    ? (is_string($state) && trim(strip_tags($state)) === '' ? null : $state)
                    : ($record?->getAttribute('site_content')[$site][$field] ?? null));
        }

        return $components;
    }

    public static function textsTitle(string $site): string
    {
        return 'Textes '.SiteScope::name($site).' (anti-duplication)';
    }

    public static function textsDescription(string $site): string
    {
        return SiteScope::manages($site)
            ? 'Textes propres à '.SiteScope::name($site).', pour ne pas publier la même chose que '.Sites::get()->name.'.'
            : 'Lecture seule : vous ne gérez pas '.SiteScope::name($site).'.';
    }

    /**
     * One tab per other site, for tabbed forms.
     *
     * @param  array<string, array{0: string, 1: string}>  $fields
     * @return list<Tab>
     */
    public static function textTabs(array $fields): array
    {
        return array_map(fn (string $site) => Tab::make('Textes '.SiteScope::name($site))
            ->icon('heroicon-o-language')
            ->schema([
                Section::make(self::textsTitle($site))->description(self::textsDescription($site))->schema(self::textFields($site, $fields)),
            ]), self::otherSites());
    }

    /**
     * One collapsible section per other site, for single-page forms.
     *
     * @param  array<string, array{0: string, 1: string}>  $fields
     * @return list<Section>
     */
    public static function textSections(array $fields): array
    {
        return array_map(fn (string $site) => Section::make(self::textsTitle($site))
            ->description(self::textsDescription($site))
            ->collapsible()
            ->collapsed()
            ->columnSpanFull()
            ->schema(self::textFields($site, $fields)), self::otherSites());
    }

    // ---------------------------------------------------------------- content tables

    public static function sitesColumn(): TextColumn
    {
        return TextColumn::make('sites')
            ->label('Sites')
            ->badge()
            ->formatStateUsing(fn (?string $state) => SiteScope::name($state))
            ->color(fn (?string $state) => SiteScope::color($state))
            ->placeholder('Masqué')
            ->toggleable();
    }

    public static function sitesFilter(): SelectFilter
    {
        return SelectFilter::make('site')
            ->label('Site')
            ->options(fn () => Sites::options() + ['none' => 'Aucun site (masqué)'])
            ->query(fn (Builder $query, array $data) => match ($data['value'] ?? null) {
                null, '' => $query,
                'none' => $query->where(fn (Builder $q) => $q->whereNull($q->qualifyColumn('sites'))->orWhereJsonLength($q->qualifyColumn('sites'), 0)),
                default => $query->whereJsonContains($query->qualifyColumn('sites'), $data['value']),
            });
    }

    /**
     * Per other site: does the record have its own text (shown only when visible on that site)?
     *
     * @return list<IconColumn>
     */
    public static function textColumns(string $primaryField): array
    {
        return array_map(fn (string $site) => IconColumn::make("site_text_{$site}")
            ->label('Texte '.SiteScope::name($site))
            ->state(fn (Model $record) => in_array($site, $record->getAttribute('sites') ?? [], true) && method_exists($record, 'siteOverride')
                ? $record->siteOverride($primaryField, $site) !== null
                : null)
            ->boolean()
            ->trueIcon('heroicon-o-check-circle')
            ->falseIcon('heroicon-o-exclamation-circle')
            ->falseColor('warning')
            ->tooltip(fn (?bool $state) => $state === false ? 'Visible sur '.SiteScope::name($site).' avec le texte principal (contenu dupliqué)' : null)
            ->toggleable(), self::otherSites());
    }

    /**
     * Per other site: records shown there without their own text.
     *
     * @return list<Filter>
     */
    public static function textFilters(string $primaryField): array
    {
        return array_map(fn (string $site) => Filter::make("site_text_missing_{$site}")
            ->label('Texte '.SiteScope::name($site).' manquant')
            ->toggle()
            ->query(fn (Builder $query) => $query
                ->whereJsonContains($query->qualifyColumn('sites'), $site)
                ->where(function (Builder $q) use ($site, $primaryField) {
                    $path = "site_content->{$site}->{$primaryField}";
                    $q->whereNull($path)->orWhere($path, '')->orWhere($path, '<p></p>');
                })), self::otherSites());
    }

    /**
     * « Afficher sur … » / « Masquer de … » for each managed site.
     *
     * @param  class-string<Model>  $model
     * @return list<BulkAction>
     */
    public static function visibilityBulkActions(string $model): array
    {
        $actions = [];
        foreach (Sites::keys() as $site) {
            foreach ([true, false] as $show) {
                $actions[] = BulkAction::make(($show ? 'show_on_' : 'hide_from_').$site)
                    ->label($show ? 'Afficher sur '.SiteScope::name($site) : 'Masquer '.SiteScope::ofName($site))
                    ->icon($show ? 'heroicon-o-globe-alt' : 'heroicon-o-no-symbol')
                    ->visible(fn () => SiteScope::manages($site))
                    ->action(function (Collection $records) use ($model, $site, $show) {
                        foreach ($records as $record) {
                            $sites = array_diff($record->getAttribute('sites') ?? [], [$site]);
                            if ($show) {
                                $sites[] = $site;
                            }
                            $model::query()->whereKey($record->getKey())
                                ->update(['sites' => json_encode(array_values(array_intersect(Sites::keys(), $sites)))]);
                        }
                        Revalidator::changed();
                        Notification::make()->title(count($records).' élément(s) mis à jour')->success()->send();
                    })
                    ->deselectRecordsAfterCompletion();
            }
        }

        return $actions;
    }

    // ---------------------------------------------------------------- editorial copies

    /**
     * « Dupliquer pour Arfro »: an unpublished copy shown on that site only, with the SEO and the
     * FAQ, for the staff to rewrite (never publish the same text on two sites).
     *
     * @param  class-string<resource>  $resource
     * @return list<Action>
     */
    public static function duplicateActions(string $resource): array
    {
        return array_map(fn (string $site) => Action::make("duplicate_for_{$site}")
            ->label('Dupliquer pour '.SiteScope::name($site))
            ->icon('heroicon-o-document-duplicate')
            ->color('gray')
            ->visible(fn (Model $record) => SiteScope::manages($site) && ($record->getAttribute('sites') ?? []) !== [$site])
            ->requiresConfirmation()
            ->modalHeading('Dupliquer pour '.SiteScope::name($site).' ?')
            ->modalDescription('Une copie non publiée, visible uniquement sur '.SiteScope::name($site).', est créée. Réécrivez son texte avant de la publier : Google pénalise le contenu dupliqué.')
            ->action(function (Model $record, $livewire) use ($resource, $site) {
                $copy = self::duplicate($record, $site);
                Notification::make()->title('Copie créée pour '.SiteScope::name($site))->body('Réécrivez le texte puis publiez-la.')->success()->send();
                if ($livewire instanceof Component) {
                    $livewire->redirect($resource::getUrl('edit', ['record' => $copy]));
                }
            }), self::otherSites());
    }

    /** Copies an editorial record (with SEO and FAQ) to one site, unpublished. */
    public static function duplicate(Model $record, string $site): Model
    {
        return DB::transaction(function () use ($record, $site) {
            $copy = $record->replicate(['site_content']);
            $copy->setAttribute('sites', [$site]);
            $copy->setAttribute('site_content', null);
            $copy->setAttribute('is_published', false);
            $slug = (string) $record->getAttribute('slug');
            $candidate = $slug;
            for ($i = 1; self::slugOwner($record::class, $candidate, [$site]); $i++) {
                $candidate = $slug.'-'.$site.($i > 1 ? '-'.$i : '');
            }
            $copy->setAttribute('slug', $candidate);
            $copy->save();

            if (method_exists($record, 'seo') && method_exists($copy, 'seo') && ($seo = $record->seo()->first())) {
                $copy->seo()->save($seo->replicate());
            }
            if (method_exists($record, 'faqItems') && method_exists($copy, 'faqItems')) {
                foreach ($record->faqItems()->get() as $faq) {
                    $copy->faqItems()->save($faq->replicate());
                }
            }

            return $copy;
        });
    }

    /**
     * « Voir sur Climatisation Maroc », « Voir sur Arfro »: one link per site showing the record.
     *
     * @return list<Action>
     */
    public static function viewActions(): array
    {
        return array_map(fn (string $site) => Action::make("view_on_{$site}")
            ->label('Voir sur '.SiteScope::name($site))
            ->icon('heroicon-o-arrow-top-right-on-square')
            ->color('gray')
            ->visible(fn (Model $record) => $record instanceof HasPublicUrl && in_array($site, $record->getAttribute('sites') ?? [], true))
            ->url(fn (Model $record) => $record instanceof HasPublicUrl ? Sites::get($site)->url($record->url()) : null)
            ->openUrlInNewTab(), Sites::keys());
    }

    // ---------------------------------------------------------------- orders, leads, resellers

    public static function siteColumn(): TextColumn
    {
        return TextColumn::make('site')
            ->label('Site')
            ->badge()
            ->formatStateUsing(fn (?string $state) => SiteScope::name($state))
            ->color(fn (?string $state) => SiteScope::color($state))
            ->sortable();
    }

    public static function siteFilter(): SelectFilter
    {
        return SelectFilter::make('site')
            ->label('Site')
            ->options(fn () => SiteScope::options())
            ->visible(fn () => count(SiteScope::managed()) > 1);
    }

    public static function siteEntry(): TextEntry
    {
        return TextEntry::make('site')
            ->label('Site')
            ->badge()
            ->formatStateUsing(fn (?string $state) => SiteScope::name($state))
            ->color(fn (?string $state) => SiteScope::color($state));
    }

    /** Read-only site field for edit forms. */
    public static function siteSelect(): Select
    {
        return Select::make('site')->label('Site')->options(fn () => Sites::options())->disabled()->dehydrated(false);
    }

    /**
     * New-record counts per managed site, « Climatisation Maroc 3 · Arfro 1 », for widget descriptions.
     *
     * @param  Builder<Model>  $query
     */
    public static function breakdown(Builder $query): ?string
    {
        if (count(SiteScope::managed()) < 2) {
            return null;
        }
        $counts = (clone $query)->reorder()->selectRaw('site, count(*) as n')->groupBy('site')->pluck('n', 'site');

        return collect(SiteScope::managed())->map(fn (string $s) => SiteScope::name($s).' '.($counts[$s] ?? 0))->implode(' · ');
    }
}
