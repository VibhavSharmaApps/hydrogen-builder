import type { LoaderFunctionArgs } from '@shopify/remix-oxygen'
import { useLoaderData } from '@remix-run/react'
import HeroSection from '~/components/HeroSection'
import ProductGrid from '~/components/ProductGrid'
import FeatureSection from '~/components/FeatureSection'
import CTABlock from '~/components/CTABlock'
import { COLLECTION_QUERY } from '~/lib/queries'

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context
  const loaderData: Record<string, unknown> = {}
  const { collection } = await storefront.query(COLLECTION_QUERY, {
    variables: { handle: "new-arrivals", first: 6 },
  })
  loaderData.products = collection?.products?.nodes ?? []
  return loaderData
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>()
  return (
    <>
      <HeroSection
        heading="The Quietude Collection"
    subheading="Autumn / Winter 2026"
    ctaText="Discover"
    ctaLink="/collections/quietude"
    backgroundImage="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400"
    overlayOpacity={0.25}
    variant="full-bleed"
      />
      <ProductGrid
        columns={3}
    productsPerPage={6}
    collectionHandle="new-arrivals"
    products={loaderData.products}
      />
      <FeatureSection
        heading="Our Promise"
    features={[{ icon: "→", title: "Complimentary Shipping", description: "On all orders over £350, worldwide." }, { icon: "○", title: "Easy Returns", description: "Thirty days, no questions asked." }, { icon: "◇", title: "Sustainable Materials", description: "Responsible sourcing throughout." }, { icon: "∞", title: "Lifetime Care", description: "Repair and restoration for all pieces." }]}
      />
      <CTABlock
        heading="The New Collection"
    body="Considered design. Exceptional materials. Available now."
    buttonText="Explore"
    buttonLink="/collections/new"
    backgroundColor="bg-neutral-100"
      />
    </>
  )
}
