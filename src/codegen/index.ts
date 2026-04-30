import type { BuildInput, ComponentType, ProjectFiles } from './types'
import { generateBoilerplate } from './boilerplate'
import { generateComponentFiles } from './componentFiles'
import { generateCartFiles } from './cartFiles'
import { generateInfraRoutes } from './infraRoutes'
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

  // Infrastructure components are always required regardless of JSON content
  usedComponents.add('ProductDetail')
  usedComponents.add('ProductGrid')

  // Route files from page descriptors (homepage section composition driven by JSON)
  const routeFiles: ProjectFiles = {}
  for (const page of pages) {
    const [filePath, fileContent] = generateRoute(page)
    routeFiles[filePath] = fileContent
  }

  return {
    ...generateBoilerplate(storeName),
    ...generateComponentFiles(usedComponents),
    ...generateCartFiles(),
    ...generateInfraRoutes(), // always present; JSON routes below can override if needed
    ...routeFiles,
  }
}
