'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-svh items-center overflow-hidden">
      <Image
        src="/images/hero.png"
        alt="MERVEILLEUX model on the runway"
        fill
        priority
        className="object-cover object-center opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start px-6">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs uppercase tracking-[0.4em] text-primary"
        >
          NIT Jalandhar · Fashion & Modelling Club
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl text-balance font-serif text-5xl font-semibold leading-[1.05] text-foreground sm:text-6xl md:text-7xl"
        >
          Where Confidence Meets the Runway
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground"
        >
          MERVEILLEUX is the official fashion and modelling club of NIT Jalandhar —
          a home for expression, poise, and the art of the walk.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Button asChild size="lg" className="rounded-none tracking-wide">
            <Link href="#join">Join the Club</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-none border-foreground/30 tracking-wide"
          >
            <Link href="#lookbook">View Lookbook</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
