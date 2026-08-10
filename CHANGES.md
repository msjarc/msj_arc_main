# Website Changes — Summary

A summary of the changes in this batch of work. Reflects the **final** state (some
things were tried and reverted along the way; only what was kept is listed here).

## New pages

Eight previously-missing pages linked from the nav and footer were created, using the
existing `DefaultLayout` + `PageHeader` pattern and content relevant to a high-school
amateur radio club (W6MSJ):

| Route | Page | Contents |
| --- | --- | --- |
| `/about` | About Us | Who we are, what we do (Feature grid), meetings |
| `/newham` | New to Ham Radio? | What ham radio is, the 3 license levels, how to get licensed, study/exam links, FAQ |
| `/calendars` | Calendars | Meeting info + contest/hamfest calendars |
| `/clubs` | Local Clubs | ARRL Club Finder, sections, national orgs |
| `/nets` | Local Nets | Explainer + sample net-schedule table |
| `/repeaters` | Local Repeaters | Explainer + sample repeater table |
| `/materials` | Presentations & Reference Materials | Band chart, Part 97, Q-signals, phonetics, study links |
| `/misc` | Miscellaneous | Handy tools (QRZ, grid locator, PSK Reporter) + socials |

External links point to real, stable resources (ARRL, HamStudy, RepeaterBook, FCC, QRZ).
Club-specific data that couldn't be verified (exact meeting times, the club's own
repeater/net frequencies) is left as clearly-labelled sample/placeholder rows for the
club to fill in.

## Homepage (`src/pages/index.astro`)

- Removed the large vertical gaps between sections (the "Latest posts" section margin
  was reduced from `my-64` to `my-16` in `FeaturedPosts.astro`).
- **Quick Links** section rebuilt as a titled grid of clickable **Feature-style cards**
  (icon + title + short description), replacing the earlier centered button row.
- The divider between the hero and Quick Links was made more visible
  (`2px solid var(--border-color)`).
- The **"New to amateur radio?"** call-to-action now appears **only** on the homepage
  (it used to render on every page via the footer).

## Navigation / launcher (`src/components/Header.astro`)

- The Ctrl+K search launcher's animated gradient border was recoloured to match the
  site's brand gradient (the hover animation is kept, just re-themed).

## Footer (`src/components/Footer.astro`)

- Replaced the leftover starter-template columns (Features / Incluud projects /
  Developer tools / astronaut credit) with club-relevant sections:
  - **Club** — Home, About Us, New Ham?, Blog, Contact
  - **Resources** — Calendars, Local Clubs, Local Nets, Local Repeaters, Materials, Misc
  - **Get in touch** — email, phone, address, and social icons (pulled from
    `theme.config.ts`)
  - Club logo + short W6MSJ blurb
- Removed the "New to amateur radio?" CTA from the footer (moved to the homepage).

## Contact page (`src/pages/contact.astro`)

- Page-header banner changed from `gradient` to `bordered` to match the other pages.
- The **Send Message** button uses the gradient-border style (matches the homepage
  quick-link style).
- Added bottom spacing so the footer divider no longer touches the Send Message button.
- The **Discord** button now links to the real invite (`https://discord.gg/TR7VpTzjgx`)
  and opens in a new tab, instead of the dead `/discord` link.

## Global styles (`src/assets/scss/base/_general.scss`)

- All buttons across the site are now consistently rounded (`--radius-m`). The selector
  is element-qualified so it out-specifies the component library's scoped button style.
- Added a reusable `button-gradient` class (gradient border with a solid interior fill),
  used by the contact "Send Message" button and the "Local nets / Local repeaters"
  buttons on the Local Clubs page.

## Note on pre-existing changes

`src/components/Hero.astro` and `public/hero1 cropped.png` were already modified/added
before this batch of work and are not part of it, but they are part of the same commit.
The homepage hero references `public/hero1 cropped.png`, so that image must be committed
or the hero image will 404.
