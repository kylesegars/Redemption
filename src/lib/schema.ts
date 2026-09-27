/**
 * schema.org JSON-LD builders. Everything reads from Church Info
 * (src/data/settings.json) and site.config, so staff edits in Keystatic
 * flow straight into the structured data.
 */
import { settings, fullAddress } from './settings';
import { siteConfig } from '../site.config';
import { toIsoWithOffset } from './dates';
import type { EventEntry } from './content';

const abs = (path: string, site: URL) => new URL(path, site).toString();

export const ids = (site: URL) => ({
  church: abs('/#church', site),
  organization: abs('/#organization', site),
  website: abs('/#website', site),
});

export const postalAddress = () => ({
  '@type': 'PostalAddress',
  streetAddress: settings.location.street,
  addressLocality: settings.location.city,
  addressRegion: settings.location.state,
  postalCode: settings.location.zip,
  addressCountry: 'US',
});

const sameAs = () =>
  (['facebook', 'instagram', 'youtube'] as const).map((k) => settings.social[k]).filter(Boolean) as string[];

/** Church + Organization + WebSite graph for the home page. */
export function homeSchema(site: URL) {
  const id = ids(site);
  const logo = { '@type': 'ImageObject', url: abs('/images/site/logo-mark.png', site) }; // square mark suits Google's logo guidelines
  const service = settings.serviceTimes[0];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Church',
        '@id': id.church,
        name: settings.churchName,
        alternateName: 'Redemption Church',
        description: `${settings.churchName} is a Southern Baptist church in ${settings.location.city}, Mississippi.${service ? ` Join us ${service.day} at ${service.time} for worship.` : ''}`,
        url: abs('/', site),
        logo,
        image: [abs('/images/site/og-image.jpg', site), abs('/images/site/sanctuary.jpg', site)],
        telephone: settings.phone ?? undefined,
        address: postalAddress(),
        geo: siteConfig.geo ? { '@type': 'GeoCoordinates', ...siteConfig.geo } : undefined,
        hasMap: settings.location.mapUrl ?? undefined,
        publicAccess: true,
        isAccessibleForFree: true,
        sameAs: sameAs(),
      },
      {
        '@type': 'Organization',
        '@id': id.organization,
        name: settings.churchName,
        url: abs('/', site),
        logo,
        email: settings.email ?? undefined,
        telephone: settings.phone ?? undefined,
        address: postalAddress(),
        location: { '@id': id.church },
        areaServed: [
          { '@type': 'City', name: 'Coldwater, Mississippi' },
          { '@type': 'AdministrativeArea', name: 'Tate County, Mississippi' },
        ],
        founder: { '@type': 'Person', name: 'Sam Henderson', jobTitle: 'Lead Pastor' },
        parentOrganization: {
          '@type': 'Church',
          name: 'Longview Point Baptist Church',
          url: 'https://longviewpoint.org',
          address: { '@type': 'PostalAddress', addressLocality: 'Hernando', addressRegion: 'MS', addressCountry: 'US' },
        },
        memberOf: { '@type': 'Organization', name: 'Southern Baptist Convention', url: 'https://www.sbc.net' },
        sameAs: sameAs(),
      },
      {
        '@type': 'WebSite',
        '@id': id.website,
        name: settings.churchName,
        url: abs('/', site),
        inLanguage: 'en-US',
        publisher: { '@id': id.organization },
        about: { '@id': id.church },
      },
    ],
  };
}

/** Event schema, generated automatically for every event added in Keystatic. */
export function eventSchema(event: EventEntry, site: URL) {
  const d = event.data;
  const id = ids(site);
  const atChurch = !d.address;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': abs(`/events/${event.id}#event`, site),
    name: d.title,
    description: d.summary,
    url: abs(`/events/${event.id}`, site),
    startDate: toIsoWithOffset(d.start),
    ...(d.end && { endDate: toIsoWithOffset(d.end) }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [abs(d.image ?? '/images/site/og-image.jpg', site)],
    location: atChurch
      ? {
          '@type': 'Place',
          name: d.location ?? settings.churchName,
          address: postalAddress(),
        }
      : {
          '@type': 'Place',
          name: d.location ?? d.address,
          address: d.address,
        },
    organizer: {
      '@type': 'Organization',
      '@id': id.organization,
      name: settings.churchName,
      url: abs('/', site),
    },
    ...(d.registrationUrl && {
      offers: { '@type': 'Offer', url: d.registrationUrl, availability: 'https://schema.org/InStock' },
    }),
  };
}

export { fullAddress };
