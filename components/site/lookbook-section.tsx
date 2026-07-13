'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { MediaItem } from '@/lib/types'
import { SectionHeading } from '@/components/site/section-heading'

export function LookbookSection({ items }: { items: MediaItem[] }) {
  return (
    <section id="lookbook" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
      <SectionHeading eyebrow="Editorial" title="The Lookbook" />
      {items.length === 0 ? (
        <p className="text-muted-foreground">Lookbook shots are coming soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item, i) => (
            <motion.figure
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-sm border border-border bg-muted"
            >
              <Image
                src={item.media_url || '/placeholder.svg'}
                alt={item.caption ?? 'Lookbook photo'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {item.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 text-sm text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {item.caption}
                </figcaption>
              )}
            </motion.figure>
          ))}
        </div>
      )}
    </section>
  )
}
