import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's org
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  const orgId = userProfile.organization_id

  // 1. Insert Sites
  const mockSites = [
    {
      organization_id: orgId,
      site_name: 'Moi University ESA Annex',
      latitude: 0.286389,
      longitude: 35.2891,
      inverter_brand: 'Huawei',
      total_kwp: 540,
    },
    {
      organization_id: orgId,
      site_name: 'Site Alpha',
      latitude: -1.2921,
      longitude: 36.8219,
      inverter_brand: 'Deye',
      total_kwp: 120,
    },
    {
      organization_id: orgId,
      site_name: 'Site Beta',
      latitude: -0.3031,
      longitude: 36.0800,
      inverter_brand: 'Huawei',
      total_kwp: 80,
    },
    {
      organization_id: orgId,
      site_name: 'Site Gamma',
      latitude: -4.0435,
      longitude: 39.6682,
      inverter_brand: 'Victron',
      total_kwp: 200,
    }
  ]

  const { data: insertedSites, error: sitesError } = await supabase
    .from('sites')
    .insert(mockSites)
    .select()

  if (sitesError || !insertedSites) {
    return NextResponse.json({ error: 'Failed to insert sites', details: sitesError }, { status: 500 })
  }

  // 2. Insert Telemetry for each site
  const telemetryData = insertedSites.map((site, idx) => {
    let power = 0
    let status = 'Offline'
    if (idx === 0) { power = 8.4; status = 'Normal' }
    if (idx === 1) { power = 5.1; status = 'Underperforming' }
    if (idx === 2) { power = 12.7; status = 'Normal' }
    
    return {
      site_id: site.id,
      timestamp: new Date().toISOString(),
      current_power_kw: power,
      daily_energy_kwh: power * 5,
      total_energy_kwh: power * 100,
      status: status
    }
  })

  await supabase.from('telemetry').insert(telemetryData)

  // 3. Insert Alerts
  await supabase.from('alerts').insert([
    {
      site_id: insertedSites[1].id, // Site Alpha
      severity: 'warning',
      message: 'Output dropped below expected threshold (65% of expected)'
    },
    {
      site_id: insertedSites[3].id, // Site Gamma
      severity: 'critical',
      message: 'Inverter communication lost'
    }
  ])

  return NextResponse.json({ success: true, message: 'Database seeded successfully with dummy data!' })
}
