export type ComponentType =
  | 'AnnouncementBar'
  | 'Navigation'
  | 'HeroSection'
  | 'CTABlock'
  | 'FeatureSection'
  | 'ProductGrid'
  | 'ProductDetail'
  | 'Footer'

export interface ComponentDescriptor {
  type: ComponentType
  props: Record<string, unknown>
}

export interface PageDescriptor {
  path: string
  components: ComponentDescriptor[]
  title?: string
}

export interface BuildInput {
  storeName: string
  pages: PageDescriptor[]
}

export type ProjectFiles = Record<string, string>
