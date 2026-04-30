import { useState, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { ComponentType } from '../codegen/types'
import type { CanvasItem } from './types'
import { defaultPropsMap } from './defaults'

export interface EditorState {
  storeName: string
  items: CanvasItem[]
  selectedId: string | null
}

export function useEditorState() {
  const [state, setState] = useState<EditorState>({
    storeName: 'My Store',
    items: [],
    selectedId: null,
  })

  const addItem = useCallback((type: ComponentType, atIndex?: number) => {
    const newItem: CanvasItem = {
      id: crypto.randomUUID(),
      type,
      props: { ...defaultPropsMap[type] },
    }
    setState(prev => {
      const items = [...prev.items]
      if (atIndex !== undefined) {
        items.splice(atIndex, 0, newItem)
      } else {
        items.push(newItem)
      }
      return { ...prev, items, selectedId: newItem.id }
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }))
  }, [])

  const reorderItems = useCallback((fromId: string, toId: string) => {
    setState(prev => {
      const oldIndex = prev.items.findIndex(i => i.id === fromId)
      const newIndex = prev.items.findIndex(i => i.id === toId)
      if (oldIndex === -1 || newIndex === -1) return prev
      return { ...prev, items: arrayMove(prev.items, oldIndex, newIndex) }
    })
  }, [])

  const updateProp = useCallback((id: string, key: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, props: { ...item.props, [key]: value } } : item
      ),
    }))
  }, [])

  const setSelected = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedId: id }))
  }, [])

  const setStoreName = useCallback((name: string) => {
    setState(prev => ({ ...prev, storeName: name }))
  }, [])

  return { state, addItem, removeItem, reorderItems, updateProp, setSelected, setStoreName }
}
