'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function resolveAlert(alertId: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('alerts')
    .update({ is_resolved: true })
    .eq('id', alertId)

  if (error) {
    console.error('Error resolving alert:', error)
    return { error: 'Failed to resolve alert' }
  }

  revalidatePath('/dashboard/alerts')
  return { success: true }
}

export async function acknowledgeAlert(alertId: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Acknowledge isn't currently a boolean in the DB schema, so we can append it to the message or add a column if we wanted.
  // For now, we will simulate it by appending [ACKNOWLEDGED] to the severity or handling it purely in client state.
  // Wait, if we can't change schema without user permission, we'll just update the severity or message string.
  // Let's prepend [ACK] to message for now.
  
  const { data: alert } = await supabase.from('alerts').select('message').eq('id', alertId).single()
  if (!alert) return { error: 'Not found' }
  
  if (!alert.message.startsWith('[ACK]')) {
    await supabase
      .from('alerts')
      .update({ message: `[ACK] ${alert.message}` })
      .eq('id', alertId)
  }

  revalidatePath('/dashboard/alerts')
  return { success: true }
}
