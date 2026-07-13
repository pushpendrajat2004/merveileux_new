import { getMedia, getTeamMembers } from '@/lib/data'
import { Navbar } from '@/components/site/navbar'
import { Hero } from '@/components/site/hero'
import { AboutSection } from '@/components/site/about-section'
import { TeamSection } from '@/components/site/team-section'
import { LookbookSection } from '@/components/site/lookbook-section'
import { HistorySection } from '@/components/site/history-section'
import { JoinSection } from '@/components/site/join-section'
import { Footer } from '@/components/site/footer'

export default async function HomePage() {
  const [team, lookbook, history] = await Promise.all([
    getTeamMembers(),
    getMedia('lookbook'),
    getMedia('history'),
  ])

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <AboutSection />
      <TeamSection members={team} />
      <LookbookSection items={lookbook} />
      <HistorySection items={history} />
      <JoinSection />
      <Footer />
    </main>
  )
}
