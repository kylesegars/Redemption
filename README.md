# Redemption Church Coldwater

The website for [Redemption Church Coldwater](https://redemptioncoldwater.com), built with Astro. Staff
edit blog posts, events, the leadership team, and church info in a simple editor at **`/keystatic`**.
They never touch layouts or design.

**Pages:** Home · About (Our Story, The Gospel, Leadership, Core Values, Beliefs, Life at Redemption) ·
Events (+ detail pages) · Blog (+ posts, categories) · Food Pantry · Partner · Give · Contact
**Stack:** Astro 7 · Keystatic (CMS) · Netlify (hosting, forms, nightly rebuild)

**Design:** colors and fonts carry over from the original site. Navy `#021a26`, sky blue `#95d9f7`,
white and light greys, Raleway ExtraBold headings, Montserrat body text, and Open Sans navigation
(see `src/styles/theme.css`).

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321  ·  editor at http://localhost:4321/keystatic
npm run build
```

When run locally, Keystatic saves straight to the files in `src/content` and `src/data`.

---

## Where things live

| What | Where | Who edits it |
|---|---|---|
| Blog posts, events, team/authors | `src/content/**` | Staff, in Keystatic |
| Church info: name, service times, address, giving link, socials, newsletter, Plan a Visit | `src/data/settings.json` | Staff, in Keystatic ("Church Info") |
| Colors, fonts, corner radius, spacing | `src/styles/theme.css` | Developer |
| Timezone, nav links, event/blog categories | `src/site.config.ts` | Developer |
| Page copy (About story, beliefs, Partner FAQ, etc.) | `src/pages/*.astro` | Developer |
| Uploaded images | `public/images/{blog,events,authors,site}` | Keystatic uploads here automatically |

### Common edits
- **Current sermon series (home page):** edit `currentSeries` at the top of `src/pages/index.astro`.
- **Page copy** (Our Story, Gospel, Core Values, Partner levels, Food Pantry policy, etc.): each page keeps its
  copy in a list at the top of its file in `src/pages/`.
- **Navigation / About submenu:** `nav` in `src/site.config.ts`.
- **Google Analytics:** `gaId` in `src/site.config.ts` (only loads on the production build).
- **Photos:** `public/images/site/`.

---

## How events expire

Past events are never shown in lists or the home slider. Three layers make sure of that:
1. **At build time**, past events are left out of every listing.
2. **In the browser**, each event card carries its end time (`data-expires`). A small script in
   `BaseLayout.astro` removes the card the minute that time passes, even if the site hasn't been rebuilt.
3. **Nightly rebuild:** `netlify/functions/nightly-rebuild.mts` triggers a Netlify build hook every
   night, so the published HTML stays clean.

An event expires at its **end** time. If no end time is set, it expires at its **start** time.
Times are entered in the church's local time (see `timezone` in `src/site.config.ts`).
Detail pages for past events stay up, so shared links don't break. They show "This event has
already happened" and are hidden from search engines.

---

## Deploying to Netlify

1. Push this repo to GitHub, then in Netlify choose **Add new site → Import from Git**. The build settings come from `netlify.toml`.
2. **Forms:** the Contact, Plan a Visit, Partner and Newsletter forms work through Netlify Forms
   automatically. Set up email notifications under Site configuration → Forms.
3. **Nightly rebuild:** in Netlify, go to Site configuration → Build & deploy → Build hooks, add a hook,
   and save its URL as an environment variable named `BUILD_HOOK_URL`.
4. **Staff logins (Keystatic):** pick one option.
   - **Keystatic Cloud** (staff don't need GitHub): create a project at keystatic.cloud and link it
     to the repo. Then set `PUBLIC_KEYSTATIC_CLOUD_PROJECT=team/project` in Netlify and invite staff from Keystatic Cloud.
   - **GitHub mode:** set `PUBLIC_KEYSTATIC_GITHUB_REPO=owner/repo`, deploy, then visit
     `https://<site>/keystatic`. Keystatic walks you through creating a GitHub App and gives you the
     `KEYSTATIC_*` secrets to add in Netlify. Add each staff member as a collaborator on the repo.

   See `.env.example` for every variable.

When staff click **Save** in Keystatic, their change is committed to the repo and Netlify
rebuilds the site. It goes live in about a minute.

## Giving (Subsplash)
Giving goes through our sending church, Longview Point Baptist Church, on Subsplash. In Church Info → Giving,
"Subsplash" embeds the giving form (the `wallet.subsplash.com/ui/embed/…` URL) directly on the `/give` page,
and every Give button links there. "Planning Center" opens a Church Center pop-up instead, and "Other" opens
any giving link in a new tab.

---

## Staff guide (share this with pastors and staff)

- Go to **yourchurch.com/keystatic** (there's also a "Staff login" link in the footer).
- **New blog post:** Blog Posts → Add. Fill in the title, pick the author, add a featured photo
  (wide photos work best), write a one- or two-sentence summary, then write the post. Click **Save**.
- **New event:** Events → Add. Set the start time (and the end time if there is one), add a short
  description and a photo, then Save. The event removes itself from the site once it's over.
- **Feature something:** tick "Feature this post" or "Feature this event" to show it large at the top of its page.
- **Service times, address, giving link:** Church Info.
- **YouTube video in a post:** click the **+** in the editor toolbar and choose "YouTube video".
