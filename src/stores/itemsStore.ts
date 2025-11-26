import { create } from 'zustand'
import { supabase, Tables } from '../lib/supabase'

interface ItemsState {
  items: Tables['items']['Row'][]
  categories: Tables['categories']['Row'][]
  loading: boolean
  error: string | null
  fetchItems: (filters?: {
    category?: string
    status?: string
    location?: string
    search?: string
    owner_id?: string
  }) => Promise<void>
  fetchItemById: (id: string) => Promise<Tables['items']['Row'] | null>
  createItem: (item: Omit<Tables['items']['Insert'], 'owner_id'>) => Promise<void>
  updateItem: (id: string, updates: Tables['items']['Update']) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  fetchCategories: () => Promise<void>
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  categories: [],
  loading: false,
  error: null,

  fetchItems: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      let query = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.location) {
        query = query.eq('location_found', filters.location)
      }
      if (filters.owner_id) {
        query = query.eq('owner_id', filters.owner_id)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      set({ items: data || [], loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch items',
        loading: false 
      })
    }
  },

  fetchItemById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch item'
      })
      return null
    }
  },

  createItem: async (item) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('items')
        .insert({
          ...item,
          owner_id: user.id,
        })

      if (error) throw error
      
      await get().fetchItems()
      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create item',
        loading: false 
      })
      throw error
    }
  },

  updateItem: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      
      await get().fetchItems()
      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update item',
        loading: false 
      })
      throw error
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await get().fetchItems()
      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete item',
        loading: false 
      })
      throw error
    }
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      set({ categories: data || [] })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch categories'
      })
    }
  },
}))
