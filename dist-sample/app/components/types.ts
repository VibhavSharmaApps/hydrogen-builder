export interface FooterColumn {
  heading: string
  links: { label: string; href: string }[]
}

export type SocialPlatform = 'instagram' | 'twitter' | 'pinterest' | 'tiktok'

export interface SocialLink {
  platform: SocialPlatform
  href: string
}

export interface MenuItem {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

export interface ProductItem {
  title: string
  price: string
  imageUrl: string
  handle: string
}

export interface Feature {
  icon: string
  title: string
  description: string
}
