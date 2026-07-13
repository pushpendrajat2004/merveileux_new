'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { TeamMember } from '@/lib/types'
import { SectionHeading } from '@/components/site/section-heading'

function TeamCard({ member }: { member: TeamMember }) {
  const images = member.image_urls.length ? member.image_urls : ['/placeholder.svg']
  const [index, setIndex] = useState(0)
  const hasMultiple = images.length > 1

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  return (
    <article className="group overflow-hidden rounded-sm border border-border bg-card">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={images[index] || '/placeholder.svg'}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((img, i) => (
                <span
                  key={img}
                  className={`size-1.5 rounded-full transition-colors ${
                    i === index ? 'bg-primary' : 'bg-foreground/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl font-semibold text-foreground">
          {member.name}
        </h3>
        <p className="mt-1 text-sm text-primary">{member.position}</p>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
          {member.branch}
        </p>
      </div>
    </article>
  )
}

export function TeamSection({ members }: { members: TeamMember[] }) {
  return (
    <section id="team" className="scroll-mt-20 bg-secondary/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="The Faces" title="Meet the Team" />
        {members.length === 0 ? (
          <p className="text-muted-foreground">Team members will appear here soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <TeamCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
