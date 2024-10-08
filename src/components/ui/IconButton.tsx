import type { Icon } from '@tabler/icons-react'
import type { FC, JSX } from 'react'
import { twMerge } from 'tailwind-merge'

type IconButtonProps = {
  icon: Icon
  label?: string
  type?: 'button' | 'submit'
  iconPosition?: 'left' | 'right'
  size?: number
  iconClassName?: string
} & Omit<JSX.IntrinsicElements['button'], 'children'>

export const IconButton: FC<IconButtonProps> = ({
  label,
  size,
  type = 'button',
  icon: Icon,
  iconPosition,
  iconClassName,
  ...props
}) => (
  <button
    type={type}
    {...props}
    className={twMerge(
      iconPosition === 'right' && 'flex-row-reverse',
      label === undefined ? 'p-2' : 'px-3 py-2',
      'flex w-fit items-center justify-center gap-x-2 rounded-md bg-background-50 transition-colors',
      'hover:bg-background-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:text-foreground-500 disabled:hover:bg-background-50',
      props.className,
    )}
  >
    <Icon size={size ?? 20} className={iconClassName} />
    {label}
  </button>
)
