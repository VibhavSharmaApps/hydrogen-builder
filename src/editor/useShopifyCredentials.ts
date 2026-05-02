import { createContext, useContext } from 'react'

export const STORAGE_KEYS = {
  domain: 'hydrogen-builder:shopify-domain',
  token: 'hydrogen-builder:shopify-token',
} as const

export interface ShopifyCredentials {
  domain: string
  token: string
}

export interface ShopifyCredentialsContextValue {
  credentials: ShopifyCredentials
  save: (next: ShopifyCredentials) => void
  clear: () => void
  isConnected: boolean
}

export const ShopifyCredentialsContext =
  createContext<ShopifyCredentialsContextValue | null>(null)

export function useShopifyCredentials(): ShopifyCredentialsContextValue {
  const ctx = useContext(ShopifyCredentialsContext)
  if (!ctx) {
    throw new Error(
      'useShopifyCredentials must be used within <ShopifyCredentialsProvider>',
    )
  }
  return ctx
}
