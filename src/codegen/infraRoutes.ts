import type { ProjectFiles } from './types'

const PRODUCT_ROUTE = `import type { LoaderFunctionArgs } from '@shopify/remix-oxygen'
import { useLoaderData } from '@remix-run/react'
import ProductDetail from '~/components/ProductDetail'
import { PRODUCT_QUERY } from '~/lib/queries'

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { storefront } = context
  if (!storefront) return {}
  const { handle } = params
  if (!handle) throw new Response('Not found', { status: 404 })
  const { product } = await storefront.query(PRODUCT_QUERY, {
    variables: { handle },
  })
  if (!product) throw new Response('Not found', { status: 404 })
  return { product }
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>()
  return (
    <ProductDetail
      layout="side-by-side"
      showReviewsPlaceholder={false}
      showRelated={true}
      product={product}
    />
  )
}
`

const COLLECTION_ROUTE = `import type { LoaderFunctionArgs } from '@shopify/remix-oxygen'
import { useLoaderData } from '@remix-run/react'
import ProductGrid from '~/components/ProductGrid'
import { theme } from '~/config/theme'
import { COLLECTION_QUERY } from '~/lib/queries'

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { storefront } = context
  const { handle } = params
  if (!storefront) {
    const title = (handle ?? 'collection').split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return { products: undefined, collectionTitle: title }
  }
  if (!handle) throw new Response('Not found', { status: 404 })
  const { collection } = await storefront.query(COLLECTION_QUERY, {
    variables: { handle, first: 12 },
  })
  if (!collection) throw new Response('Not found', { status: 404 })
  const products = collection.products.nodes.map((p: any) => ({
    title: p.title,
    handle: p.handle,
    price: p.priceRange.minVariantPrice.currencyCode + ' ' + p.priceRange.minVariantPrice.amount,
    imageUrl: p.images.nodes[0]?.url ?? '',
  }))
  return { products, collectionTitle: collection.title }
}

export default function CollectionPage() {
  const { products, collectionTitle } = useLoaderData<typeof loader>()
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <h1 className={'text-3xl tracking-tight mb-10 ' + theme.font.heading + ' ' + theme.text.primary}>
        {collectionTitle}
      </h1>
      <ProductGrid columns={3} productsPerPage={12} collectionHandle="" products={products} />
    </section>
  )
}
`

export function generateInfraRoutes(): ProjectFiles {
  return {
    'app/routes/products.$handle.tsx': PRODUCT_ROUTE,
    'app/routes/collections.$handle.tsx': COLLECTION_ROUTE,
  }
}
