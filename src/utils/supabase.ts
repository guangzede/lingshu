import { createClient } from '@supabase/supabase-js'

const runtimeEnv = (
  typeof process !== 'undefined' && process.env ? process.env : {}
) as Record<string, string | undefined>

const SUPABASE_URL = runtimeEnv.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = runtimeEnv.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase
