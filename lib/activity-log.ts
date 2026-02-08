import { supabaseBrowser } from '@/lib/supabase/client';

export interface ActivityLogEntry {
  admin_id?: string;
  admin_name: string;
  admin_email: string;
  action: string;
  entity_type: 'center' | 'evaluation' | 'token' | 'criteria' | 'submission' | 'user';
  entity_id: string;
  details?: Record<string, any>;
}

/**
 * Registra una actividad en el sistema
 */
export async function logActivity(entry: ActivityLogEntry) {
  const supabase = supabaseBrowser();
  
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      ...entry,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * Obtiene actividad reciente
 */
export async function getRecentActivity(limit = 50) {
  const supabase = supabaseBrowser();
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene actividad filtrada por tipo de entidad
 */
export async function getActivityByEntity(entityType: string, entityId: string) {
  const supabase = supabaseBrowser();
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Helper para obtener info del usuario actual (para admin_name y admin_email)
 */
export async function getCurrentUserInfo() {
  const supabase = supabaseBrowser();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  return {
    admin_id: user.id,
    admin_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
    admin_email: user.email || 'unknown@innova.com'
  };
}
