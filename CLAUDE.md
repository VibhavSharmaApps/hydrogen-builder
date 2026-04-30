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
[Update this as you build — tell Claude what's done and what's next]
## Current status
- [x] Project scaffolded
- [x] Component library built (8 components)
- [x] Code generation engine working
- [ ] Editor canvas working ← Week 2 starts here
- [ ] Props panel working
- [ ] Export/download working
- [ ] Shopify integration
- [ ] Fashion theme polished