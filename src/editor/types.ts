import type { ComponentType } from '../codegen/types'

export interface CanvasItem {
  id: string
  type: ComponentType
  props: Record<string, unknown>
}

export type PropFieldDef =
  | { kind: 'string'; label: string }
  | { kind: 'boolean'; label: string }
  | { kind: 'number'; label: string; min?: number; max?: number; step?: number }
  | { kind: 'select'; label: string; options: string[] }
  | { kind: 'array'; label: string; hint: string }

export type PropSchema = Record<string, PropFieldDef>

export type Viewport = 'desktop' | 'tablet' | 'mobile'

export const VIEWPORT_WIDTHS: Record<Viewport, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
}
