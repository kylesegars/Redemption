import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { siteConfig } from './site.config';

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((c) => c.value) as [T[number]['value'], ...T[number]['value'][]];

/**
 * Keystatic writes dates as UTC timestamps whose clock time is really the
 * church's *local* time (it has no timezone). We keep the wall-clock string
 * ("2026-10-04T10:00") and convert with the site timezone in src/lib/dates.ts.
 */
const wallClock = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 16) : v.slice(0, 16)));

const optionalString = z
  .string()
  .nullish()
  .transform((v) => v || undefined);

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    publishedDate: wallClock,
    author: reference('authors'),
    category: z.enum(values(siteConfig.blogCategories)),
    featuredImage: z.string(),
    featuredImageAlt: optionalString,
    excerpt: z.string(),
    featured: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    start: wallClock,
    end: wallClock.nullish().transform((v) => v || undefined),
    category: z.enum(values(siteConfig.eventCategories)),
    location: optionalString,
    address: optionalString,
    image: optionalString,
    summary: z.string(),
    registrationUrl: optionalString,
    registrationLabel: optionalString,
    featured: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    role: optionalString,
    photo: optionalString,
    bio: optionalString,
    showOnAbout: z.boolean().default(true),
    order: z.number().nullish().transform((v) => v ?? 10),
  }),
});

export const collections = { posts, events, authors };
