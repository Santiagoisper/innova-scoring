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
  centerId?: string | number,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  try {
        // Handle overloaded parameters: if centerId is a number, treat it as limit
    let actualCenterId: string | undefined
    let actualLimit: number = limit
    
    if (typeof centerId === 'number') {
      actualLimit = centerId
      actualCenterId = undefined
    } else {
      actualCenterId = centerId
    }

    const supabase = supabaseBrowser()
    
    // Query activity_logs table if it exists
    // Build query
    let query = supabase
      .from('activity_logs')
      .select('*')
    
    // Only filter by center_id if provided
    if (actualCenterId) {
      query = query.eq('center_id', actualCenterId)
    }
    
    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(actualLimit)
    
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
