import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'
// import dotenv from 'dotenv'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key'
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}