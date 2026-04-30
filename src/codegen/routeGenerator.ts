import { serializeProps } from './propsSerializer'
import type { ComponentDescriptor, ComponentType, PageDescriptor, ProjectFiles } from './types'

const LAYOUT_COMPONENTS = new Set<ComponentType>(['Navigation', 'AnnouncementBar', 'Footer'])
const DATA_COMPONENTS = new Set<ComponentType>(['ProductGrid', 'ProductDetail'])

export function pathToFilename(path: string): string {
  if (path === '/') return '_index'
  return path
    .replace(/^\//, '')
    .replace(/:([a-zA-Z]+)/g, '$$1')
    .replace(/\//g, '.')
}

function needsLoader(components: ComponentDescriptor[]): boolean {
  return components.some((c) => DATA_COMPONENTS.has(c.type))
}

function buildImports(components: ComponentDescriptor[], hasLoader: boolean): string {
  const types = [...new Set(components.filter((c) => !LAYOUT_COMPONENTS.has(c.type)).map((c) => c.type))]
  const lines: string[] = []
  if (hasLoader) {
    lines.push("import type { LoaderFunctionArgs } from '@shopify/remix-oxygen'")
    lines.push("import { useLoaderData } from '@remix-run/react'")
  }
  for (const type of types) {
    lines.push(`import ${type} from '~/components/${type}'`)
  }
  const needsCollectionQuery = components.some((c) => c.type === 'ProductGrid')
  const needsProductQuery = components.some((c) => c.type === 'ProductDetail')
  if (needsCollectionQuery || needsProductQuery) {
    const queries = []
    if (needsCollectionQuery) queries.push('COLLECTION_QUERY')
    if (needsProductQuery) queries.push('PRODUCT_QUERY')
    lines.push(`import { ${queries.join(', ')} } from '~/lib/queries'`)
  }
  return lines.join('\n')
}

function buildLoader(components: ComponentDescriptor[]): string {
  const hasGrid = components.some((c) => c.type === 'ProductGrid')
  const hasDetail = components.some((c) => c.type === 'ProductDetail')
  const loaderArgs = hasDetail ? '{ context, params }' : '{ context }'
  const lines: string[] = [
    `export async function loader(${loaderArgs}: LoaderFunctionArgs) {`,
    '  const { storefront } = context',
    '  if (!storefront) return {}',
    '  const loaderData: Record<string, unknown> = {}',
  ]
  if (hasGrid) {
    const grid = components.find((c) => c.type === 'ProductGrid')
    const handle = (grid?.props.collectionHandle as string) ?? 'new-arrivals'
    const first = (grid?.props.productsPerPage as number) ?? 6
    lines.push(
      `  const { collection } = await storefront.query(COLLECTION_QUERY, {`,
      `    variables: { handle: ${JSON.stringify(handle)}, first: ${first} },`,
      `  })`,
      `  loaderData.products = collection?.products?.nodes ?? []`,
    )
  }
  if (hasDetail) {
    lines.push(
      `  const { handle } = params`,
      `  if (!handle) throw new Response('Not found', { status: 404 })`,
      `  const { product } = await storefront.query(PRODUCT_QUERY, {`,
      `    variables: { handle },`,
      `  })`,
      `  if (!product) throw new Response('Not found', { status: 404 })`,
      `  loaderData.product = product`,
    )
  }
  lines.push('  return loaderData', '}')
  return lines.join('\n')
}

function buildJsx(components: ComponentDescriptor[], hasLoader: boolean): string {
  const pageComponents = components.filter((c) => !LAYOUT_COMPONENTS.has(c.type))
  if (pageComponents.length === 0) return '  return null'

  const loaderLine = hasLoader ? '  const loaderData = useLoaderData<typeof loader>()\n' : ''

  const jsxLines = pageComponents.map((comp) => {
    const extraProps: Record<string, unknown> = {}
    if (comp.type === 'ProductGrid') extraProps.products = '{loaderData.products}'
    if (comp.type === 'ProductDetail') extraProps.product = '{loaderData.product}'

    const allProps = { ...comp.props }
    const indent = '\n        '
    const serialized = serializeProps(allProps).split('\n    ').join(indent)
    const extras = Object.entries(extraProps)
      .map(([k, v]) => `${k}=${v}`)
      .join(indent)

    const propStr = [serialized, extras].filter(Boolean).join(indent)
    return propStr
      ? `      <${comp.type}\n        ${propStr}\n      />`
      : `      <${comp.type} />`
  })

  return `${loaderLine}  return (\n    <>\n${jsxLines.join('\n')}\n    </>\n  )`
}

export function generateRoute(page: PageDescriptor): [string, string] {
  const filename = pathToFilename(page.path)
  const filePath = `app/routes/${filename}.tsx`
  const hasLoader = needsLoader(page.components)
  const imports = buildImports(page.components, hasLoader)
  const loader = hasLoader ? '\n\n' + buildLoader(page.components) : ''
  const body = buildJsx(page.components, hasLoader)
  const fnName = filename === '_index' ? 'Index' : filename.replace(/[.$]/g, '_')

  const content = `${imports}${loader}

export default function ${fnName}() {
${body}
}
`
  return [filePath, content]
}

export function generateRoutes(pages: PageDescriptor[]): ProjectFiles {
  const files: ProjectFiles = {}
  for (const page of pages) {
    const [path, content] = generateRoute(page)
    files[path] = content
  }
  return files
}
