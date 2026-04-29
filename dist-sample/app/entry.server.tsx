import { PassThrough } from 'node:stream'
import type { EntryContext } from '@shopify/remix-oxygen'
import { RemixServer } from '@remix-run/react'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { createContentSecurityPolicy } from '@shopify/hydrogen'

const ABORT_DELAY = 5_000

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const { nonce, header, NonceProvider } = createContentSecurityPolicy()
  const userAgent = request.headers.get('user-agent')

  return new Promise<Response>((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider>
        <RemixServer context={remixContext} url={request.url} />
      </NonceProvider>,
      {
        nonce,
        onShellReady() {
          responseHeaders.set('Content-Type', 'text/html')
          responseHeaders.set('Content-Security-Policy', header)
          const body = new PassThrough()
          resolve(
            new Response(body as unknown as BodyInit, {
              status: responseStatusCode,
              headers: responseHeaders,
            }),
          )
          pipe(body)
        },
        onShellError: reject,
        onError(error: unknown) {
          console.error(error)
          responseStatusCode = isbot(userAgent ?? '') ? 500 : responseStatusCode
        },
      },
    )
    setTimeout(abort, ABORT_DELAY)
  })
}
