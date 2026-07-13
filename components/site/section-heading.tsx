import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string
  title: string
  className?: string
}) {
  return (
    <div className={cn('mb-12', className)}>
      <p className="mb-3 text-xs uppercase tracking-[0.4em] text-primary">{eyebrow}</p>
      <h2 className="text-balance font-serif text-4xl font-semibold text-foreground sm:text-5xl">
        {title}
      </h2>
    </div>
  )
}
