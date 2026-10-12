<?php

namespace App\Mail\Concerns;

use App\Support\Sites\Site;
use App\Support\Sites\Sites;
use Illuminate\Contracts\Mail\Factory as MailFactory;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\SentMessage;

/**
 * A mail rendered for the storefront of its order, lead or reseller (queued mails run outside the
 * request): settings (GeneralSettings…) resolve to that site's values, the sender name is the
 * site's, and the layout's application name (header, signature) is the site name.
 */
trait ForSite
{
    /** Key of the site the mail belongs to (unknown or null = the default site). */
    abstract protected function siteKey(): ?string;

    public function site(): Site
    {
        $key = $this->siteKey();

        return Sites::get(Sites::exists($key) ? $key : null);
    }

    /** Sender: the configured address with the site's name. */
    protected function siteFrom(): Address
    {
        return new Address((string) config('mail.from.address'), $this->site()->mailFromName);
    }

    /**
     * @param  MailFactory|Mailer  $mailer
     */
    public function send($mailer): ?SentMessage
    {
        return $this->asSite(fn () => parent::send($mailer));
    }

    public function render(): string
    {
        return $this->asSite(fn () => parent::render());
    }

    /**
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    protected function asSite(callable $callback): mixed
    {
        $site = $this->site();
        $appName = config('app.name');

        return Sites::runAs($site->key, function () use ($callback, $site, $appName) {
            config(['app.name' => $site->name]);
            try {
                return $callback();
            } finally {
                config(['app.name' => $appName]);
            }
        });
    }
}
