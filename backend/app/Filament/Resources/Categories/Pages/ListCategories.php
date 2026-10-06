<?php

namespace App\Filament\Resources\Categories\Pages;

use App\Filament\Resources\Categories\CategoryResource;
use App\Models\Category;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

/**
 * Category tree: the first tab lists the ranges (top level), each other tab the sub-categories of
 * one range. Drag and drop reorders siblings within the visible tab.
 */
class ListCategories extends ListRecords
{
    protected static string $resource = CategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }

    public function getTabs(): array
    {
        $tabs = ['gammes' => Tab::make('Gammes')->modifyQueryUsing(fn (Builder $query) => $query->whereNull('parent_id'))];

        foreach (Category::query()->whereNull('parent_id')->orderBy('position')->get() as $root) {
            $tabs['g'.$root->id] = Tab::make($root->short_name ?: $root->name)
                ->badge($root->children()->count() ?: null)
                ->modifyQueryUsing(fn (Builder $query) => $query->where('parent_id', $root->id));
        }

        return $tabs;
    }
}
