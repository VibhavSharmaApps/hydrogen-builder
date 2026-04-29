export const theme = {
  bg: {
    dark: 'bg-neutral-950',
    light: 'bg-neutral-100',
    white: 'bg-white',
    overlay: 'bg-black/30',
  },
  text: {
    primary: 'text-neutral-950',
    onDark: 'text-neutral-100',
    white: 'text-white',
    muted: 'text-neutral-400',
    link: 'text-neutral-600',
    accent: 'text-zinc-400',
    body: 'text-zinc-500',
    footerLink: 'text-neutral-300',
    meta: 'text-neutral-500',
  },
  border: {
    primary: 'border-neutral-950',
    light: 'border-neutral-100',
    subtle: 'border-neutral-200',
    divider: 'border-neutral-800',
    input: 'border-neutral-600',
    white: 'border-white',
  },
  hover: {
    bgDark: 'hover:bg-neutral-950',
    bgWhite: 'hover:bg-white',
    bgMid: 'hover:bg-neutral-700',
    textPrimary: 'hover:text-neutral-950',
    textWhite: 'hover:text-white',
    textOnDark: 'hover:text-neutral-100',
    textFooter: 'hover:text-neutral-300',
    borderPrimary: 'hover:border-neutral-950',
  },
  font: {
    heading: 'font-thin',
    body: 'font-light',
  },
  focus: {
    borderWhite: 'focus:border-white',
  },
  placeholder: {
    muted: 'placeholder:text-neutral-500',
  },
} as const
