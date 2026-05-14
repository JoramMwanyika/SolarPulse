'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const orgName = formData.get('organization') as string || `${fullName}'s Org`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // We need to bypass RLS to provision the organization and user profile.
    // Create an admin client using the service role key.
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local")
      return { error: 'Server configuration error: Missing Service Role Key.' }
    }

    const adminAuthClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // 1. Create Organization (Bypassing RLS)
    const { data: orgData, error: orgError } = await adminAuthClient
      .from('organizations')
      .insert([{ name: orgName }])
      .select()
      .single()

    if (orgError) {
      console.error('Error creating organization:', orgError)
      return { error: 'Failed to setup organization' }
    }

    // 2. Create User Profile (Bypassing RLS)
    const { error: userProfileError } = await adminAuthClient
      .from('users')
      .insert([{
        id: data.user.id,
        organization_id: orgData.id,
        full_name: fullName,
        email: email,
        role: 'admin'
      }])

    if (userProfileError) {
      console.error('Error creating user profile:', userProfileError)
      return { error: 'Failed to setup user profile' }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
