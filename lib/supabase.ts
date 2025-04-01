import { createClient } from "@supabase/supabase-js"
import { config } from "./config"

// Create a single supabase client for interacting with your database
export const supabase = createClient(config.supabase.url!, config.supabase.anonKey!)

// Create a supabase admin client with the service role key
export const supabaseAdmin = createClient(config.supabase.url!, config.supabase.serviceRoleKey!)

