export function generateServerTs(): string {
  return `import { createRequestHandler } from '@shopify/remix-oxygen'
import {
  createStorefrontClient,
  createCartHandler,
  cartGetIdDefault,
  cartSetIdDefault,
} from '@shopify/hydrogen'
import * as remixBuild from 'virtual:remix/server-build'

export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      const waitUntil = executionContext.waitUntil.bind(executionContext)
      const cache = await caches.open('hydrogen')
      const session = await HydrogenSession.init(request, [env.SESSION_SECRET])

      const { storefront } = createStorefrontClient({
        cache,
        waitUntil,
        i18n: { language: 'EN', country: 'US' },
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
        storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION ?? '2024-04',
      })

      const cart = createCartHandler({
        storefront,
        getCartId: cartGetIdDefault(request.headers),
        setCartId: cartSetIdDefault(),
      })

      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({ session, storefront, cart, env, waitUntil }),
      })

      const response = await handleRequest(request)
      if (session.isPending) {
        response.headers.set('Set-Cookie', await session.commit())
      }
      return response
    } catch (error) {
      console.error(error)
      return new Response('An unexpected error occurred', { status: 500 })
    }
  },
}

class HydrogenSession {
  #data: Record<string, string>
  isPending = false
  private constructor(data: Record<string, string>) { this.#data = data }

  static async init(request: Request, _secrets: string[]): Promise<HydrogenSession> {
    const cookieHeader = request.headers.get('Cookie') ?? ''
    const match = cookieHeader.match(/hydrogen_session=([^;]+)/)
    try {
      return new HydrogenSession(match ? JSON.parse(atob(match[1])) : {})
    } catch {
      return new HydrogenSession({})
    }
  }

  get(key: string) { return this.#data[key] }
  set(key: string, value: string) { this.#data[key] = value; this.isPending = true }
  unset(key: string) { delete this.#data[key]; this.isPending = true }
  async commit() {
    return 'hydrogen_session=' + btoa(JSON.stringify(this.#data)) + '; Path=/; HttpOnly; SameSite=Lax'
  }
}

interface Env {
  SESSION_SECRET: string
  PUBLIC_STOREFRONT_API_TOKEN: string
  PUBLIC_STORE_DOMAIN: string
  PUBLIC_STOREFRONT_API_VERSION?: string
}
`
}
