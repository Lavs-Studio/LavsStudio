# Lavs Studio

Lavs Studio is a premium, feminine, mobile-first affiliate-style website for fashion, beauty, and lifestyle inspiration.

## Features
- Responsive React + Vite landing experience
- SEO-friendly pages and blog content
- Pinterest-inspired visuals and content blocks
- Affiliate-ready components and disclosure structure

## Development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

## GitHub Pages deployment
This project is configured for GitHub Pages with the Vite base path set to `/LavsStudio/`.

## Supabase setup
Create a `.env.local` file from `.env.example` and set these values:

- `VITE_SUPABASE_URL`: your Supabase project URL from Project Settings → API → Project URL.
- `VITE_SUPABASE_ANON_KEY`: your Supabase public anon key from Project Settings → API → Project API keys → `anon` public key.

Keep the `service_role` key out of the frontend. Use it only on trusted server-side code, never in Vite or GitHub Pages.

### Deploy steps
1. Create a GitHub repository named `LavsStudio`.
2. Push the project to the repository.
3. In GitHub, open Settings → Pages.
4. Choose the `gh-pages` branch as the deployment source.
5. Deploy and open the site at `https://github.com/Lavs-Studio/LavsStudio`.
