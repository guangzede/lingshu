const runtimeEnv = typeof process !== 'undefined' ? (runtimeEnv as any) : {};
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = (runtimeEnv as any).SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = (runtimeEnv as any).SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase
