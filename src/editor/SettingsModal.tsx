import { useEffect, useState } from 'react'
import { CloseIcon } from './icons'
import type { ShopifyCredentials } from './useShopifyCredentials'

const inputClass =
  'w-full text-[12px] bg-white/[0.04] border border-white/[0.1] rounded-[5px] px-2.5 py-[7px] text-neutral-200 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-colors placeholder:text-neutral-700'

const labelClass =
  'block text-[10px] uppercase tracking-[0.1em] text-neutral-600 font-semibold mb-1.5'

interface SettingsModalProps {
  open: boolean
  initialCredentials: ShopifyCredentials
  onSave: (credentials: ShopifyCredentials) => void
  onClear: () => void
  onClose: () => void
}

export function SettingsModal({
  open,
  initialCredentials,
  onSave,
  onClear,
  onClose,
}: SettingsModalProps) {
  const [domain, setDomain] = useState(initialCredentials.domain)
  const [token, setToken] = useState(initialCredentials.token)

  useEffect(() => {
    if (open) {
      setDomain(initialCredentials.domain)
      setToken(initialCredentials.token)
    }
  }, [open, initialCredentials.domain, initialCredentials.token])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const trimmedDomain = domain.trim()
  const trimmedToken = token.trim()
  const canSave = trimmedDomain !== '' && trimmedToken !== ''
  const wasConnected =
    initialCredentials.domain.trim() !== '' && initialCredentials.token.trim() !== ''

  function handleSave() {
    if (!canSave) return
    onSave({ domain: trimmedDomain, token: trimmedToken })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onMouseDown={onClose}
    >
      <div
        className="w-[440px] bg-[#111111] rounded-[8px] border border-white/[0.12] shadow-2xl"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
          <div>
            <p className="text-[12px] font-semibold text-neutral-200 leading-none">
              Shopify connection
            </p>
            <p className="text-[10px] text-neutral-600 mt-1">
              Used in preview only — not bundled into exports
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-[5px] flex items-center justify-center text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.05] transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col p-5 gap-4">
          <div>
            <label className={labelClass} htmlFor="shopify-domain">
              Store domain
            </label>
            <input
              id="shopify-domain"
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="mystore.myshopify.com"
              className={inputClass}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="shopify-token">
              Storefront API access token
            </label>
            <input
              id="shopify-token"
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="shpat_…"
              className={inputClass}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.07]">
          <div>
            {wasConnected && (
              <button
                onClick={onClear}
                className="h-7 px-3 rounded-[5px] text-[11px] font-medium text-red-400 hover:bg-red-500/10 transition-colors tracking-wide"
              >
                Disconnect
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-7 px-3 rounded-[5px] text-[11px] font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.05] transition-colors tracking-wide"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="h-7 px-3 rounded-[5px] text-[11px] font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors tracking-wide"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
