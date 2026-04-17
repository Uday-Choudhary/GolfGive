import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface StatItem {
  value: number
  label: string
  prefix?: string
  suffix?: string
  isCurrency?: boolean
}

interface StatBarProps {
  stats: StatItem[]
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    if (!triggered) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [triggered, target, duration])

  return { count, setTriggered }
}

function StatItem({ stat, delay }: { stat: StatItem; delay: number }) {
  const { count, setTriggered } = useCountUp(stat.value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [setTriggered])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-1 px-6"
    >
      <span className="font-mono text-3xl font-semibold text-gold tabular-nums">
        {stat.prefix || ''}
        {stat.isCurrency ? formatCurrency(count) : count.toLocaleString()}
        {stat.suffix || ''}
      </span>
      <span className="text-xs uppercase tracking-widest text-slate font-sans">{stat.label}</span>
    </motion.div>
  )
}

export function StatBar({ stats }: StatBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center divide-x divide-stone">
      {stats.map((stat, i) => (
        <StatItem key={stat.label} stat={stat} delay={i * 0.15} />
      ))}
    </div>
  )
}
