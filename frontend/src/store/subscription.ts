import { create } from 'zustand'
import { SubscriptionStatus, Plan } from '@/types'

interface SubscriptionState {
  status: SubscriptionStatus | null
  plan: Plan | null
  renewalDate: string | null
  setSubscription: (status: SubscriptionStatus, plan: Plan | null, renewalDate: string | null) => void
  clear: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  status: null,
  plan: null,
  renewalDate: null,
  setSubscription: (status, plan, renewalDate) => set({ status, plan, renewalDate }),
  clear: () => set({ status: null, plan: null, renewalDate: null }),
}))
