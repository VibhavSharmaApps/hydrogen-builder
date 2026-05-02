import { useEffect, useState } from 'react'
import { COLLECTION_QUERY } from '../codegen/queries'
import { fetchStorefront } from './shopifyClient'
import { useShopifyCredentials } from './useShopifyCredentials'

export interface PreviewProduct {
  id: string
  title: string
  handle: string
  imageUrl: string | null
  imageAlt: string
  price: string
}

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

interface CollectionResponse {
  collection: {
    id: string
    title: string
    products: {
      nodes: Array<{
        id: string
        title: string
        handle: string
        priceRange: {
          minVariantPrice: { amount: string; currencyCode: string }
        }
        images: {
          nodes: Array<{
            url: string
            altText: string | null
            width: number
            height: number
          }>
        }
      }>
    }
  } | null
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$', JPY: '¥',
}

function formatPrice(amount: string, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOL[currencyCode] ?? `${currencyCode} `
  const num = parseFloat(amount)
  const fixed = currencyCode === 'JPY' ? num.toFixed(0) : num.toFixed(2)
  return `${symbol}${fixed}`
}

export function useStorefrontCollection(handle: string, first: number) {
  const { credentials, isConnected } = useShopifyCredentials()
  const [products, setProducts] = useState<PreviewProduct[]>([])
  const [status, setStatus] = useState<FetchStatus>('idle')

  useEffect(() => {
    if (!isConnected || !handle) {
      setStatus('idle')
      setProducts([])
      return
    }
    const controller = new AbortController()
    setStatus('loading')

    fetchStorefront<CollectionResponse>(
      credentials.domain,
      credentials.token,
      COLLECTION_QUERY,
      { handle, first },
      controller.signal,
    )
      .then(data => {
        const nodes = data.collection?.products.nodes ?? []
        const mapped: PreviewProduct[] = nodes.map(p => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          imageUrl: p.images.nodes[0]?.url ?? null,
          imageAlt: p.images.nodes[0]?.altText ?? p.title,
          price: formatPrice(
            p.priceRange.minVariantPrice.amount,
            p.priceRange.minVariantPrice.currencyCode,
          ),
        }))
        setProducts(mapped)
        setStatus('success')
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        console.error('[Hydrogen Builder] Storefront fetch failed:', err)
        setProducts([])
        setStatus('error')
      })

    return () => controller.abort()
  }, [isConnected, credentials.domain, credentials.token, handle, first])

  return { products, status }
}
