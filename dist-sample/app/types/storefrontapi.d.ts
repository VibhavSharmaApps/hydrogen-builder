declare module 'storefrontapi.generated' {
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
