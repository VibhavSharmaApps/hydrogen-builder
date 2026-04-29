import { readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const COLLECTION_QUERY = `#graphql
  query CollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      products(first: $first) {
        nodes {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            nodes {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;
const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      handle
      variants(first: 10) {
        nodes {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
      images(first: 8) {
        nodes {
          url
          altText
          width
          height
        }
      }
      options {
        name
        values
      }
    }
  }
`;
const CART_QUERY = `#graphql
  fragment CartLine on CartLine {
    id
    quantity
    merchandise {
      ... on ProductVariant {
        id
        title
        price { amount currencyCode }
        product { title handle }
        image { url altText width height }
      }
    }
  }
  fragment Cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes { ...CartLine }
    }
  }
`;
function generateServerTs() {
  return `import { createRequestHandler } from '@shopify/remix-oxygen'
import {
  createStorefrontClient,
  createCartHandler,
  cartGetIdDefault,
  cartSetIdDefault,
} from '@shopify/hydrogen'
import * as remixBuild from 'virtual:remix/server-build'

export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      const waitUntil = executionContext.waitUntil.bind(executionContext)
      const cache = await caches.open('hydrogen')
      const session = await HydrogenSession.init(request, [env.SESSION_SECRET])

      const { storefront } = createStorefrontClient({
        cache,
        waitUntil,
        i18n: { language: 'EN', country: 'US' },
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
        storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION ?? '2024-04',
      })

      const cart = createCartHandler({
        storefront,
        getCartId: cartGetIdDefault(request.headers),
        setCartId: cartSetIdDefault(),
      })

      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({ session, storefront, cart, env, waitUntil }),
      })

      const response = await handleRequest(request)
      if (session.isPending) {
        response.headers.set('Set-Cookie', await session.commit())
      }
      return response
    } catch (error) {
      console.error(error)
      return new Response('An unexpected error occurred', { status: 500 })
    }
  },
}

class HydrogenSession {
  #data: Record<string, string>
  isPending = false
  private constructor(data: Record<string, string>) { this.#data = data }

  static async init(request: Request, _secrets: string[]): Promise<HydrogenSession> {
    const cookieHeader = request.headers.get('Cookie') ?? ''
    const match = cookieHeader.match(/hydrogen_session=([^;]+)/)
    try {
      return new HydrogenSession(match ? JSON.parse(atob(match[1])) : {})
    } catch {
      return new HydrogenSession({})
    }
  }

  get(key: string) { return this.#data[key] }
  set(key: string, value: string) { this.#data[key] = value; this.isPending = true }
  unset(key: string) { delete this.#data[key]; this.isPending = true }
  async commit() {
    return 'hydrogen_session=' + btoa(JSON.stringify(this.#data)) + '; Path=/; HttpOnly; SameSite=Lax'
  }
}

interface Env {
  SESSION_SECRET: string
  PUBLIC_STOREFRONT_API_TOKEN: string
  PUBLIC_STORE_DOMAIN: string
  PUBLIC_STOREFRONT_API_VERSION?: string
}
`;
}
function generateRootTsx(storeName) {
  return `import { useState } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from '@remix-run/react'
import { CartProvider } from '@shopify/hydrogen'
import type { LoaderFunctionArgs } from '@shopify/remix-oxygen'
import AnnouncementBar from '~/components/AnnouncementBar'
import Navigation from '~/components/Navigation'
import Footer from '~/components/Footer'
import Cart from '~/components/Cart'
import type { CartApiQueryFragment } from 'storefrontapi.generated'
import stylesheet from '~/styles/app.css?url'
import { theme } from '~/config/theme'

export async function loader({ context }: LoaderFunctionArgs) {
  const cart = await context.cart.get()
  return { cart }
}

export function links() {
  return [{ rel: 'stylesheet', href: stylesheet }]
}

export default function App() {
  const data = useRouteLoaderData<typeof loader>('root')
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${storeName}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <CartProvider>
          <AnnouncementBar
            text="Complimentary shipping on orders over £350 — worldwide delivery available"
            backgroundColor={theme.bg.dark}
            dismissible={true}
          />
          <Navigation
            logo="${storeName.toUpperCase()}"
            menuItems={[
              { label: 'Women', href: '/collections/women', children: [
                { label: 'Ready-to-Wear', href: '/collections/rtw' },
                { label: 'Accessories', href: '/collections/accessories' },
              ]},
              { label: 'Men', href: '/collections/men' },
              { label: 'New Arrivals', href: '/collections/new' },
            ]}
            sticky={true}
            onCartClick={() => setCartOpen(true)}
          />
          <main>
            <Outlet />
          </main>
          <Footer
            columns={[
              { heading: 'Collections', links: [
                { label: 'Women', href: '/collections/women' },
                { label: 'Men', href: '/collections/men' },
                { label: 'New Arrivals', href: '/collections/new' },
              ]},
              { heading: 'Support', links: [
                { label: 'Contact', href: '/contact' },
                { label: 'Shipping and Returns', href: '/shipping' },
              ]},
            ]}
            socialIcons={[{ platform: 'instagram', href: 'https://instagram.com' }]}
            showNewsletter={true}
          />
          <Cart
            cart={(data?.cart ?? null) as CartApiQueryFragment | null}
            open={cartOpen}
            onClose={() => setCartOpen(false)}
          />
        </CartProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
`;
}
function generateEntryClient() {
  return `import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  )
})
`;
}
function generateEntryServer() {
  return `import { PassThrough } from 'node:stream'
import type { EntryContext } from '@shopify/remix-oxygen'
import { RemixServer } from '@remix-run/react'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { createContentSecurityPolicy } from '@shopify/hydrogen'

const ABORT_DELAY = 5_000

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const { nonce, header, NonceProvider } = createContentSecurityPolicy()
  const userAgent = request.headers.get('user-agent')

  return new Promise<Response>((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider>
        <RemixServer context={remixContext} url={request.url} />
      </NonceProvider>,
      {
        nonce,
        onShellReady() {
          responseHeaders.set('Content-Type', 'text/html')
          responseHeaders.set('Content-Security-Policy', header)
          const body = new PassThrough()
          resolve(
            new Response(body as unknown as BodyInit, {
              status: responseStatusCode,
              headers: responseHeaders,
            }),
          )
          pipe(body)
        },
        onShellError: reject,
        onError(error: unknown) {
          console.error(error)
          responseStatusCode = isbot(userAgent ?? '') ? 500 : responseStatusCode
        },
      },
    )
    setTimeout(abort, ABORT_DELAY)
  })
}
`;
}
function generateCartRoute() {
  return `import { CartForm } from '@shopify/hydrogen'
import type { ActionFunctionArgs } from '@shopify/remix-oxygen'

export async function action({ request, context }: ActionFunctionArgs) {
  const { cart } = context
  const formData = await request.formData()
  const { action, inputs } = CartForm.getFormInput(formData)

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      return cart.addLines(inputs.lines)
    case CartForm.ACTIONS.LinesUpdate:
      return cart.updateLines(inputs.lines)
    case CartForm.ACTIONS.LinesRemove:
      return cart.removeLines(inputs.lineIds)
    default:
      throw new Error('Unhandled cart action: ' + action)
  }
}

export default function CartRoute() {
  return null
}
`;
}
function generatePackageJson(storeName) {
  const name = storeName.toLowerCase().replace(/\s+/g, "-");
  return JSON.stringify({
    name,
    private: true,
    version: "1.0.0",
    scripts: {
      build: "shopify hydrogen build",
      dev: "shopify hydrogen dev --codegen-unstable",
      preview: "shopify hydrogen preview",
      typecheck: "tsc --noEmit"
    },
    dependencies: {
      "@remix-run/react": "2.8.1",
      "@shopify/hydrogen": "2024.4.3",
      "@shopify/remix-oxygen": "2.0.7",
      graphql: "^16.6.0",
      isbot: "^4.1.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0"
    },
    devDependencies: {
      "@remix-run/dev": "2.8.1",
      "@shopify/cli": "3.61.0",
      "@shopify/mini-oxygen": "^3.0.0",
      "@shopify/oxygen-workers-types": "^4.0.0",
      "@types/react": "^18.2.60",
      "@types/react-dom": "^18.2.19",
      autoprefixer: "^10.4.17",
      postcss: "^8.4.35",
      tailwindcss: "^3.4.1",
      typescript: "^5.2.2",
      vite: "^5.1.0",
      "vite-tsconfig-paths": "^5.0.0"
    },
    engines: { node: ">=18.0.0" }
  }, null, 2);
}
function generateViteConfig() {
  return `import { defineConfig } from 'vite'
import { hydrogen } from '@shopify/hydrogen/vite'
import { oxygen } from '@shopify/mini-oxygen/vite'
import { vitePlugin as remix } from '@remix-run/dev'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    remix({
      presets: [hydrogen.preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: { assetsInlineLimit: 0 },
})
`;
}
function generateTsConfig() {
  return JSON.stringify({
    include: ["remix.env.d.ts", "**/*.ts", "**/*.tsx"],
    compilerOptions: {
      lib: ["DOM", "DOM.Iterable", "ES2022"],
      isolatedModules: true,
      esModuleInterop: true,
      jsx: "react-jsx",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      target: "ES2022",
      strict: true,
      allowJs: true,
      baseUrl: ".",
      paths: { "~/*": ["./app/*"] },
      noUnusedLocals: false,
      noUnusedParameters: false
    }
  }, null, 2);
}
function generateStorefrontApiShim() {
  return `declare module 'storefrontapi.generated' {
  interface CartLineItem {
    id: string
    quantity: number
    merchandise: {
      __typename: 'ProductVariant' | string
      id: string
      title: string
      price: { amount: string; currencyCode: string }
      product: { title: string; handle: string }
      image?: { url: string; altText: string | null; width?: number; height?: number }
    }
  }

  export interface CartApiQueryFragment {
    id: string
    checkoutUrl: string
    totalQuantity: number
    cost: {
      subtotalAmount: { amount: string; currencyCode: string }
      totalAmount: { amount: string; currencyCode: string }
    }
    lines: { nodes: CartLineItem[] }
  }

  export type OptimisticCartLine<_T> = CartLineItem & { isOptimistic?: boolean }
}
`;
}
function generateQueriesLib() {
  return "export const COLLECTION_QUERY = `" + COLLECTION_QUERY + "`\n\nexport const PRODUCT_QUERY = `" + PRODUCT_QUERY + "`\n\nexport const CART_QUERY = `" + CART_QUERY + "`\n";
}
function generateBoilerplate(storeName) {
  return {
    "package.json": generatePackageJson(storeName),
    "vite.config.ts": generateViteConfig(),
    "tsconfig.json": generateTsConfig(),
    "server.ts": generateServerTs(),
    "tailwind.config.js": "export default { content: ['./app/**/*.{js,jsx,ts,tsx}'], theme: { extend: {} }, plugins: [] }\n",
    "postcss.config.js": "export default { plugins: { tailwindcss: {}, autoprefixer: {} } }\n",
    ".env.example": "SESSION_SECRET=your_secret_here\nPUBLIC_STOREFRONT_API_TOKEN=your_token\nPUBLIC_STORE_DOMAIN=your-store.myshopify.com\nPUBLIC_STOREFRONT_API_VERSION=2024-04\n",
    "public/favicon.svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#0a0a0a"/></svg>\n',
    "app/styles/app.css": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
    "app/lib/queries.ts": generateQueriesLib(),
    "app/types/storefrontapi.d.ts": generateStorefrontApiShim(),
    "app/root.tsx": generateRootTsx(storeName),
    "app/entry.client.tsx": generateEntryClient(),
    "app/entry.server.tsx": generateEntryServer(),
    "app/routes/cart.tsx": generateCartRoute()
  };
}
const AnnouncementBarSource = "import { useState } from 'react'\nimport { theme } from '../theme/config'\n\nexport interface AnnouncementBarProps {\n  text: string\n  backgroundColor: string\n  dismissible: boolean\n}\n\nexport const defaultProps: AnnouncementBarProps = {\n  text: 'Complimentary shipping on orders over £350 — worldwide delivery available',\n  backgroundColor: theme.bg.dark,\n  dismissible: true,\n}\n\nexport default function AnnouncementBar({ text, backgroundColor, dismissible }: AnnouncementBarProps) {\n  const [dismissed, setDismissed] = useState(false)\n\n  if (dismissed) return null\n\n  return (\n    <div className={`w-full py-2.5 px-4 flex items-center justify-center relative ${backgroundColor}`}>\n      <p className={`text-xs tracking-widest uppercase ${theme.text.onDark}`}>{text}</p>\n      {dismissible && (\n        <button\n          onClick={() => setDismissed(true)}\n          className={`absolute right-4 ${theme.text.muted} ${theme.hover.textOnDark} transition-colors text-base leading-none`}\n          aria-label=\"Dismiss\"\n        >\n          ×\n        </button>\n      )}\n    </div>\n  )\n}\n";
const CTABlockSource = "import { theme } from '../theme/config'\n\nexport interface CTABlockProps {\n  heading: string\n  body: string\n  buttonText: string\n  buttonLink: string\n  backgroundColor: string\n}\n\nexport const defaultProps: CTABlockProps = {\n  heading: 'The New Collection',\n  body: 'Considered design. Exceptional materials. Available now.',\n  buttonText: 'Explore',\n  buttonLink: '/collections/new',\n  backgroundColor: theme.bg.light,\n}\n\nexport default function CTABlock({ heading, body, buttonText, buttonLink, backgroundColor }: CTABlockProps) {\n  return (\n    <section className={`w-full py-24 md:py-36 px-6 ${backgroundColor}`}>\n      <div className=\"max-w-2xl mx-auto text-center flex flex-col items-center gap-8\">\n        <h2 className={`text-4xl md:text-6xl ${theme.font.heading} tracking-tight ${theme.text.primary}`}>{heading}</h2>\n        <p className={`text-sm ${theme.font.body} tracking-wide ${theme.text.body} max-w-md`}>{body}</p>\n        <a\n          href={buttonLink}\n          className={`inline-block border ${theme.border.primary} px-8 py-3 text-xs tracking-widest uppercase ${theme.text.primary} ${theme.hover.bgDark} ${theme.hover.textWhite} transition-colors duration-300`}\n        >\n          {buttonText}\n        </a>\n      </div>\n    </section>\n  )\n}\n";
const HeroSectionSource = "import { theme } from '../theme/config'\n\nexport interface HeroSectionProps {\n  heading: string\n  subheading: string\n  ctaText: string\n  ctaLink: string\n  backgroundImage: string\n  overlayOpacity: number\n  variant: 'full-bleed' | 'split'\n}\n\nexport const defaultProps: HeroSectionProps = {\n  heading: 'The Quietude Collection',\n  subheading: 'Autumn / Winter 2026',\n  ctaText: 'Discover',\n  ctaLink: '/collections/quietude',\n  backgroundImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400',\n  overlayOpacity: 0.25,\n  variant: 'full-bleed',\n}\n\nfunction FullBleedLayout({ heading, subheading, ctaText, ctaLink, backgroundImage, overlayOpacity }: Omit<HeroSectionProps, 'variant'>) {\n  return (\n    <section className=\"relative w-full h-screen overflow-hidden\">\n      <img src={backgroundImage} alt=\"\" className=\"absolute inset-0 w-full h-full object-cover\" />\n      {/* overlay opacity is a dynamic decimal — cannot use Tailwind class without safelisting */}\n      <div className={`absolute inset-0 ${theme.bg.dark}`} style={{ opacity: overlayOpacity }} />\n      <div className=\"absolute bottom-12 left-8 md:left-16 flex flex-col gap-4\">\n        <p className={`text-xs tracking-widest uppercase ${theme.text.footerLink}`}>{subheading}</p>\n        <h1 className={`text-5xl md:text-7xl ${theme.font.heading} ${theme.text.white} max-w-lg leading-none`}>{heading}</h1>\n        <a\n          href={ctaLink}\n          className={`self-start border ${theme.border.white} px-8 py-3 text-xs tracking-widest uppercase ${theme.text.white} ${theme.hover.bgWhite} ${theme.hover.textPrimary} transition-colors duration-300`}\n        >\n          {ctaText}\n        </a>\n      </div>\n    </section>\n  )\n}\n\nfunction SplitLayout({ heading, subheading, ctaText, ctaLink, backgroundImage, overlayOpacity }: Omit<HeroSectionProps, 'variant'>) {\n  return (\n    <section className=\"flex flex-col md:flex-row w-full min-h-screen\">\n      <div className=\"relative w-full md:w-1/2 h-72 md:h-auto overflow-hidden\">\n        <img src={backgroundImage} alt=\"\" className=\"w-full h-full object-cover\" />\n        <div className={`absolute inset-0 ${theme.bg.dark}`} style={{ opacity: overlayOpacity }} />\n      </div>\n      <div className={`w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-16 gap-6 ${theme.bg.light}`}>\n        <p className={`text-xs tracking-widest uppercase ${theme.text.accent}`}>{subheading}</p>\n        <h1 className={`text-4xl md:text-6xl ${theme.font.heading} ${theme.text.primary} leading-none`}>{heading}</h1>\n        <a\n          href={ctaLink}\n          className={`self-start border ${theme.border.primary} px-8 py-3 text-xs tracking-widest uppercase ${theme.text.primary} ${theme.hover.bgDark} ${theme.hover.textWhite} transition-colors duration-300`}\n        >\n          {ctaText}\n        </a>\n      </div>\n    </section>\n  )\n}\n\nexport default function HeroSection(props: HeroSectionProps) {\n  return props.variant === 'split'\n    ? <SplitLayout {...props} />\n    : <FullBleedLayout {...props} />\n}\n";
const FooterSource = "import type { FooterColumn, SocialLink, SocialPlatform } from './types'\nimport { theme } from '../theme/config'\n\nexport interface FooterProps {\n  columns: FooterColumn[]\n  socialIcons: SocialLink[]\n  showNewsletter: boolean\n}\n\nexport const defaultProps: FooterProps = {\n  columns: [\n    { heading: 'Collections', links: [\n      { label: 'Women', href: '/collections/women' },\n      { label: 'Men', href: '/collections/men' },\n      { label: 'New Arrivals', href: '/collections/new' },\n    ]},\n    { heading: 'House', links: [\n      { label: 'About', href: '/about' },\n      { label: 'Careers', href: '/careers' },\n      { label: 'Press', href: '/press' },\n    ]},\n    { heading: 'Support', links: [\n      { label: 'Shipping & Returns', href: '/shipping' },\n      { label: 'Size Guide', href: '/size-guide' },\n      { label: 'Contact', href: '/contact' },\n    ]},\n  ],\n  socialIcons: [\n    { platform: 'instagram', href: 'https://instagram.com' },\n    { platform: 'pinterest', href: 'https://pinterest.com' },\n  ],\n  showNewsletter: true,\n}\n\nconst SOCIAL_SYMBOLS: Record<SocialPlatform, string> = {\n  instagram: '◉',\n  pinterest: '◈',\n  twitter: '◇',\n  tiktok: '◆',\n}\n\nfunction FooterColumnBlock({ column }: { column: FooterColumn }) {\n  return (\n    <div>\n      <p className={`text-xs tracking-widest uppercase ${theme.text.muted} mb-6`}>{column.heading}</p>\n      {column.links.map((link) => (\n        <a key={link.href} href={link.href} className={`block text-sm ${theme.font.body} ${theme.text.footerLink} ${theme.hover.textWhite} transition-colors mb-2`}>\n          {link.label}\n        </a>\n      ))}\n    </div>\n  )\n}\n\nfunction SocialIconLink({ link }: { link: SocialLink }) {\n  return (\n    <a href={link.href} className={`${theme.text.muted} ${theme.hover.textWhite} transition-colors text-lg`} aria-label={link.platform}>\n      {SOCIAL_SYMBOLS[link.platform]}\n    </a>\n  )\n}\n\nexport default function Footer({ columns, socialIcons, showNewsletter }: FooterProps) {\n  return (\n    <footer className={`${theme.bg.dark} ${theme.text.onDark}`}>\n      <div className=\"max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12\">\n        <div className=\"flex flex-col gap-6\">\n          <p className=\"text-sm tracking-widest font-medium\">MAISON</p>\n          <div className=\"flex gap-4\">\n            {socialIcons.map((link) => <SocialIconLink key={link.platform} link={link} />)}\n          </div>\n        </div>\n        {columns.map((col) => <FooterColumnBlock key={col.heading} column={col} />)}\n      </div>\n\n      {showNewsletter && (\n        <div className={`border-t ${theme.border.divider} max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>\n          <p className={`text-xs tracking-widest uppercase ${theme.text.muted}`}>Subscribe to the journal</p>\n          <div className=\"flex gap-6 items-end w-full md:w-auto\">\n            <input\n              type=\"email\"\n              placeholder=\"Your email address\"\n              className={`bg-transparent border-b ${theme.border.input} ${theme.focus.borderWhite} outline-none text-sm ${theme.text.onDark} ${theme.placeholder.muted} pb-1 w-full md:w-64 transition-colors`}\n            />\n            <button className={`text-xs tracking-widest uppercase ${theme.text.muted} ${theme.hover.textWhite} shrink-0 transition-colors`}>\n              Subscribe\n            </button>\n          </div>\n        </div>\n      )}\n\n      <div className={`border-t ${theme.border.divider} max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${theme.text.meta} tracking-wide`}>\n        <p>© 2026 Maison. All rights reserved.</p>\n        <div className=\"flex gap-6\">\n          <a href=\"/privacy\" className={`${theme.hover.textFooter} transition-colors`}>Privacy</a>\n          <a href=\"/terms\" className={`${theme.hover.textFooter} transition-colors`}>Terms</a>\n        </div>\n      </div>\n    </footer>\n  )\n}\n";
const FeatureSectionSource = "import type { Feature } from './types'\nimport { theme } from '../theme/config'\n\nexport interface FeatureSectionProps {\n  heading: string\n  features: Feature[]\n}\n\nexport const defaultProps: FeatureSectionProps = {\n  heading: 'Our Promise',\n  features: [\n    { icon: '→', title: 'Complimentary Shipping', description: 'On all orders over £350, worldwide.' },\n    { icon: '○', title: 'Easy Returns', description: 'Thirty days, no questions asked.' },\n    { icon: '◇', title: 'Sustainable Materials', description: 'Responsible sourcing throughout.' },\n    { icon: '∞', title: 'Lifetime Care', description: 'Repair and restoration for all pieces.' },\n  ],\n}\n\nfunction FeatureCard({ feature, isLast }: { feature: Feature; isLast: boolean }) {\n  return (\n    <div className={`flex flex-col gap-4 px-0 md:px-8 first:pl-0 ${isLast ? '' : `border-b md:border-b-0 md:border-r ${theme.border.subtle} pb-8 md:pb-0`}`}>\n      <span className={`text-2xl ${theme.text.muted}`}>{feature.icon}</span>\n      <p className={`text-xs tracking-widest uppercase ${theme.text.primary}`}>{feature.title}</p>\n      <p className={`text-sm ${theme.font.body} ${theme.text.body} leading-relaxed`}>{feature.description}</p>\n    </div>\n  )\n}\n\nexport default function FeatureSection({ heading, features }: FeatureSectionProps) {\n  const gridCols = features.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'\n\n  return (\n    <section className={`w-full ${theme.bg.light} py-16 px-6`}>\n      <div className=\"max-w-7xl mx-auto\">\n        {heading && (\n          <p className={`text-xs tracking-widest uppercase ${theme.text.accent} mb-12`}>{heading}</p>\n        )}\n        <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-8 md:gap-0`}>\n          {features.map((feature, index) => (\n            <FeatureCard key={feature.title} feature={feature} isLast={index === features.length - 1} />\n          ))}\n        </div>\n      </div>\n    </section>\n  )\n}\n";
const ProductGridSource = "import type { ProductItem } from './types'\nimport { theme } from '../theme/config'\n\nexport interface ProductGridProps {\n  columns: 2 | 3 | 4\n  productsPerPage: number\n  collectionHandle: string\n}\n\nexport const defaultProps: ProductGridProps = {\n  columns: 3,\n  productsPerPage: 6,\n  collectionHandle: 'new-arrivals',\n}\n\nconst MOCK_PRODUCTS: ProductItem[] = [\n  { title: 'Slip Dress No. 3', price: '£890', imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600', handle: 'slip-dress-no-3' },\n  { title: 'Wide-Leg Trouser', price: '£650', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', handle: 'wide-leg-trouser' },\n  { title: 'Cashmere Turtleneck', price: '£520', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600', handle: 'cashmere-turtleneck' },\n  { title: 'Structured Blazer', price: '£1,200', imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600', handle: 'structured-blazer' },\n  { title: 'Linen Shirt Dress', price: '£480', imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600', handle: 'linen-shirt-dress' },\n  { title: 'Merino Knit', price: '£395', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', handle: 'merino-knit' },\n]\n\nconst COL_CLASSES: Record<2 | 3 | 4, string> = {\n  2: 'grid-cols-2',\n  3: 'grid-cols-2 md:grid-cols-3',\n  4: 'grid-cols-2 md:grid-cols-4',\n}\n\nfunction ProductCard({ product }: { product: ProductItem }) {\n  return (\n    <a href={`/products/${product.handle}`} className=\"group cursor-pointer\">\n      <div className={`relative overflow-hidden aspect-[3/4] ${theme.bg.light}`}>\n        <img\n          src={product.imageUrl}\n          alt={product.title}\n          className=\"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105\"\n        />\n      </div>\n      <div className=\"mt-3 flex flex-col gap-1\">\n        <p className={`text-xs tracking-wide ${theme.text.primary}`}>{product.title}</p>\n        <p className={`text-xs ${theme.text.accent}`}>{product.price}</p>\n      </div>\n    </a>\n  )\n}\n\nexport default function ProductGrid({ columns, productsPerPage, collectionHandle }: ProductGridProps) {\n  const visibleProducts = MOCK_PRODUCTS.slice(0, productsPerPage)\n\n  return (\n    <section className=\"w-full max-w-7xl mx-auto px-4 md:px-6 py-12\" data-collection={collectionHandle}>\n      <div className={`grid ${COL_CLASSES[columns]} gap-4 md:gap-6`}>\n        {visibleProducts.map((product) => (\n          <ProductCard key={product.handle} product={product} />\n        ))}\n      </div>\n    </section>\n  )\n}\n";
const TypesSource = "export interface FooterColumn {\n  heading: string\n  links: { label: string; href: string }[]\n}\n\nexport type SocialPlatform = 'instagram' | 'twitter' | 'pinterest' | 'tiktok'\n\nexport interface SocialLink {\n  platform: SocialPlatform\n  href: string\n}\n\nexport interface MenuItem {\n  label: string\n  href: string\n  children?: { label: string; href: string }[]\n}\n\nexport interface ProductItem {\n  title: string\n  price: string\n  imageUrl: string\n  handle: string\n}\n\nexport interface Feature {\n  icon: string\n  title: string\n  description: string\n}\n";
const ThemeSource = "export const theme = {\n  bg: {\n    dark: 'bg-neutral-950',\n    light: 'bg-neutral-100',\n    white: 'bg-white',\n    overlay: 'bg-black/30',\n  },\n  text: {\n    primary: 'text-neutral-950',\n    onDark: 'text-neutral-100',\n    white: 'text-white',\n    muted: 'text-neutral-400',\n    link: 'text-neutral-600',\n    accent: 'text-zinc-400',\n    body: 'text-zinc-500',\n    footerLink: 'text-neutral-300',\n    meta: 'text-neutral-500',\n  },\n  border: {\n    primary: 'border-neutral-950',\n    light: 'border-neutral-100',\n    subtle: 'border-neutral-200',\n    divider: 'border-neutral-800',\n    input: 'border-neutral-600',\n    white: 'border-white',\n  },\n  hover: {\n    bgDark: 'hover:bg-neutral-950',\n    bgWhite: 'hover:bg-white',\n    bgMid: 'hover:bg-neutral-700',\n    textPrimary: 'hover:text-neutral-950',\n    textWhite: 'hover:text-white',\n    textOnDark: 'hover:text-neutral-100',\n    textFooter: 'hover:text-neutral-300',\n    borderPrimary: 'hover:border-neutral-950',\n  },\n  font: {\n    heading: 'font-thin',\n    body: 'font-light',\n  },\n  focus: {\n    borderWhite: 'focus:border-white',\n  },\n  placeholder: {\n    muted: 'placeholder:text-neutral-500',\n  },\n} as const\n";
const ADAPTED_NAVIGATION = `import { useState } from 'react'
import type { MenuItem } from '~/components/types'
import { theme } from '~/config/theme'

export interface NavigationProps {
  logo: string
  menuItems: MenuItem[]
  sticky: boolean
  onCartClick?: () => void
}

export const defaultProps: NavigationProps = {
  logo: 'MAISON',
  menuItems: [
    { label: 'Women', href: '/collections/women', children: [
      { label: 'Ready-to-Wear', href: '/collections/rtw' },
      { label: 'Accessories', href: '/collections/accessories' },
      { label: 'Shoes', href: '/collections/shoes' },
    ]},
    { label: 'Men', href: '/collections/men', children: [
      { label: 'Ready-to-Wear', href: '/collections/men-rtw' },
      { label: 'Accessories', href: '/collections/men-accessories' },
    ]},
    { label: 'New Arrivals', href: '/collections/new' },
    { label: 'Sale', href: '/collections/sale' },
  ],
  sticky: true,
}

function MegaMenuItem({ item }: { item: MenuItem }) {
  return (
    <li className="relative group">
      <a href={item.href} className={'text-xs tracking-widest uppercase ' + theme.text.link + ' ' + theme.hover.textPrimary + ' transition-colors'}>
        {item.label}
      </a>
      {item.children && (
        <div className="absolute top-full left-0 pt-3 hidden group-hover:block z-50">
          <div className={'border shadow-sm py-6 px-8 flex flex-col gap-3 min-w-48 ' + theme.bg.white + ' ' + theme.border.light}>
            {item.children.map((child) => (
              <a key={child.href} href={child.href} className={'text-xs tracking-wide transition-colors whitespace-nowrap ' + theme.text.body + ' ' + theme.hover.textPrimary}>
                {child.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}

function MobileMenu({ items, onClose }: { items: MenuItem[]; onClose: () => void }) {
  return (
    <div className={'fixed inset-0 z-40 flex flex-col pt-16 px-8 gap-1 ' + theme.bg.white}>
      <button onClick={onClose} className={'absolute top-5 right-6 text-2xl leading-none ' + theme.text.muted + ' ' + theme.hover.textPrimary} aria-label="Close menu">×</button>
      {items.map((item) => (
        <div key={item.href} className={'py-3 border-b ' + theme.border.light}>
          <a href={item.href} className={'text-sm tracking-widest uppercase ' + theme.text.primary}>{item.label}</a>
          {item.children && (
            <div className="mt-3 flex flex-col gap-2 pl-4">
              {item.children.map((child) => (
                <a key={child.href} href={child.href} className={'text-xs tracking-wide ' + theme.text.body}>{child.label}</a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Navigation({ logo, menuItems, sticky, onCartClick }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <nav className={'w-full border-b ' + theme.bg.white + ' ' + theme.border.light + ' ' + (sticky ? 'sticky top-0 z-50' : '')}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className={'text-sm tracking-widest font-medium ' + theme.text.primary}>{logo}</a>
          <ul className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => <MegaMenuItem key={item.href} item={item} />)}
          </ul>
          <div className="flex items-center gap-4">
            {onCartClick && (
              <button onClick={onCartClick} className={'hidden md:block text-xs tracking-widest uppercase transition-colors ' + theme.text.link + ' ' + theme.hover.textPrimary} aria-label="Open cart">
                Bag
              </button>
            )}
            <button onClick={() => setIsOpen(true)} className={'md:hidden text-xs tracking-widest uppercase ' + theme.text.primary} aria-label="Open menu">
              Menu
            </button>
          </div>
        </div>
      </nav>
      {isOpen && <MobileMenu items={menuItems} onClose={() => setIsOpen(false)} />}
    </>
  )
}
`;
const ADAPTED_PRODUCT_DETAIL = `import { useState } from 'react'
import { CartForm } from '@shopify/hydrogen'
import { theme } from '~/config/theme'

interface HydrogenVariant {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: { name: string; value: string }[]
  price: { amount: string; currencyCode: string }
}

interface HydrogenImage {
  url: string
  altText: string | null
  width?: number
  height?: number
}

interface HydrogenProduct {
  id: string
  title: string
  descriptionHtml: string
  handle: string
  variants: { nodes: HydrogenVariant[] }
  images: { nodes: HydrogenImage[] }
  options: { name: string; values: string[] }[]
}

export interface ProductDetailProps {
  layout: 'stacked' | 'side-by-side'
  showReviewsPlaceholder: boolean
  showRelated: boolean
  product?: HydrogenProduct
}

export const defaultProps: ProductDetailProps = {
  layout: 'side-by-side',
  showReviewsPlaceholder: true,
  showRelated: true,
}

const MOCK_PRODUCT = {
  title: 'Cashmere Wrap Coat',
  price: 'From £2,450',
  description: 'Crafted in double-faced cashmere, this wrap coat exemplifies considered construction. The belt is removable; the silhouette, permanent.',
  images: [
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
  ],
  sizes: ['XS', 'S', 'M', 'L'],
}

const RELATED = [
  { title: 'Wool Midi Skirt', price: '£680', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400', handle: 'wool-midi-skirt' },
  { title: 'Silk Blouse', price: '£420', imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', handle: 'silk-blouse' },
]

export default function ProductDetail({ layout, showReviewsPlaceholder, showRelated, product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  const wrapperClass = layout === 'side-by-side'
    ? 'flex flex-col md:flex-row gap-8 md:gap-16'
    : 'flex flex-col gap-10'

  const images = product?.images.nodes ?? MOCK_PRODUCT.images.map((url) => ({ url, altText: null }))
  const mainImage = images[activeImage] ?? images[0]
  const title = product?.title ?? MOCK_PRODUCT.title
  const sizes = product?.options.find((o) => o.name === 'Size')?.values ?? MOCK_PRODUCT.sizes

  const selectedVariant = selectedSize
    ? product?.variants.nodes.find((v) => v.selectedOptions.some((o) => o.name === 'Size' && o.value === selectedSize))
    : product?.variants.nodes[0]

  const priceDisplay = selectedVariant
    ? selectedVariant.price.currencyCode + ' ' + selectedVariant.price.amount
    : MOCK_PRODUCT.price

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className={wrapperClass}>
        <div className="w-full md:w-1/2">
          <div className={'aspect-[3/4] overflow-hidden ' + theme.bg.light}>
            <img src={mainImage.url} alt={mainImage.altText ?? title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActiveImage(i)}
                  className={'w-16 h-20 overflow-hidden border-2 transition-colors ' + (activeImage === i ? theme.border.primary : 'border-transparent')}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-6 md:pt-8">
          <div>
            <h1 className={'text-3xl md:text-4xl tracking-tight ' + theme.font.heading + ' ' + theme.text.primary}>{title}</h1>
            <p className={'mt-2 text-sm ' + theme.text.accent}>{priceDisplay}</p>
          </div>
          <div className="flex flex-col gap-3">
            <p className={'text-xs tracking-widest uppercase ' + theme.text.accent}>Select Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={'w-10 h-10 flex items-center justify-center text-xs tracking-wide border transition-colors ' + (selectedSize === size ? theme.border.primary + ' ' + theme.bg.dark + ' ' + theme.text.white : theme.border.subtle + ' ' + theme.text.primary + ' ' + theme.hover.borderPrimary)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {product ? (
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesAdd}
              inputs={{ lines: [{ merchandiseId: selectedVariant?.id ?? '', quantity: 1 }] }}
            >
              <button
                type="submit"
                disabled={selectedVariant ? !selectedVariant.availableForSale : false}
                className={'w-full md:max-w-xs border py-4 text-xs tracking-widest uppercase transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ' + theme.border.primary + ' ' + theme.bg.dark + ' ' + theme.text.white + ' ' + theme.hover.bgWhite + ' ' + theme.hover.textPrimary}
              >
                {selectedVariant?.availableForSale === false ? 'Sold Out' : 'Add to Bag'}
              </button>
            </CartForm>
          ) : (
            <button className={'w-full md:max-w-xs border py-4 text-xs tracking-widest uppercase transition-colors duration-300 ' + theme.border.primary + ' ' + theme.bg.dark + ' ' + theme.text.white + ' ' + theme.hover.bgWhite + ' ' + theme.hover.textPrimary}>
              Add to Bag
            </button>
          )}
          {product ? (
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} className={'text-sm leading-relaxed max-w-md ' + theme.font.body + ' ' + theme.text.body} />
          ) : (
            <p className={'text-sm leading-relaxed max-w-md ' + theme.font.body + ' ' + theme.text.body}>{MOCK_PRODUCT.description}</p>
          )}
        </div>
      </div>

      {showReviewsPlaceholder && (
        <div className={'mt-16 pt-12 border-t ' + theme.border.light}>
          <p className={'text-xs tracking-widest uppercase mb-6 ' + theme.text.accent}>Reviews</p>
          <div className="flex flex-col gap-4 max-w-lg">
            <div className={'h-4 rounded w-3/4 ' + theme.bg.light} />
            <div className={'h-4 rounded w-full ' + theme.bg.light} />
            <div className={'h-4 rounded w-2/3 ' + theme.bg.light} />
          </div>
        </div>
      )}

      {showRelated && (
        <div className={'mt-16 pt-12 border-t ' + theme.border.light}>
          <p className={'text-xs tracking-widest uppercase mb-8 ' + theme.text.accent}>You May Also Like</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {RELATED.map((item) => (
              <a key={item.handle} href={'/products/' + item.handle} className="group">
                <div className={'aspect-[3/4] overflow-hidden ' + theme.bg.light}>
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className={'mt-3 text-xs tracking-wide ' + theme.text.primary}>{item.title}</p>
                <p className={'mt-1 text-xs ' + theme.text.accent}>{item.price}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
`;
const TYPES_PATH = /from '\.\/types'/g;
const TYPES_PATH_REPLACE = "from '~/components/types'";
const THEME_PATH = /from '\.\.\/theme\/config'/g;
const THEME_PATH_REPLACE = "from '~/config/theme'";
function fixImports(source) {
  return source.replace(TYPES_PATH, TYPES_PATH_REPLACE).replace(THEME_PATH, THEME_PATH_REPLACE);
}
function adaptProductGrid(source) {
  let s = fixImports(source);
  s = s.replace(
    "  collectionHandle: string\n}",
    "  collectionHandle: string\n  products?: ProductItem[]\n}"
  );
  s = s.replace(
    "{ columns, productsPerPage, collectionHandle }",
    "{ columns, productsPerPage, collectionHandle, products }"
  );
  s = s.replace(
    "const visibleProducts = MOCK_PRODUCTS.slice(0, productsPerPage)",
    "const visibleProducts = (products ?? MOCK_PRODUCTS).slice(0, productsPerPage)"
  );
  return s;
}
const COMPONENT_MAP = {
  AnnouncementBar: () => fixImports(AnnouncementBarSource),
  CTABlock: () => fixImports(CTABlockSource),
  HeroSection: () => fixImports(HeroSectionSource),
  Navigation: () => ADAPTED_NAVIGATION,
  Footer: () => fixImports(FooterSource),
  FeatureSection: () => fixImports(FeatureSectionSource),
  ProductGrid: () => adaptProductGrid(ProductGridSource),
  ProductDetail: () => ADAPTED_PRODUCT_DETAIL
};
function generateComponentFiles(used) {
  const files2 = {
    "app/components/types.ts": TypesSource,
    "app/config/theme.ts": ThemeSource
  };
  for (const type of used) {
    files2[`app/components/${type}.tsx`] = COMPONENT_MAP[type]();
  }
  return files2;
}
const CART_TSX = `import { CartForm, Money } from '@shopify/hydrogen'
import type { CartApiQueryFragment } from 'storefrontapi.generated'
import CartLineItem from './CartLineItem'
import { theme } from '~/config/theme'

interface CartProps {
  cart: CartApiQueryFragment | null
  open: boolean
  onClose: () => void
}

export default function Cart({ cart, open, onClose }: CartProps) {
  const lines = cart?.lines?.nodes ?? []

  return (
    <>
      {open && (
        <div className={'fixed inset-0 z-40 ' + theme.bg.overlay} onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={'fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ' + theme.bg.white + ' ' + (open ? 'translate-x-0' : 'translate-x-full')}
        aria-label="Cart"
      >
        <div className={'flex items-center justify-between px-6 py-5 border-b ' + theme.border.light}>
          <p className="text-xs tracking-widest uppercase">Your Bag ({cart?.totalQuantity ?? 0})</p>
          <button onClick={onClose} className={'text-xl leading-none ' + theme.text.muted + ' ' + theme.hover.textPrimary} aria-label="Close cart">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <p className={'text-sm mt-8 text-center tracking-wide ' + theme.text.accent}>Your bag is empty</p>
          ) : (
            lines.map((line) => <CartLineItem key={line.id} line={line} />)
          )}
        </div>
        {lines.length > 0 && (
          <div className={'border-t px-6 py-6 flex flex-col gap-4 ' + theme.border.light}>
            <div className="flex justify-between text-xs tracking-widest uppercase">
              <span>Subtotal</span>
              {cart?.cost?.subtotalAmount && <Money data={cart.cost.subtotalAmount} />}
            </div>
            <a
              href={cart?.checkoutUrl ?? '#'}
              className={'block w-full text-center py-4 text-xs tracking-widest uppercase transition-colors ' + theme.bg.dark + ' ' + theme.text.white + ' ' + theme.hover.bgMid}
            >
              Checkout
            </a>
          </div>
        )}
      </aside>
    </>
  )
}
`;
const CART_LINE_ITEM_TSX = `import { CartForm, Money } from '@shopify/hydrogen'
import type { CartApiQueryFragment } from 'storefrontapi.generated'
import { theme } from '~/config/theme'

type CartLine = CartApiQueryFragment['lines']['nodes'][number]

export default function CartLineItem({ line }: { line: CartLine }) {
  const { merchandise, quantity } = line
  if (merchandise.__typename !== 'ProductVariant') return null

  return (
    <div className={'flex gap-4 py-4 border-b last:border-0 ' + theme.border.light}>
      {merchandise.image && (
        <img
          src={merchandise.image.url}
          alt={merchandise.image.altText ?? merchandise.product.title}
          className={'w-20 h-24 object-cover ' + theme.bg.light}
        />
      )}
      <div className="flex-1 flex flex-col gap-1">
        <p className={'text-xs tracking-wide ' + theme.text.primary}>{merchandise.product.title}</p>
        <p className={'text-xs ' + theme.text.accent}>{merchandise.title}</p>
        <Money data={merchandise.price} className={'text-xs mt-1 ' + theme.text.accent} />
        <div className="flex items-center gap-3 mt-2">
          {quantity > 1 ? (
            <CartForm route="/cart" action={CartForm.ACTIONS.LinesUpdate} inputs={{ lines: [{ id: line.id, quantity: quantity - 1 }] }}>
              <button type="submit" className={'w-6 h-6 border text-xs flex items-center justify-center ' + theme.border.subtle + ' ' + theme.hover.borderPrimary} aria-label="Decrease">−</button>
            </CartForm>
          ) : (
            <CartForm route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{ lineIds: [line.id] }}>
              <button type="submit" className={'w-6 h-6 border text-xs flex items-center justify-center ' + theme.border.subtle + ' ' + theme.hover.borderPrimary} aria-label="Remove">−</button>
            </CartForm>
          )}
          <span className="text-xs tabular-nums">{quantity}</span>
          <CartForm route="/cart" action={CartForm.ACTIONS.LinesUpdate} inputs={{ lines: [{ id: line.id, quantity: quantity + 1 }] }}>
            <button type="submit" className={'w-6 h-6 border text-xs flex items-center justify-center ' + theme.border.subtle + ' ' + theme.hover.borderPrimary} aria-label="Increase">+</button>
          </CartForm>
          <CartForm route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{ lineIds: [line.id] }}>
            <button type="submit" className={'ml-auto text-xs ' + theme.text.accent + ' ' + theme.hover.textPrimary}>Remove</button>
          </CartForm>
        </div>
      </div>
    </div>
  )
}
`;
function generateCartFiles() {
  return {
    "app/components/Cart.tsx": CART_TSX,
    "app/components/CartLineItem.tsx": CART_LINE_ITEM_TSX
  };
}
function serializeValue(value) {
  if (value === null) return "null";
  if (value === void 0) return "undefined";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "function") {
    throw new Error("Cannot serialize function values in component props");
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map(serializeValue).join(", ");
    return `[${items}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    const props = entries.map(([k, v]) => `${k}: ${serializeValue(v)}`).join(", ");
    return `{ ${props} }`;
  }
  return String(value);
}
function serializeProps(props) {
  return Object.entries(props).map(([key, value]) => {
    if (typeof value === "string") return `${key}=${JSON.stringify(value)}`;
    return `${key}={${serializeValue(value)}}`;
  }).join("\n    ");
}
const LAYOUT_COMPONENTS = /* @__PURE__ */ new Set(["Navigation", "AnnouncementBar", "Footer"]);
const DATA_COMPONENTS = /* @__PURE__ */ new Set(["ProductGrid", "ProductDetail"]);
function pathToFilename(path) {
  if (path === "/") return "_index";
  return path.replace(/^\//, "").replace(/:([a-zA-Z]+)/g, "$$1").replace(/\//g, ".");
}
function needsLoader(components) {
  return components.some((c) => DATA_COMPONENTS.has(c.type));
}
function buildImports(components, hasLoader) {
  const types = [...new Set(components.filter((c) => !LAYOUT_COMPONENTS.has(c.type)).map((c) => c.type))];
  const lines = [];
  if (hasLoader) {
    lines.push("import type { LoaderFunctionArgs } from '@shopify/remix-oxygen'");
    lines.push("import { useLoaderData } from '@remix-run/react'");
  }
  for (const type of types) {
    lines.push(`import ${type} from '~/components/${type}'`);
  }
  const needsCollectionQuery = components.some((c) => c.type === "ProductGrid");
  const needsProductQuery = components.some((c) => c.type === "ProductDetail");
  if (needsCollectionQuery || needsProductQuery) {
    const queries = [];
    if (needsCollectionQuery) queries.push("COLLECTION_QUERY");
    if (needsProductQuery) queries.push("PRODUCT_QUERY");
    lines.push(`import { ${queries.join(", ")} } from '~/lib/queries'`);
  }
  return lines.join("\n");
}
function buildLoader(components) {
  const hasGrid = components.some((c) => c.type === "ProductGrid");
  const hasDetail = components.some((c) => c.type === "ProductDetail");
  const loaderArgs = hasDetail ? "{ context, params }" : "{ context }";
  const lines = [
    `export async function loader(${loaderArgs}: LoaderFunctionArgs) {`,
    "  const { storefront } = context",
    "  const loaderData: Record<string, unknown> = {}"
  ];
  if (hasGrid) {
    const grid = components.find((c) => c.type === "ProductGrid");
    const handle = (grid == null ? void 0 : grid.props.collectionHandle) ?? "new-arrivals";
    const first = (grid == null ? void 0 : grid.props.productsPerPage) ?? 6;
    lines.push(
      `  const { collection } = await storefront.query(COLLECTION_QUERY, {`,
      `    variables: { handle: ${JSON.stringify(handle)}, first: ${first} },`,
      `  })`,
      `  loaderData.products = collection?.products?.nodes ?? []`
    );
  }
  if (hasDetail) {
    lines.push(
      `  const { handle } = params`,
      `  if (!handle) throw new Response('Not found', { status: 404 })`,
      `  const { product } = await storefront.query(PRODUCT_QUERY, {`,
      `    variables: { handle },`,
      `  })`,
      `  if (!product) throw new Response('Not found', { status: 404 })`,
      `  loaderData.product = product`
    );
  }
  lines.push("  return loaderData", "}");
  return lines.join("\n");
}
function buildJsx(components, hasLoader) {
  const pageComponents = components.filter((c) => !LAYOUT_COMPONENTS.has(c.type));
  if (pageComponents.length === 0) return "  return null";
  const loaderLine = hasLoader ? "  const loaderData = useLoaderData<typeof loader>()\n" : "";
  const jsxLines = pageComponents.map((comp) => {
    const extraProps = {};
    if (comp.type === "ProductGrid") extraProps.products = "{loaderData.products}";
    if (comp.type === "ProductDetail") extraProps.product = "{loaderData.product}";
    const allProps = { ...comp.props };
    const serialized = serializeProps(allProps);
    const extras = Object.entries(extraProps).map(([k, v]) => `${k}=${v}`).join("\n    ");
    const propStr = [serialized, extras].filter(Boolean).join("\n    ");
    return propStr ? `      <${comp.type}
        ${propStr}
      />` : `      <${comp.type} />`;
  });
  return `${loaderLine}  return (
    <>
${jsxLines.join("\n")}
    </>
  )`;
}
function generateRoute(page) {
  const filename = pathToFilename(page.path);
  const filePath = `app/routes/${filename}.tsx`;
  const hasLoader = needsLoader(page.components);
  const imports = buildImports(page.components, hasLoader);
  const loader = hasLoader ? "\n\n" + buildLoader(page.components) : "";
  const body = buildJsx(page.components, hasLoader);
  const fnName = filename === "_index" ? "Index" : filename.replace(/[.$]/g, "_");
  const content = `${imports}${loader}

export default function ${fnName}() {
${body}
}
`;
  return [filePath, content];
}
function generateProject(input2) {
  const { storeName, pages } = input2;
  const usedComponents = /* @__PURE__ */ new Set();
  for (const page of pages) {
    for (const comp of page.components) {
      usedComponents.add(comp.type);
    }
  }
  const routeFiles = {};
  for (const page of pages) {
    const [filePath, fileContent] = generateRoute(page);
    routeFiles[filePath] = fileContent;
  }
  const hasProductRoute = Object.keys(routeFiles).some((p) => p.includes("products."));
  if (usedComponents.has("ProductDetail") && !hasProductRoute) {
    const [filePath, fileContent] = generateRoute({
      path: "/products/:handle",
      components: [{ type: "ProductDetail", props: { layout: "side-by-side", showReviewsPlaceholder: true, showRelated: true } }]
    });
    routeFiles[filePath] = fileContent;
  }
  return {
    ...generateBoilerplate(storeName),
    ...generateComponentFiles(usedComponents),
    ...generateCartFiles(),
    ...routeFiles
  };
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
const samplePath = join(__dirname$1, "../samples/fashion-homepage.json");
const outDir = join(__dirname$1, "../dist-sample");
let input;
try {
  input = JSON.parse(readFileSync(samplePath, "utf-8"));
} catch (err) {
  console.error("Failed to read sample JSON:", err);
  process.exit(1);
}
let files;
try {
  files = generateProject(input);
} catch (err) {
  console.error("generateProject failed:", err);
  process.exit(1);
}
rmSync(outDir, { recursive: true, force: true });
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = join(outDir, filePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
}
const sorted = Object.keys(files).sort();
console.log(`
Generated ${sorted.length} files → dist-sample/`);
for (const f of sorted) console.log("  " + f);
