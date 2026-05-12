import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gbxedknmmpfwvgkekmng.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieGVka25tbXBmd3Zna2VrbW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTY1OTksImV4cCI6MjA5NDE3MjU5OX0.GWZB0ZGlNdYHaYczZP0W6trfR2fXR65dEPn4eyZqb6Y'

export const supabase = createClient(supabaseUrl, supabaseKey)
