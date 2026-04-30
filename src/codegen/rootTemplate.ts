import { serializeProps } from './propsSerializer'

export interface LayoutProps {
  announcementBar?: Record<string, unknown>
  navigation?: Record<string, unknown>
  footer?: Record<string, unknown>
}

function indent(propStr: string): string {
  return propStr.split('\n    ').join('\n          ')
}

export function generateRootTsx(storeName: string, layout: LayoutProps = {}): string {
  const { announcementBar, navigation, footer } = layout

  const abProps = announcementBar
    ? indent(serializeProps(announcementBar))
    : `text="Complimentary shipping on orders over £350 — worldwide delivery available"\n          backgroundColor={theme.bg.dark}\n          dismissible={true}`

  const navJsonProps = navigation
    ? indent(serializeProps(navigation))
    : `logo="${storeName.toUpperCase()}"\n          menuItems={[\n            { label: 'Women', href: '/collections/women', children: [\n              { label: 'Ready-to-Wear', href: '/collections/rtw' },\n              { label: 'Accessories', href: '/collections/accessories' },\n            ]},\n            { label: 'Men', href: '/collections/men' },\n            { label: 'New Arrivals', href: '/collections/new' },\n          ]}\n          sticky={true}`
  const navProps = navJsonProps + '\n          onCartClick={() => setCartOpen(true)}'

  const footerProps = footer
    ? indent(serializeProps(footer))
    : `columns={[\n            { heading: 'Collections', links: [\n              { label: 'Women', href: '/collections/women' },\n              { label: 'Men', href: '/collections/men' },\n              { label: 'New Arrivals', href: '/collections/new' },\n            ]},\n            { heading: 'Support', links: [\n              { label: 'Contact', href: '/contact' },\n              { label: 'Shipping and Returns', href: '/shipping' },\n            ]},\n          ]}\n          socialIcons={[{ platform: 'instagram', href: 'https://instagram.com' }]}\n          showNewsletter={true}`

  return `import { useState } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@shopify/remix-oxygen'
import AnnouncementBar from '~/components/AnnouncementBar'
import Navigation from '~/components/Navigation'
import Footer from '~/components/Footer'
import Cart from '~/components/Cart'
import type { CartApiQueryFragment } from 'storefrontapi.generated'
import stylesheet from '~/styles/app.css?url'
import { theme } from '~/config/theme'

export async function loader({ context }: LoaderFunctionArgs) {
  const cart = context.cart ? await context.cart.get() : null
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
        <AnnouncementBar
          ${abProps}
        />
        <Navigation
          ${navProps}
        />
        <main>
          <Outlet />
        </main>
        <Footer
          ${footerProps}
        />
        <Cart
          cart={(data?.cart ?? null) as CartApiQueryFragment | null}
          open={cartOpen}
          onClose={() => setCartOpen(false)}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
`
}

export function generateEntryClient(): string {
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
`
}

export function generateEntryServer(): string {
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
  const { nonce, header, NonceProvider } = createContentSecurityPolicy({
    imgSrc: [
      "'self'",
      'https://images.unsplash.com',
      'https://cdn.shopify.com',
      'https://cdn.shopifycdn.net',
      'data:',
    ],
  })
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
`
}

export function generateCartRoute(): string {
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
`
}
