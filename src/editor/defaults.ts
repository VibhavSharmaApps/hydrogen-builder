import type { ComponentType } from '../codegen/types'
import type { PropSchema } from './types'
import { defaultProps as abDef } from '../templates/AnnouncementBar'
import { defaultProps as navDef } from '../templates/Navigation'
import { defaultProps as heroDef } from '../templates/HeroSection'
import { defaultProps as featDef } from '../templates/FeatureSection'
import { defaultProps as gridDef } from '../templates/ProductGrid'
import { defaultProps as ctaDef } from '../templates/CTABlock'
import { defaultProps as footerDef } from '../templates/Footer'
import { defaultProps as detailDef } from '../templates/ProductDetail'

export const defaultPropsMap: Record<ComponentType, Record<string, unknown>> = {
  AnnouncementBar: { ...abDef },
  Navigation: { ...navDef },
  HeroSection: { ...heroDef },
  FeatureSection: { ...featDef },
  ProductGrid: { ...gridDef },
  CTABlock: { ...ctaDef },
  Footer: { ...footerDef },
  ProductDetail: { ...detailDef },
}

export const propSchemaMap: Record<ComponentType, PropSchema> = {
  AnnouncementBar: {
    text: { kind: 'string', label: 'Text' },
    backgroundColor: { kind: 'string', label: 'Background (Tailwind class)' },
    dismissible: { kind: 'boolean', label: 'Dismissible' },
  },
  Navigation: {
    logo: { kind: 'string', label: 'Logo text' },
    menuItems: { kind: 'array', label: 'Menu items', hint: '4 items configured' },
    sticky: { kind: 'boolean', label: 'Sticky' },
  },
  HeroSection: {
    heading: { kind: 'string', label: 'Heading' },
    subheading: { kind: 'string', label: 'Subheading' },
    ctaText: { kind: 'string', label: 'CTA text' },
    ctaLink: { kind: 'string', label: 'CTA link' },
    backgroundImage: { kind: 'string', label: 'Background image URL' },
    overlayOpacity: { kind: 'number', label: 'Overlay opacity', min: 0, max: 1, step: 0.05 },
    variant: { kind: 'select', label: 'Variant', options: ['full-bleed', 'split'] },
  },
  FeatureSection: {
    heading: { kind: 'string', label: 'Section heading' },
    features: { kind: 'array', label: 'Features', hint: '4 features configured' },
  },
  ProductGrid: {
    columns: { kind: 'select', label: 'Columns', options: ['2', '3', '4'] },
    productsPerPage: { kind: 'number', label: 'Products per page', min: 1, max: 24, step: 1 },
    collectionHandle: { kind: 'string', label: 'Collection handle' },
  },
  CTABlock: {
    heading: { kind: 'string', label: 'Heading' },
    body: { kind: 'string', label: 'Body text' },
    buttonText: { kind: 'string', label: 'Button text' },
    buttonLink: { kind: 'string', label: 'Button link' },
    backgroundColor: { kind: 'string', label: 'Background (Tailwind class)' },
  },
  Footer: {
    columns: { kind: 'array', label: 'Link columns', hint: '3 columns configured' },
    socialIcons: { kind: 'array', label: 'Social links', hint: '2 platforms configured' },
    showNewsletter: { kind: 'boolean', label: 'Show newsletter' },
  },
  ProductDetail: {
    layout: { kind: 'select', label: 'Layout', options: ['side-by-side', 'stacked'] },
    showReviewsPlaceholder: { kind: 'boolean', label: 'Show reviews placeholder' },
    showRelated: { kind: 'boolean', label: 'Show related products' },
  },
}

export const COMPONENT_META: Record<ComponentType, { label: string; description: string; abbr: string }> = {
  AnnouncementBar: { label: 'Announcement Bar', description: 'Promotional top banner', abbr: 'AB' },
  Navigation: { label: 'Navigation', description: 'Header nav + mobile menu', abbr: 'NV' },
  HeroSection: { label: 'Hero Section', description: 'Full-bleed or split hero', abbr: 'HS' },
  FeatureSection: { label: 'Feature Section', description: 'Benefits & trust icons', abbr: 'FS' },
  ProductGrid: { label: 'Product Grid', description: 'Collection grid, 2–4 cols', abbr: 'PG' },
  CTABlock: { label: 'CTA Block', description: 'Centered call-to-action', abbr: 'CT' },
  Footer: { label: 'Footer', description: 'Links, social & newsletter', abbr: 'FO' },
  ProductDetail: { label: 'Product Detail', description: 'PDP with images & sizes', abbr: 'PD' },
}
