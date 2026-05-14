import { createClient } from '@/utils/supabase/server'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
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
    .select('*')
    .eq('organization_id', userProfile.organization_id)
    .order('created_at', { ascending: false })

  // Fetch recent alerts for the timeline
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return <AnalyticsClient sites={sites || []} initialAlerts={alerts || []} />
}
