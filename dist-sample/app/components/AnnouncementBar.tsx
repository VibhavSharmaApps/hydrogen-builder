import { useState } from 'react'
import { theme } from '~/config/theme'

export interface AnnouncementBarProps {
  text: string
  backgroundColor: string
  dismissible: boolean
}

export const defaultProps: AnnouncementBarProps = {
  text: 'Complimentary shipping on orders over £350 — worldwide delivery available',
  backgroundColor: theme.bg.dark,
  dismissible: true,
}

export default function AnnouncementBar({ text, backgroundColor, dismissible }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className={`w-full py-2.5 px-4 flex items-center justify-center relative ${backgroundColor}`}>
      <p className={`text-xs tracking-widest uppercase ${theme.text.onDark}`}>{text}</p>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className={`absolute right-4 ${theme.text.muted} ${theme.hover.textOnDark} transition-colors text-base leading-none`}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  )
}
