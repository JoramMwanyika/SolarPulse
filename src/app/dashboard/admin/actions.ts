'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Service Role Key')
  }
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
}

export async function addSite(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify User Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 2. Get User Organization
  const { data: userProfile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userProfile?.organization_id) return { error: 'No organization found' }

  // 3. Extract Form Data
  const siteName = formData.get('siteName') as string
  const lat = parseFloat(formData.get('latitude') as string)
  const lng = parseFloat(formData.get('longitude') as string)
  const capacity = parseFloat(formData.get('capacity') as string)
  const inverterType = formData.get('inverterType') as string
  const apiKey = formData.get('apiKey') as string

  if (!siteName || isNaN(lat) || isNaN(lng) || isNaN(capacity)) {
    return { error: 'Please provide all required fields correctly.' }
  }

  try {
    const adminClient = getAdminClient()

    // 4. Insert Site (Bypassing RLS insert restriction)
    const { error: insertError } = await adminClient
      .from('sites')
      .insert([{
        organization_id: userProfile.organization_id,
        site_name: siteName,
        latitude: lat,
        longitude: lng,
        total_kwp: capacity,
        inverter_brand: inverterType,
        api_key: apiKey || null,
        is_active: true
      }])

    if (insertError) throw insertError

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: any) {
    console.error('Error adding site:', err)
    return { error: err.message || 'Failed to add site' }
  }
}

export async function deleteSite(siteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Ensure user can only delete their own org's sites
  const { data: userProfile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userProfile?.organization_id) return { error: 'Unauthorized' }

  try {
    const adminClient = getAdminClient()
    
    // Check if site belongs to this org
    const { data: site } = await adminClient
      .from('sites')
      .select('organization_id')
      .eq('id', siteId)
      .single()
      
    if (site?.organization_id !== userProfile.organization_id) {
      return { error: 'Unauthorized to delete this site' }
    }

    const { error } = await adminClient
      .from('sites')
      .delete()
      .eq('id', siteId)

    if (error) throw error

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: any) {
    return { error: 'Failed to delete site' }
  }
}
