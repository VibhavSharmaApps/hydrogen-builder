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
- [ ] Editor canvas with drag-and-drop ← WEEK 2 START
- [ ] Props editing panel
- [ ] Responsive preview toggle
- [ ] Export button wired to code generation engine
- [ ] Shopify store connection (Week 3)
- [ ] Fashion theme polish (Week 4)

## Week 1 completed
- 31 source files, ~2,040 lines TypeScript
- 8 components: AnnouncementBar, Navigation, HeroSection, FeatureSection, ProductGrid, CTABlock, Footer, ProductDetail
- Generated output: ~30 files including 15 infrastructure, up to 10 components, 3+ routes
- Routes always generated: _index.tsx, products.$handle.tsx, collections.$handle.tsx, cart.tsx
- Loaders fall back to mock data when no Shopify credentials present

## Week 2 goal
Build the visual editor UI — the browser interface where users compose storefronts.
Three panels: left sidebar (component palette), center canvas (drag-and-drop), right panel (props editor).
The editor state is a JSON array of components with props — the SAME format the code generation engine already consumes.
At the end of Week 2, the full loop works: drag → edit → export → run.

## Key constraint for Week 2
The editor must produce JSON in the exact format that src/codegen/ already expects.
Do NOT refactor the code generation engine to fit the editor — make the editor fit the engine.
Read src/codegen/ before building any editor state management.

## Known issues from Week 1
- Some images use placeholder URLs that may break (use Unsplash CDN URLs as defaults)
- Nav alignment needs cleanup in exported storefront