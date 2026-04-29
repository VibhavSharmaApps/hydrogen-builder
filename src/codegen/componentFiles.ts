import AnnouncementBarSource from '../templates/AnnouncementBar.tsx?raw'
import CTABlockSource from '../templates/CTABlock.tsx?raw'
import HeroSectionSource from '../templates/HeroSection.tsx?raw'
import FooterSource from '../templates/Footer.tsx?raw'
import FeatureSectionSource from '../templates/FeatureSection.tsx?raw'
import ProductGridSource from '../templates/ProductGrid.tsx?raw'
import TypesSource from '../templates/types.ts?raw'
import ThemeSource from '../theme/config.ts?raw'
import { ADAPTED_NAVIGATION } from './sources/navigation'
import { ADAPTED_PRODUCT_DETAIL } from './sources/productDetail'
import type { ComponentType, ProjectFiles } from './types'

const TYPES_PATH = /from '\.\/types'/g
const TYPES_PATH_REPLACE = "from '~/components/types'"
const THEME_PATH = /from '\.\.\/theme\/config'/g
const THEME_PATH_REPLACE = "from '~/config/theme'"

function fixImports(source: string): string {
  return source
    .replace(TYPES_PATH, TYPES_PATH_REPLACE)
    .replace(THEME_PATH, THEME_PATH_REPLACE)
}

function adaptProductGrid(source: string): string {
  let s = fixImports(source)
  s = s.replace(
    '  collectionHandle: string\n}',
    '  collectionHandle: string\n  products?: ProductItem[]\n}',
  )
  s = s.replace(
    '{ columns, productsPerPage, collectionHandle }',
    '{ columns, productsPerPage, collectionHandle, products }',
  )
  s = s.replace(
    'const visibleProducts = MOCK_PRODUCTS.slice(0, productsPerPage)',
    'const visibleProducts = (products ?? MOCK_PRODUCTS).slice(0, productsPerPage)',
  )
  return s
}

const COMPONENT_MAP: Record<ComponentType, () => string> = {
  AnnouncementBar: () => fixImports(AnnouncementBarSource),
  CTABlock: () => fixImports(CTABlockSource),
  HeroSection: () => fixImports(HeroSectionSource),
  Navigation: () => ADAPTED_NAVIGATION,
  Footer: () => fixImports(FooterSource),
  FeatureSection: () => fixImports(FeatureSectionSource),
  ProductGrid: () => adaptProductGrid(ProductGridSource),
  ProductDetail: () => ADAPTED_PRODUCT_DETAIL,
}

export function generateComponentFiles(used: Set<ComponentType>): ProjectFiles {
  const files: ProjectFiles = {
    'app/components/types.ts': TypesSource,
    'app/config/theme.ts': ThemeSource,
  }
  for (const type of used) {
    files[`app/components/${type}.tsx`] = COMPONENT_MAP[type]()
  }
  return files
}
