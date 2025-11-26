import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      items: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          location_found: string
          date_found: string
          status: 'unclaimed' | 'claimed' | 'returned' | 'expired'
          owner_id: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          location_found: string
          date_found?: string
          status?: 'unclaimed' | 'claimed' | 'returned' | 'expired'
          owner_id: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          location_found?: string
          date_found?: string
          status?: 'unclaimed' | 'claimed' | 'returned' | 'expired'
          owner_id?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      claims: {
        Row: {
          id: string
          item_id: string
          claimant_id: string
          claim_date: string
          status: 'pending' | 'approved' | 'rejected'
          proof_details: string
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          claimant_id: string
          claim_date?: string
          status?: 'pending' | 'approved' | 'rejected'
          proof_details: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          claimant_id?: string
          claim_date?: string
          status?: 'pending' | 'approved' | 'rejected'
          proof_details?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Tables = Database['public']['Tables']
export type Item = Tables['items']['Row']
export type Claim = Tables['claims']['Row']
export type Category = Tables['categories']['Row']