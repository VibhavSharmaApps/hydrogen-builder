import { COLLECTION_QUERY, PRODUCT_QUERY, CART_QUERY } from './queries'
import { generateServerTs } from './serverTemplate'
import { generateRootTsx, generateEntryClient, generateEntryServer, generateCartRoute } from './rootTemplate'
import type { ProjectFiles } from './types'

function generatePackageJson(storeName: string): string {
  const name = storeName.toLowerCase().replace(/\s+/g, '-')
  return JSON.stringify({
    name,
    private: true,
    version: '1.0.0',
    scripts: {
      build: 'shopify hydrogen build',
      dev: 'shopify hydrogen dev --codegen',
      preview: 'shopify hydrogen preview',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      '@remix-run/react': '2.8.1',
      '@shopify/hydrogen': '2024.4.3',
      '@shopify/remix-oxygen': '2.0.7',
      graphql: '^16.6.0',
      isbot: '^4.1.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@remix-run/dev': '2.8.1',
      '@shopify/cli': '3.61.0',
      '@shopify/mini-oxygen': '^2.2.5',
      '@shopify/oxygen-workers-types': '^4.0.0',
      '@types/react': '^18.2.60',
      '@types/react-dom': '^18.2.19',
      autoprefixer: '^10.4.17',
      postcss: '^8.4.35',
      tailwindcss: '^3.4.1',
      typescript: '^5.2.2',
      vite: '^5.1.0',
      'vite-tsconfig-paths': '^5.0.0',
    },
    engines: { node: '>=18.0.0' },
  }, null, 2)
}

function generateViteConfig(): string {
  return `import { defineConfig } from 'vite'
import { hydrogen } from '@shopify/hydrogen/vite'
import { vitePlugin as remix } from '@remix-run/dev'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    hydrogen(),
    remix({
      presets: [hydrogen.preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: { assetsInlineLimit: 0 },
})
`
}

function generateTsConfig(): string {
  return JSON.stringify({
    include: ['remix.env.d.ts', '**/*.ts', '**/*.tsx'],
    compilerOptions: {
      lib: ['DOM', 'DOM.Iterable', 'ES2022'],
      isolatedModules: true,
      esModuleInterop: true,
      jsx: 'react-jsx',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      target: 'ES2022',
      strict: true,
      allowJs: true,
      baseUrl: '.',
      paths: { '~/*': ['./app/*'] },
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
  }, null, 2)
}

function generateStorefrontApiShim(): string {
  return `declare module 'storefrontapi.generated' {
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
`
}

function generateQueriesLib(): string {
  return (
    'export const COLLECTION_QUERY = `' + COLLECTION_QUERY + '`\n\n' +
    'export const PRODUCT_QUERY = `' + PRODUCT_QUERY + '`\n\n' +
    'export const CART_QUERY = `' + CART_QUERY + '`\n'
  )
}

export function generateBoilerplate(storeName: string): ProjectFiles {
  return {
    'package.json': generatePackageJson(storeName),
    'vite.config.ts': generateViteConfig(),
    'tsconfig.json': generateTsConfig(),
    'server.ts': generateServerTs(),
    'tailwind.config.js': "export default { content: ['./app/**/*.{js,jsx,ts,tsx}'], theme: { extend: {} }, plugins: [] }\n",
    'postcss.config.js': "export default { plugins: { tailwindcss: {}, autoprefixer: {} } }\n",
    '.env.example': 'SESSION_SECRET=your_secret_here\nPUBLIC_STOREFRONT_API_TOKEN=your_token\nPUBLIC_STORE_DOMAIN=your-store.myshopify.com\nPUBLIC_STOREFRONT_API_VERSION=2024-04\n',
    'public/favicon.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#0a0a0a"/></svg>\n',
    'app/styles/app.css': '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n',
    'app/lib/queries.ts': generateQueriesLib(),
    'app/types/storefrontapi.d.ts': generateStorefrontApiShim(),
    'app/root.tsx': generateRootTsx(storeName),
    'app/entry.client.tsx': generateEntryClient(),
    'app/entry.server.tsx': generateEntryServer(),
    'app/routes/cart.tsx': generateCartRoute(),
  }
}
