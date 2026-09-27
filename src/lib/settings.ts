import raw from '../data/settings.json';

type Maybe<T> = T | null | undefined;

/** Church Info from Keystatic (src/data/settings.json), with safe fallbacks. */
export interface Settings {
  churchName: string;
  tagline?: Maybe<string>;
  logo?: Maybe<string>;
  serviceTimes: { day: string; time: string; note?: Maybe<string> }[];
  location: {
    venue?: Maybe<string>;
    street?: Maybe<string>;
    city?: Maybe<string>;
    state?: Maybe<string>;
    zip?: Maybe<string>;
    mapUrl?: Maybe<string>;
    arrival?: Maybe<string>;
  };
  email?: Maybe<string>;
  phone?: Maybe<string>;
  social: { instagram?: Maybe<string>; facebook?: Maybe<string>; youtube?: Maybe<string> };
  planVisit: { enabled: boolean; heading?: Maybe<string>; blurb?: Maybe<string> };
  giving: {
    provider: 'subsplash' | 'planning-center' | 'other';
    url?: Maybe<string>;
    mailingAddress?: Maybe<string>;
    note?: Maybe<string>;
  };
  newsletter: { enabled: boolean; heading?: Maybe<string>; blurb?: Maybe<string>; formAction?: Maybe<string> };
}

const r = raw as Partial<Settings>;

export const settings: Settings = {
  churchName: r.churchName || 'Our Church',
  tagline: r.tagline,
  logo: r.logo,
  serviceTimes: r.serviceTimes ?? [],
  location: r.location ?? {},
  email: r.email,
  phone: r.phone,
  social: r.social ?? {},
  planVisit: { enabled: true, ...r.planVisit },
  giving: { provider: 'subsplash', ...r.giving },
  newsletter: { enabled: false, ...r.newsletter },
};

export const cityState = [settings.location.city, settings.location.state].filter(Boolean).join(', ');

export const fullAddress = [
  settings.location.street,
  [settings.location.city, [settings.location.state, settings.location.zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', '),
]
  .filter(Boolean)
  .join(', ');

/** Planning Center opens giving in an on-page modal when this param is present. */
export const givingHref = (() => {
  const url = settings.giving.url;
  if (!url || settings.giving.provider === 'subsplash') return '/give';
  if (settings.giving.provider === 'planning-center') {
    return url + (url.includes('?') ? '&' : '?') + 'open-in-church-center-modal=true';
  }
  return url;
})();
