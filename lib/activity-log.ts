import { supabaseBrowser } from '@/lib/supabase/client'

export type ActivityLogEntry = {
  id: number
  timestamp: string
  user: string
  action: string
  details: string
}

/**
 * Fetches recent activity logs for a center
 * @param centerId - The ID of the center
 * @param limit - Maximum number of entries to return
 * @returns Array of activity log entries
 */
export async function getRecentActivity(
  centerId: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  try {
    const supabase = supabaseBrowser()
    
    // Query activity_logs table if it exists
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('center_id', centerId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching activity logs:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Exception fetching activity logs:', error)
    return []
  }
}
