import type { LoaderFunctionArgs } from '@shopify/remix-oxygen'
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
