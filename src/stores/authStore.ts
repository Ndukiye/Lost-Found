import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  checkUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      set({ user: data.user, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign in',
        loading: false 
      })
      throw error
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      
      if (error) throw error
      
      set({ user: data.user, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign up',
        loading: false 
      })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ user: null, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign out',
        loading: false 
      })
      throw error
    }
  },

  checkUser: async () => {
    set({ loading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      set({ user, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred while checking user',
        loading: false 
      })
    }
  },
}))