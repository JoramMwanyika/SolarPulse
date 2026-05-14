import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
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

  const orgId = userProfile.organization_id

  // Fetch Sites
  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .eq('organization_id', orgId)

  // Fetch Latest Telemetry for each site (to populate initial map & KPIs)
  const { data: telemetry } = await supabase
    .from('telemetry')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100) // Getting recent ones. In a real app you'd do a DISTINCT ON site_id

  // Fetch Active Alerts
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <DashboardClient 
      initialSites={sites || []} 
      initialTelemetry={telemetry || []} 
      initialAlerts={alerts || []} 
    />
  )
}
