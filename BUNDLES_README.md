# AGRENES Bundles — install steps

## 1) Run the SQL (schema + seed + item mapping)
Open AGRENES_Bundles_Setup.sql, copy all, paste into Supabase SQL Editor, click Run.
It creates the tables, seeds your 6 launch bundles, and auto-links products by name.

## 2) Extract this zip into your project folder
It contains:
- src/pages/HomePage.jsx     (adds a "Curated Bundles" strip)
- src/pages/BundlesPage.jsx  (new — list of all bundles)
- src/pages/BundleDetailPage.jsx (new — bundle details & add to cart)

## 3) Add two routes in src/App.js
Near your existing imports, add:
```
import BundlesPage from './pages/BundlesPage'
import BundleDetailPage from './pages/BundleDetailPage'
```
Inside your <Routes> block, add:
```
<Route path="/bundles" element={<BundlesPage />} />
<Route path="/bundles/:slug" element={<BundleDetailPage />} />
```

## 4) Deploy
git add . && git commit -m "Launch bundles feature" && git push
