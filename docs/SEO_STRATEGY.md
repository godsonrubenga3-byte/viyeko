# VIYEKO Reachability & SEO Strategy

Because VIYEKO is a React Single Page Application (SPA) deployed on Vercel, it requires explicit configurations to be reachable and understandable by search engines (Googlebot) and social media crawlers (WhatsApp, Twitter).

## 1. Technical SEO for SPA
- **Current State:** Vite outputs an empty `<div id="root"></div>`. Some crawlers execute JS, but others do not.
- **Production Target:** Implement a static prerendering plugin (e.g., `vite-plugin-prerender`) exclusively for public routes like `/auth` or landing pages. This guarantees that search engines receive fully populated HTML without relying on their internal JS engines.

## 2. Meta Tags & Open Graph (Social Sharing)
When users share the VIYEKO link in emergencies, the preview must be immediately recognizable.
- **Current State:** Default Vite tags in `index.html`.
- **Production Target:** Update `index.html` with:
  ```html
  <meta name="description" content="Tanzania's Live Emergency Roadside Assistance Network. Get connected to nearby mechanics instantly.">
  <!-- Open Graph -->
  <meta property="og:title" content="VIYEKO - Roadside Rescue">
  <meta property="og:description" content="Get connected to nearby mechanics instantly.">
  <meta property="og:image" content="https://viyeko.vercel.app/social-banner.jpg">
  <meta property="og:url" content="https://viyeko.vercel.app">
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  ```

## 3. PWA App Manifest Optimization
For maximum adoption, users must be able to "Add to Home Screen" effortlessly.
- **Current State:** Basic `manifest.webmanifest`.
- **Production Target:** 
  - Ensure high-resolution `maskable` icons (192x192, 512x512) are present in the `public/` directory.
  - Inject explicit Apple touch icons into `index.html` because iOS Safari often ignores the webmanifest:
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
    `<meta name="apple-mobile-web-app-capable" content="yes">`

## 4. Crawl Directives
- **Production Target:** Add `robots.txt` and `sitemap.xml` to the `public/` folder.
  - `robots.txt` should allow crawling of `/` but disallow `/profile`, `/history`, and `/provider`.
