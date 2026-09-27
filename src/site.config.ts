/**
 * Developer-owned settings for this church's site.
 *
 * Things staff should be able to change themselves (service times, address,
 * giving link, etc.) live in Keystatic under "Church Info" instead
 * (src/data/settings.json). Colors and fonts live in src/styles/theme.css.
 */
export const siteConfig = {
  /**
   * The church's IANA timezone. Event dates/times entered in Keystatic are read
   * as local time in this zone, and events disappear once that moment passes.
   */
  timezone: 'America/Chicago',
  locale: 'en-US',

  nav: [
    { label: 'About', href: '/about' },
    { label: 'Events', href: '/events' },
    { label: 'Blog', href: '/blog' },
    { label: 'Partner', href: '/partner' },
    { label: 'Contact', href: '/contact' },
  ],
  /** The highlighted button at the end of the nav. */
  navCta: { label: 'Give', href: '/give' },

  /** Options shown in the Keystatic dropdowns and as filters on the site. */
  eventCategories: [
    { label: 'Sunday', value: 'sunday' },
    { label: 'Community', value: 'community' },
    { label: 'Kids & Students', value: 'kids-students' },
    { label: 'Groups', value: 'groups' },
    { label: 'Serve', value: 'serve' },
  ],
  blogCategories: [
    { label: 'Church Life', value: 'church-life' },
    { label: 'Teaching', value: 'teaching' },
    { label: 'Stories', value: 'stories' },
    { label: 'Updates', value: 'updates' },
  ],

  /** How many upcoming events appear in the home page slider. */
  homeEventCount: 6,
  /** Posts per page on /blog. */
  postsPerPage: 9,
} as const;

export type EventCategory = (typeof siteConfig.eventCategories)[number]['value'];
export type BlogCategory = (typeof siteConfig.blogCategories)[number]['value'];

export const labelFor = (
  list: readonly { label: string; value: string }[],
  value: string | undefined | null,
) => list.find((c) => c.value === value)?.label ?? value ?? '';
