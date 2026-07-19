# AGRENES — Complete Setup & Deployment Guide

## What You've Got
A full production-ready e-commerce app with:
- ✅ Homepage with hero carousel, flash deals, featured products
- ✅ Shop with real-time filters, search, categories
- ✅ Product pages with reviews, bulk pricing, add to cart
- ✅ Cart drawer with free delivery threshold
- ✅ Multi-step checkout (delivery → payment → confirm)
- ✅ Order tracking with live status steps
- ✅ User accounts (sign up / sign in / profile)
- ✅ Wishlist (persisted locally)
- ✅ Admin dashboard: add/edit/delete products, manage orders & vendors
- ✅ Mobile-first design with bottom nav
- ✅ PWA-ready (installable on phone like a native app)

---

## Step 1 — Set Up Your Database (Free, 10 minutes)

1. Go to **https://supabase.com** → Create a free account
2. Click **New Project** → Name it "agrenes" → Set a database password → Create
3. Wait ~2 minutes for it to set up
4. Go to **SQL Editor** (left sidebar)
5. Open `supabase_schema.sql` from this folder
6. Paste the entire contents → Click **Run**
7. Go to **Settings → API** → Copy your:
   - Project URL (looks like `https://abc123.supabase.co`)
   - `anon` public key

---

## Step 2 — Run the App Locally

```bash
# Clone/download this folder, then:
cd agrenes

# Copy your Supabase keys
cp .env.example .env.local
# Edit .env.local with your URL and anon key

# Place your logo at: public/logo.png

# Install and run
npm install
npm start
```

Browser opens at `http://localhost:3000` — you now have a live app!

---

## Step 3 — Add Your First Products

1. Sign up for an account in the app
2. In Supabase → SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. Refresh the app → go to Account → Admin Panel
4. Click **Add Product** and fill in your produce

---

## Step 4 — Deploy to the Web (Free)

### Option A: Vercel (Recommended — 5 minutes)
1. Go to **https://vercel.com** → sign up with GitHub
2. Push this folder to a GitHub repo
3. In Vercel → New Project → Import your repo
4. Add your environment variables (from .env.local)
5. Deploy → you get a live URL like `agrenes.vercel.app`
6. Attach your custom domain (agrenes.co.uk) in Vercel → Domains

### Option B: Netlify
1. `npm run build`
2. Drag the `build/` folder to **https://netlify.com/drop**
3. Done — live in 60 seconds

---

## Step 5 — Publish to App Stores

### Google Play Store
1. Install **Capacitor**: `npm install @capacitor/core @capacitor/android`
2. Run: `npx cap add android && npx cap copy && npx cap open android`
3. Build APK in Android Studio → Upload to Play Console
4. One-time fee: **$25**

### Apple App Store
1. Install: `npm install @capacitor/ios`
2. Run: `npx cap add ios && npx cap copy && npx cap open ios`
3. Build in Xcode → Upload via Xcode or Transporter
4. Requires: Apple Developer account (**$99/year**) + a Mac

### PWA (Instant — No Store Needed)
Your app already has a `manifest.json` — users can install it directly from the browser:
- Android: Chrome shows "Add to Home Screen" automatically
- iOS: Safari → Share → Add to Home Screen
This is a free shortcut while you prepare the store submissions.

---

## Step 6 — Accept Real Payments

### Stripe (UK Card Payments)
1. Sign up at https://stripe.com
2. Get your publishable key → add to .env.local
3. Set up a webhook endpoint for payment confirmation
4. In CheckoutPage.jsx, integrate `stripe.js` (code ready to extend)

### Flutterwave (Mobile Money)
1. Sign up at https://flutterwave.com
2. Get API keys
3. Add Mobile Money payment flow (MTN Uganda, Airtel Uganda)

---

## File Structure
```
agrenes/
├── public/
│   ├── index.html          ← HTML entry + SEO meta tags
│   ├── manifest.json       ← PWA install config
│   └── logo.png            ← YOUR LOGO goes here
├── src/
│   ├── App.js              ← Router + layout
│   ├── styles/global.css   ← All design tokens & global styles
│   ├── lib/
│   │   ├── supabase.js     ← Database client
│   │   └── store.js        ← Cart, auth, wishlist state
│   ├── components/
│   │   ├── layout/         ← Navbar, CategoryBar, BottomNav, SideMenu
│   │   ├── cart/           ← CartDrawer
│   │   └── product/        ← ProductCard
│   └── pages/
│       ├── HomePage.jsx    ← Hero, deals, categories
│       ├── ShopPage.jsx    ← Product grid + filters
│       ├── ProductPage.jsx ← Single product detail
│       ├── CheckoutPage.jsx← 4-step checkout
│       ├── OrdersPage.jsx  ← Order history + tracking
│       ├── AccountPage.jsx ← Profile + wishlist
│       ├── AuthPage.jsx    ← Sign in / Sign up
│       └── AdminPage.jsx   ← Full admin dashboard
├── supabase_schema.sql     ← Run this in Supabase SQL Editor
├── .env.example            ← Copy to .env.local with your keys
└── package.json
```

---

## Editing & Customising

| What to change | Where |
|---|---|
| Colours / fonts | `src/styles/global.css` (top `:root` variables) |
| Logo | Replace `public/logo.png` |
| Hero slides | `src/pages/HomePage.jsx` → `SLIDES` array |
| Delivery fee threshold | `src/components/cart/CartDrawer.jsx` → `deliveryFee` |
| Navigation tabs | `src/components/layout/BottomNav.jsx` |
| Categories | Supabase → `categories` table |
| Products | Admin Panel in the app, or Supabase → `products` table |
| Order statuses | `src/pages/OrdersPage.jsx` → `STATUS_STEPS` |

---

## Support
For help with setup: support@agrenes.co.uk
