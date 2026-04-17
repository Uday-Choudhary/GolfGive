import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Trophy, Heart, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency, formatMonth } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const CHARITY_COLORS = ['#C8963E', '#0D3321', '#7C3AED', '#22C55E']

function KpiCard({ icon: Icon, label, value, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl p-6 border border-stone shadow-card"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="font-mono text-2xl font-semibold text-ink">{value}</p>
      <p className="font-sans text-xs uppercase tracking-widest text-slate mt-1">{label}</p>
    </motion.div>
  )
}

export function AdminReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.get('/admin/reports').then((r) => r.data),
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const kpis = data?.kpis
  const drawHistory = data?.drawHistory?.map((d: any) => ({
    name: formatMonth(d.month),
    pool: Math.round(d.totalPool),
    winners: d.winners,
  })) ?? []

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-forest">Platform Overview</h1>
        <p className="font-sans text-slate mt-1">Platform-wide metrics and performance.</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard icon={Users} label="Total Users" value={kpis?.totalUsers ?? 0} color="bg-forest" delay={0} />
        <KpiCard icon={TrendingUp} label="Active Subs" value={kpis?.activeSubscribers ?? 0} color="bg-green-500" delay={0.08} />
        <KpiCard icon={DollarSign} label="Monthly Revenue" value={formatCurrency(kpis?.monthlyRevenue ?? 0)} color="bg-gold" delay={0.16} />
        <KpiCard icon={Heart} label="Charity Distributed" value={formatCurrency(kpis?.totalCharityDistributed ?? 0)} color="bg-purple-500" delay={0.24} />
        <KpiCard icon={Trophy} label="Total Draws" value={kpis?.totalDraws ?? 0} color="bg-forest-mid" delay={0.32} />
        <KpiCard icon={Trophy} label="Total Winners" value={kpis?.totalWinners ?? 0} color="bg-amber-500" delay={0.4} />
        <KpiCard icon={Trophy} label="Pending Verif." value={kpis?.pendingWinners ?? 0} color="bg-red-400" delay={0.48} />
        <KpiCard icon={DollarSign} label="Total Paid Out" value={formatCurrency(kpis?.totalPaid ?? 0)} color="bg-teal-500" delay={0.56} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Draw history chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone p-6 shadow-card">
          <h3 className="font-heading text-xl text-forest mb-5">Prize Pool History</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={drawHistory}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="pool" fill="#C8963E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Charity breakdown */}
        <div className="bg-white rounded-xl border border-stone p-6 shadow-card">
          <h3 className="font-heading text-xl text-forest mb-5">Supporters by Charity</h3>
          {data?.charityBreakdown && data.charityBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.charityBreakdown} dataKey="users" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                    {data.charityBreakdown.map((_: any, i: number) => (
                      <Cell key={i} fill={CHARITY_COLORS[i % CHARITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-1.5 mt-3">
                {data.charityBreakdown.map((c: any, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-sans">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: CHARITY_COLORS[i % CHARITY_COLORS.length] }} />
                    <span className="text-ink flex-1 truncate">{c.name}</span>
                    <span className="text-slate">{c.users}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-slate text-sm font-sans">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
