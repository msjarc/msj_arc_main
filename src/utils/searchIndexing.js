/**
 * Keep the HTML robots directive and generated XML sitemap in sync.
 * Crawlers must still be allowed to fetch excluded pages to read `noindex`.
 *
 * @param {string} pathname
 */
export function shouldIndexPage(pathname) {
  return !(
    /^\/about\/?$/.test(pathname) ||
    /^\/blog(?:\/|$)/.test(pathname) ||
    /^\/(?:404|admin|error|thank-you|markdown-page|mdx-page|sitemap)\/?$/.test(pathname) ||
    /^\/activities\/tag(?:\/|$)/.test(pathname) ||
    /^\/activities\/\d+\/?$/.test(pathname)
  )
}
