# AGRENES SEO Upgrade — install guide

This upgrade fixes:
- WhatsApp/Facebook/LinkedIn/X link previews now show real title, description, and hero image
- Google gets real HTML content to index (via prerendering)
- Every page (home, product, shop, bundles, about, contact) gets its own SEO metadata
- Structured data (JSON-LD) so Google shows product cards with price & availability

## What's in this zip

- `src/components/SEO.jsx` — the universal SEO tag component
- `public/og-image.png` — branded 1200×630 hero image for social previews

## Deploy in 5 steps

### Step 1 — Extract this zip into your project
(covered by the usual `Expand-Archive` command)

### Step 2 — Install the two required packages
```
npm install react-helmet-async react-snap
```

### Step 3 — Wrap your app with HelmetProvider

Open `src/index.js` (or `src/main.jsx`) and change:

```js
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

Into:

```js
import { HelmetProvider } from 'react-helmet-async'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
)
```

For Create React App with `ReactDOM.render` (older), same idea:
```js
ReactDOM.render(<HelmetProvider><App /></HelmetProvider>, document.getElementById('root'))
```

### Step 4 — Enable react-snap prerendering

Open `package.json` and add these fields:

```json
"scripts": {
  ...
  "postbuild": "react-snap"
},
"reactSnap": {
  "inlineCss": true,
  "puppeteerArgs": ["--no-sandbox"],
  "include": ["/", "/shop", "/bundles", "/about", "/contact"],
  "skipThirdPartyRequests": true
}
```

Also change `src/index.js` bottom:

```js
// After the render call, add:
if (module.hot) module.hot.accept()
```

### Step 5 — Add SEO tags to your pages

Add these snippets — copy each into the top of its return statement.

#### HomePage.jsx
```jsx
import SEO from '../components/SEO'

// Inside the component's return:
<SEO />
```

#### ShopPage.jsx
```jsx
import SEO from '../components/SEO'

<SEO
  title="Shop All Ugandan Produce"
  description="Browse fresh fruits, vegetables, dried foods, beverages and African crafts — air-freighted from Uganda to the UK."
  url="/shop"
/>
```

#### ProductPage.jsx (dynamic per product)
```jsx
import SEO from '../components/SEO'

// Inside return, AFTER product is loaded:
{product && (
  <SEO
    title={product.name}
    description={product.description || `Fresh ${product.name} from Uganda, delivered UK-wide.`}
    image={product.images?.[0]}
    url={`/product/${product.id}`}
    type="product"
    price={product.price}
    productBrand={product.vendors?.name}
    availability={product.stock_qty > 0 ? 'in stock' : 'out of stock'}
  />
)}
```

#### BundlesPage.jsx
```jsx
import SEO from '../components/SEO'

<SEO
  title="Curated Ugandan Bundles"
  description="Sunday lunch boxes, care packages and gift sets — curated Ugandan bundles delivered UK-wide."
  url="/bundles"
/>
```

#### AboutPage.jsx (if you have one)
```jsx
import SEO from '../components/SEO'

<SEO
  title="About AGRENES"
  description="AGRENES exports fresh Ugandan produce, air-freighted weekly to the UK. GAP & UNBS certified."
  url="/about"
/>
```

#### ContactPage.jsx (if you have one)
```jsx
import SEO from '../components/SEO'

<SEO
  title="Contact AGRENES"
  description="Contact AGRENES for bulk orders, wholesale enquiries or general questions. WhatsApp us on +44 7950 554456."
  url="/contact"
/>
```

### Step 6 — Deploy

```
git add .
git commit -m "SEO + social preview upgrade: helmet tags, prerender, og image"
git push
```

## After deploy — verify it works

1. Open in incognito: `https://agrenesmarket.com`
2. Right-click → **View Page Source**. You should see `<title>` and `<meta>` tags with real content — NOT the empty `<div id="root">`.
3. Test WhatsApp/Facebook preview:
   - **Facebook debugger:** https://developers.facebook.com/tools/debug/ (paste your URL, click Debug, then Scrape Again)
   - **WhatsApp:** send yourself the link — it should now show a beautiful preview card
   - **LinkedIn:** https://www.linkedin.com/post-inspector/
   - **Twitter:** https://cards-dev.twitter.com/validator
4. Google Search Console: submit `https://agrenesmarket.com/sitemap.xml` (bonus: I can generate one for you next)

## Troubleshooting

If `postbuild` fails on Vercel with a puppeteer error, add this to `package.json`:
```json
"reactSnap": {
  ...
  "puppeteerExecutablePath": "/usr/bin/chromium-browser"
}
```
Or reach out and I'll ship a plan-B using `@vercel/og` instead.
