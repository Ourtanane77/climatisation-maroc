<?php

namespace App\Models;

use App\Models\Concerns\HasSeo;
use App\Models\Contracts\HasPublicUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArticleCategory extends Model implements HasPublicUrl
{
    use HasSeo;

    protected $guarded = ['id'];

    /** @return HasMany<Article, $this> */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    public function url(): string
    {
        return '/blog/categorie/'.$this->slug;
    }
}
