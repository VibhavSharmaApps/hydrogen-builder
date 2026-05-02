const API_VERSION = '2024-10'

interface StorefrontResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export async function fetchStorefront<T>(
  domain: string,
  token: string,
  query: string,
  variables: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<T> {
  const url = `https://${domain}/api/${API_VERSION}/graphql.json`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    signal,
  })
  if (!res.ok) throw new Error(`Storefront API HTTP ${res.status}`)
  const json = (await res.json()) as StorefrontResponse<T>
  if (json.errors?.length) {
    throw new Error(json.errors.map(e => e.message).join('; '))
  }
  if (!json.data) throw new Error('Storefront API returned no data')
  return json.data
}
