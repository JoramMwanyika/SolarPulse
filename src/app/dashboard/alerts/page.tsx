import { createClient } from '@/utils/supabase/server'
import AlertsClient from './AlertsClient'

export default async function AlertsPage() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div>Unauthorized</div>
  }

  // Get user's org
  const { data: userProfile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()
    
  if (!userProfile?.organization_id) {
    return <div>Organization not found</div>
  }

  // Fetch Sites for this organization
  const { data: sites } = await supabase
    .from('sites')
    .select('id, site_name')
    .eq('organization_id', userProfile.organization_id)

  const siteIds = sites?.map(s => s.id) || []

  // Fetch alerts for these sites
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .in('site_id', siteIds)
    .order('created_at', { ascending: false })

  return <AlertsClient sites={sites || []} initialAlerts={alerts || []} />
}
