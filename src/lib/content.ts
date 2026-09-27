import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { toInstant } from './dates';

export type EventEntry = CollectionEntry<'events'>;
export type PostEntry = CollectionEntry<'posts'>;
export type AuthorEntry = CollectionEntry<'authors'>;

/** The moment an event should disappear: its end time, or its start time if no end. */
export const expiresAt = (e: EventEntry) => toInstant(e.data.end ?? e.data.start);

/** Upcoming (not yet ended) events, soonest first. Evaluated at build time;
 *  the browser re-checks via [data-expires] so nothing stale shows between builds. */
export async function getUpcomingEvents() {
  const now = Date.now();
  const all = await getCollection('events');
  return all
    .filter((e) => expiresAt(e) > now)
    .sort((a, b) => toInstant(a.data.start) - toInstant(b.data.start));
}

export async function getPosts() {
  const all = await getCollection('posts');
  return all.sort((a, b) => b.data.publishedDate.localeCompare(a.data.publishedDate));
}

export async function getAuthor(post: PostEntry) {
  return getEntry(post.data.author);
}

export async function getTeam() {
  const all = await getCollection('authors');
  return all.filter((a) => a.data.showOnAbout).sort((a, b) => a.data.order - b.data.order);
}

/** ~200 words per minute, from the raw Markdoc body. */
export function readingTime(body = '') {
  const words = body.replace(/\{%.*?%\}/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
