import { config, collection, singleton, fields } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';
import { siteConfig } from './src/site.config';

/**
 * Keystatic = the staff-facing editor at /keystatic.
 * Staff only ever fill in these fields; layouts and design live in the code.
 */

const cloudProject = import.meta.env.PUBLIC_KEYSTATIC_CLOUD_PROJECT;
const githubRepo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO;

const storage = cloudProject
  ? ({ kind: 'cloud' } as const)
  : githubRepo
    ? ({ kind: 'github', repo: githubRepo as `${string}/${string}` } as const)
    : ({ kind: 'local' } as const);

/** Rich-text body used for blog posts and event details. */
const body = (label: string, imageDir: string) =>
  fields.markdoc({
    label,
    options: {
      heading: [2, 3, 4],
      image: { directory: `public/images/${imageDir}`, publicPath: `/images/${imageDir}/` },
      table: false,
      codeBlock: false,
      code: false,
    },
    components: {
      youtube: block({
        label: 'YouTube video',
        schema: {
          url: fields.url({
            label: 'YouTube link',
            description: 'Paste the normal video link, e.g. https://www.youtube.com/watch?v=…',
            validation: { isRequired: true },
          }),
        },
      }),
    },
  });

export default config({
  storage,
  ...(cloudProject ? { cloud: { project: cloudProject } } : {}),
  ui: {
    brand: { name: 'Redemption Church Coldwater' },
    navigation: {
      Content: ['posts', 'events'],
      Church: ['team', 'settings'],
    },
  },

  collections: {
    posts: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishedDate'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        publishedDate: fields.date({
          label: 'Publish date',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        author: fields.relationship({
          label: 'Author',
          collection: 'team',
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: 'Category',
          options: siteConfig.blogCategories,
          defaultValue: siteConfig.blogCategories[0].value,
        }),
        featuredImage: fields.image({
          label: 'Featured image',
          description: 'Wide/landscape photos work best (at least 1600px wide).',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
          validation: { isRequired: true },
        }),
        featuredImageAlt: fields.text({
          label: 'Featured image description',
          description: 'A short description of the photo for screen readers.',
        }),
        excerpt: fields.text({
          label: 'Summary',
          description: 'One or two sentences shown on the blog list and in link previews.',
          multiline: true,
          validation: { isRequired: true, length: { max: 280 } },
        }),
        featured: fields.checkbox({
          label: 'Feature this post',
          description: 'Shows it large at the top of the blog page.',
          defaultValue: false,
        }),
        content: body('Post', 'blog'),
      },
    }),

    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'src/content/events/*',
      format: { contentField: 'content' },
      columns: ['title', 'start'],
      schema: {
        title: fields.slug({ name: { label: 'Event name' } }),
        start: fields.datetime({
          label: 'Starts',
          validation: { isRequired: true },
        }),
        end: fields.datetime({
          label: 'Ends (optional)',
          description:
            'The event disappears from the website after this time (or after the start time if left blank).',
        }),
        category: fields.select({
          label: 'Category',
          options: siteConfig.eventCategories,
          defaultValue: siteConfig.eventCategories[0].value,
        }),
        location: fields.text({ label: 'Location name', description: 'e.g. "Main Room" or "Riverside Park"' }),
        address: fields.text({ label: 'Address (optional)' }),
        image: fields.image({
          label: 'Event image',
          directory: 'public/images/events',
          publicPath: '/images/events/',
        }),
        summary: fields.text({
          label: 'Short description',
          multiline: true,
          validation: { isRequired: true, length: { max: 240 } },
        }),
        registrationUrl: fields.url({ label: 'Registration / sign-up link (optional)' }),
        registrationLabel: fields.text({ label: 'Button text', defaultValue: 'Register' }),
        featured: fields.checkbox({
          label: 'Feature this event',
          description: 'Shows it large at the top of the events page.',
          defaultValue: false,
        }),
        content: body('Event details', 'events'),
      },
    }),

    team: collection({
      label: 'Team & Authors',
      slugField: 'name',
      path: 'src/content/authors/*',
      format: { data: 'yaml' },
      columns: ['name', 'role'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        role: fields.text({ label: 'Role', description: 'e.g. Lead Pastor' }),
        photo: fields.image({
          label: 'Photo',
          description: 'Square headshots work best.',
          directory: 'public/images/authors',
          publicPath: '/images/authors/',
        }),
        bio: fields.text({ label: 'Short bio', multiline: true }),
        showOnAbout: fields.checkbox({
          label: 'Show on About page',
          description: 'Include in the leadership section.',
          defaultValue: true,
        }),
        order: fields.integer({
          label: 'Sort order',
          description: 'Lower numbers show first on the About page.',
          defaultValue: 10,
        }),
      },
    }),
  },

  singletons: {
    settings: singleton({
      label: 'Church Info',
      path: 'src/data/settings',
      format: { data: 'json' },
      schema: {
        churchName: fields.text({ label: 'Church name', validation: { isRequired: true } }),
        tagline: fields.text({ label: 'Tagline', description: 'Short line used in the footer and link previews.' }),
        logo: fields.image({
          label: 'Logo (optional)',
          description: 'SVG or transparent PNG. If empty, the church name is shown as text.',
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        serviceTimes: fields.array(
          fields.object({
            day: fields.text({ label: 'Day', defaultValue: 'Sundays' }),
            time: fields.text({ label: 'Time', description: 'e.g. 10:00 AM' }),
            note: fields.text({ label: 'Note (optional)', description: 'e.g. Kids program available' }),
          }),
          { label: 'Service times', itemLabel: (p) => `${p.fields.day.value} ${p.fields.time.value}` },
        ),
        location: fields.object(
          {
            venue: fields.text({ label: 'Venue name', description: 'e.g. "Lincoln Elementary School"' }),
            street: fields.text({ label: 'Street address' }),
            city: fields.text({ label: 'City' }),
            state: fields.text({ label: 'State' }),
            zip: fields.text({ label: 'ZIP' }),
            mapUrl: fields.url({ label: 'Map link (Google/Apple Maps)' }),
            arrival: fields.text({
              label: 'Parking & arrival notes',
              multiline: true,
              description: 'Shown to first-time guests.',
            }),
          },
          { label: 'Location' },
        ),
        email: fields.text({ label: 'Contact email' }),
        phone: fields.text({ label: 'Phone (optional)' }),
        social: fields.object(
          {
            instagram: fields.url({ label: 'Instagram' }),
            facebook: fields.url({ label: 'Facebook' }),
            youtube: fields.url({ label: 'YouTube' }),
          },
          { label: 'Social links' },
        ),
        planVisit: fields.object(
          {
            enabled: fields.checkbox({ label: 'Show the "Plan a Visit" button', defaultValue: true }),
            heading: fields.text({ label: 'Heading', defaultValue: "We'd love to meet you" }),
            blurb: fields.text({ label: 'Intro text', multiline: true }),
          },
          { label: 'Plan a Visit' },
        ),
        giving: fields.object(
          {
            provider: fields.select({
              label: 'Giving platform',
              options: [
                { label: 'Subsplash (form embedded on the Give page)', value: 'subsplash' },
                { label: 'Planning Center (Church Center)', value: 'planning-center' },
                { label: 'Other (link opens in a new tab)', value: 'other' },
              ],
              defaultValue: 'subsplash',
            }),
            url: fields.url({
              label: 'Giving link',
              description:
                'Subsplash: the embed URL (https://wallet.subsplash.com/ui/embed/…). Planning Center: your Church Center giving URL.',
            }),
            mailingAddress: fields.text({ label: 'Give by check (optional)', description: 'Who to make checks payable to, memo line, mailing address.', multiline: true }),
            note: fields.text({
              label: 'Extra note (optional)',
              multiline: true,
              description: 'e.g. tax-exempt status, sponsoring church, EIN.',
            }),
          },
          { label: 'Giving' },
        ),
        newsletter: fields.object(
          {
            enabled: fields.checkbox({ label: 'Show newsletter signup', defaultValue: false }),
            heading: fields.text({ label: 'Heading', defaultValue: 'Stay in the loop' }),
            blurb: fields.text({ label: 'Text', multiline: true }),
            formAction: fields.url({
              label: 'Mailchimp (or similar) form action URL (optional)',
              description:
                'Leave empty to collect emails in Netlify Forms instead (export anytime as CSV).',
            }),
          },
          { label: 'Newsletter' },
        ),
      },
    }),
  },
});
