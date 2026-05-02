import { useState, type ReactNode } from 'react'
import {
  ShopifyCredentialsContext,
  STORAGE_KEYS,
  type ShopifyCredentials,
} from './useShopifyCredentials'

function read(): ShopifyCredentials {
  if (typeof window === 'undefined') return { domain: '', token: '' }
  return {
    domain: localStorage.getItem(STORAGE_KEYS.domain) ?? '',
    token: localStorage.getItem(STORAGE_KEYS.token) ?? '',
  }
}

export function ShopifyCredentialsProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<ShopifyCredentials>(read)

  function save(next: ShopifyCredentials) {
    localStorage.setItem(STORAGE_KEYS.domain, next.domain)
    localStorage.setItem(STORAGE_KEYS.token, next.token)
    setCredentials(next)
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEYS.domain)
    localStorage.removeItem(STORAGE_KEYS.token)
    setCredentials({ domain: '', token: '' })
  }

  const isConnected =
    credentials.domain.trim() !== '' && credentials.token.trim() !== ''

  return (
    <ShopifyCredentialsContext.Provider value={{ credentials, save, clear, isConnected }}>
      {children}
    </ShopifyCredentialsContext.Provider>
  )
}
