import type { BuildInput, ComponentType, ProjectFiles } from './types'
import { generateBoilerplate } from './boilerplate'
import { generateComponentFiles } from './componentFiles'
import { generateCartFiles } from './cartFiles'
import { generateRoute } from './routeGenerator'

export { generateProject }
export type { BuildInput, ProjectFiles } from './types'

function generateProject(input: BuildInput): ProjectFiles {
  const { storeName, pages } = input

  const usedComponents = new Set<ComponentType>()
  for (const page of pages) {
    for (const comp of page.components) {
      usedComponents.add(comp.type)
    }
  }

  // Route files from page descriptors
  const routeFiles: ProjectFiles = {}
  for (const page of pages) {
    const [filePath, fileContent] = generateRoute(page)
    routeFiles[filePath] = fileContent
  }

  // Auto-add a /products/:handle route if ProductDetail is used but not explicitly routed
  const hasProductRoute = Object.keys(routeFiles).some((p) => p.includes('products.'))
  if (usedComponents.has('ProductDetail') && !hasProductRoute) {
    const [filePath, fileContent] = generateRoute({
      path: '/products/:handle',
      components: [{ type: 'ProductDetail', props: { layout: 'side-by-side', showReviewsPlaceholder: true, showRelated: true } }],
    })
    routeFiles[filePath] = fileContent
  }

  return {
    ...generateBoilerplate(storeName),
    ...generateComponentFiles(usedComponents),
    ...generateCartFiles(),
    ...routeFiles,
  }
}
