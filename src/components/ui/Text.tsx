import { HTMLAttributes } from 'react'

type TextVariant = 'body' | 'label' | 'caption' | 'muted'
type TextAs = 'p' | 'span' | 'div' | 'label'

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextAs
  variant?: TextVariant
}

const VARIANTS: Record<TextVariant, string> = {
  body:    'text-sm text-gray-700',
  label:   'text-sm font-medium text-gray-700',
  caption: 'text-xs text-gray-500',
  muted:   'text-xs text-gray-400',
}

/**
 * Variants: body | label | caption | muted
 * as:       p | span | div | label  (default p)
 */
export default function Text({
  as: Tag = 'p',
  variant = 'body',
  className = '',
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={[VARIANTS[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
