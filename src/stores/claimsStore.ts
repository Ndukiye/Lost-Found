import { create } from 'zustand'
import { supabase, Tables } from '../lib/supabase'

interface ClaimsState {
  claims: Tables['claims']['Row'][]
  loading: boolean
  error: string | null
  fetchClaims: () => Promise<void>
  fetchAllClaims: () => Promise<void>
  createClaim: (claim: Omit<Tables['claims']['Insert'], 'claimant_id'>) => Promise<void>
  updateClaimStatus: (id: string, status: 'pending' | 'approved' | 'rejected', reviewedBy: string) => Promise<void>
  fetchClaimsByItem: (itemId: string) => Promise<void>
}

export const useClaimsStore = create<ClaimsState>((set, get) => ({
  claims: [],
  loading: false,
  error: null,

  fetchClaims: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('claimant_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ claims: data || [], loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch claims',
        loading: false 
      })
    }
  },

  fetchAllClaims: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ claims: data || [], loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch all claims',
        loading: false 
      })
    }
  },

  createClaim: async (claim) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('claims')
        .insert({
          ...claim,
          claimant_id: user.id,
        })

      if (error) throw error
      
      await get().fetchClaims()
      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create claim',
        loading: false 
      })
      throw error
    }
  },

  updateClaimStatus: async (id, status, reviewedBy) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('claims')
        .update({ 
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      await get().fetchClaims()
      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update claim status',
        loading: false 
      })
      throw error
    }
  },

  fetchClaimsByItem: async (itemId) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('item_id', itemId)

      if (error) throw error
      set({ claims: data || [], loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch claims by item',
        loading: false 
      })
    }
  },
}))
