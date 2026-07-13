import { SectionHeading } from '@/components/site/section-heading'

const stats = [
  { value: '2018', label: 'Established' },
  { value: '40+', label: 'Active Members' },
  { value: '25+', label: 'Shows Performed' },
  { value: '12', label: 'Awards Won' },
]

export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
      <SectionHeading eyebrow="Who We Are" title="The Art of Presence" />
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6 text-pretty leading-relaxed text-muted-foreground">
          <p>
            MERVEILLEUX — French for {'"marvelous"'} — is the official fashion and
            modelling club of the National Institute of Technology, Jalandhar. We
            are a collective of students who believe that style is a language and
            the runway is a stage for self-expression.
          </p>
          <p>
            From ramp walks and photoshoots to grooming workshops and themed
            showcases, we cultivate confidence, discipline, and creativity. Every
            member finds their voice here, whether behind the lens, on the ramp, or
            in the styling room.
          </p>
          <p>
            We represent NIT Jalandhar at inter-college fests across the region,
            turning heads and setting trends with every appearance.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center gap-2 bg-card px-6 py-10 text-center"
            >
              <span className="font-serif text-4xl font-semibold text-primary">
                {s.value}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
