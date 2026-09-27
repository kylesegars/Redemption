/**
 * Developer-owned settings for this church's site.
 *
 * Things staff should be able to change themselves (service times, address,
 * giving link, etc.) live in Keystatic under "Church Info" instead
 * (src/data/settings.json). Colors and fonts live in src/styles/theme.css.
 */
export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

export const siteConfig = {
  /**
   * The church's IANA timezone. Event dates/times entered in Keystatic are read
   * as local time in this zone, and events disappear once that moment passes.
   */
  timezone: 'America/Chicago',
  locale: 'en-US',

  /** Map coordinates of the church building (used in the Church schema). */
  geo: { latitude: 34.7003793, longitude: -89.9459022 },

  /**
   * Review mode: while the site is being reviewed, keep it out of search engines.
   * Set to false at launch, AND remove the X-Robots-Tag block in netlify.toml.
   */
  noindex: true,

  /** Google Analytics 4 measurement ID (leave empty to disable). */
  gaId: 'G-4RCKL8E1PK',

  nav: [
    {
      label: 'About',
      href: '/about',
      children: [
        { label: 'Our Story', href: '/about' },
        { label: 'The Gospel', href: '/about/the-gospel' },
        { label: 'Leadership', href: '/about/leadership' },
        { label: 'Core Values', href: '/about/core-values' },
        { label: 'Beliefs', href: '/about/beliefs' },
        { label: 'Life at Redemption', href: '/about/life-at-redemption-coldwater' },
      ],
    },
    { label: 'Events', href: '/events' },
    { label: 'Blog', href: '/blog' },
    { label: 'Food Pantry', href: '/food-pantry' },
    { label: 'Partner', href: '/partner' },
  ] as NavItem[],
  /** The highlighted button at the end of the nav. */
  navCta: { label: 'Give', href: '/give' },

  /** Options shown in the Keystatic dropdowns and as filters on the site. */
  eventCategories: [
    { label: 'Worship', value: 'sunday' },
    { label: 'Community', value: 'community' },
    { label: 'Groups', value: 'groups' },
    { label: 'Serve', value: 'serve' },
    { label: 'Kids & Students', value: 'kids-students' },
  ],
  blogCategories: [
    { label: 'Church Life', value: 'church-life' },
    { label: 'Teaching', value: 'teaching' },
    { label: 'Stories', value: 'stories' },
    { label: 'Updates', value: 'updates' },
    { label: 'Missions', value: 'missions' },
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
