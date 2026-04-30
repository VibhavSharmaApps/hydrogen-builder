import { useState } from 'react'
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
        <title>Maison Éclat</title>
        <Meta />
        <Links />
      </head>
      <body>
        <AnnouncementBar
          text="Complimentary shipping on orders over £350 — worldwide delivery available"
          backgroundColor={theme.bg.dark}
          dismissible={true}
        />
        <Navigation
          logo="MAISON ÉCLAT"
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
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
