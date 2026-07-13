'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { MediaItem } from '@/lib/types'
import { SectionHeading } from '@/components/site/section-heading'

export function HistorySection({ items }: { items: MediaItem[] }) {
  return (
    <section id="history" className="scroll-mt-20 bg-secondary/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Our Journey" title="Moments in History" />
        {items.length === 0 ? (
          <p className="text-muted-foreground">Our history gallery is coming soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((item, i) => (
              <motion.figure
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="overflow-hidden rounded-sm border border-border bg-card"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={item.media_url || '/placeholder.svg'}
                    alt={item.caption ?? 'History photo'}
                    fill
                    className="object-cover"
                  />
                </div>
                {item.caption && (
                  <figcaption className="p-4 text-sm leading-relaxed text-muted-foreground">
                    {item.caption}
                  </figcaption>
                )}
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
