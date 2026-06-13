import { createBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para componentes client
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Cliente para Server Components (Next.js 15)
export async function createServerClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return createSSRServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}