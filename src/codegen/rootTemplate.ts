export function generateRootTsx(storeName: string): string {
  return `import { useState, useEffect } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@shopify/remix-oxygen'
import Cart from '~/components/Cart'
import type { CartApiQueryFragment } from 'storefrontapi.generated'
import stylesheet from '~/styles/app.css?url'

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

  useEffect(() => {
    const openCart = () => setCartOpen(true)
    window.addEventListener('open-cart', openCart)
    return () => window.removeEventListener('open-cart', openCart)
  }, [])

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
        <Outlet />
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
