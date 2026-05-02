# Hydrogen Storefront Builder

## What this project is
A browser-based tool for Shopify agency developers. They drag-and-drop 
components onto a canvas, edit properties, and export a production-ready 
Shopify Hydrogen storefront codebase.

## Tech stack
- React with TypeScript for the builder UI
- Tailwind CSS for styling
- dnd-kit for drag-and-drop functionality
- The EXPORTED code uses Shopify Hydrogen + React Router v7 + Tailwind

## Project structure
- /src/editor/ — the visual editor UI (canvas, sidebar, props panel)
- /src/components/ — the 8 draggable storefront components
- /src/templates/ — Hydrogen code templates for each component
- /src/codegen/ — the engine that converts JSON state to Hydrogen code
- /src/export/ — zip packaging and download logic

## Commands
- npm run dev — start the development server
- npm run build — build for production
- npm run lint — check code quality

## Code style
- Use TypeScript everywhere, never plain JavaScript
- Use functional React components with hooks, never class components
- Use Tailwind utility classes for styling, never inline CSS objects
- Every component must be responsive (mobile-first)
- Keep files under 200 lines — split into smaller files if bigger
- Use descriptive variable names, no single-letter variables

## Important rules
- NEVER remove existing functionality when adding new features
- ALWAYS run the dev server after changes to verify nothing is broken
- When creating UI components, make them look polished and professional
- The exported Hydrogen code must be clean and well-commented
- Test that exported code actually runs with npm install && npm run dev

## Current status
- [x] Project scaffolded
- [x] Component library built (8 components, 29 editable props)
- [x] Code generation engine working (JSON → ~30 file Hydrogen project)
- [x] Showcase page rendering all 8 components
- [x] Generated project runs with npm install && npm run dev
- [x] Storefront API query stubs included (collection, product, cart)
- [x] Theme config centralized in app/config/theme.ts
- [x] Deployed to Vercel
- [x] Editor canvas with drag-and-drop
- [x] Props editing panel (simple props: text, numbers, colors, toggles)
- [x] Responsive preview toggle
- [x] Export button wired to code generation engine
- [x] Component order in export matches editor arrangement
- [ ] Shopify dev store connection ← WEEK 3 START
- [ ] Real product data in exported storefront
- [ ] Cart functionality in exported storefront
- [ ] Fashion theme polish (Week 4)

## Week 2 completed
- Full loop works: drag → edit props → export → npm install && npm run dev → working storefront
- Component arrangement on canvas is respected in exported code
- Simple props (text, numbers, colors, booleans) editable via props panel
- Responsive preview toggles between desktop and mobile
- Export produces downloadable zip via JSZip

## Known issues
- Complex array props (menu items, footer columns, social links) not editable in props panel — sensible defaults used. V2 improvement.
- Some placeholder images may use broken URLs — use Unsplash CDN URLs as defaults
- Sticky nav toggle effect may not be visible in editor preview, works in exported storefront

## Week 3 goal
Connect the builder to a real Shopify dev store so exported storefronts fetch real product data.
Three things must work by end of week:
1. User pastes Shopify store domain + Storefront API token in a settings panel
2. Product Grid and Product Detail components show real products from the connected store
3. Exported storefront has a working cart — add to cart, update quantity, checkout redirect

## Key constraints for Week 3
- The Storefront API queries already exist in src/codegen/ (COLLECTION_QUERY, PRODUCT_QUERY, CART_QUERY). Do NOT rewrite them — wire them up.
- The loaders already have fallback logic (if (!storefront) return mock data). The task is making the storefront connection work, not restructuring the data layer.
- Store credentials go in .env.example in the export. The builder settings panel saves them to localStorage for preview purposes only — they are NOT baked into the exported code.
- Read the existing query files and loader patterns before writing any new code.