import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role para bypass RLS
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { center_id, client_email, client_name } = body;

    // Validaciones
    if (!center_id || !client_email) {
      return NextResponse.json(
        { error: 'Missing required fields: center_id, client_email' },
        { status: 400 }
      );
    }

    // Generar token único
    const token = await generateUniqueToken();

    // Crear client_submission
    const { data: submission, error: subError } = await supabase
      .from('client_submissions')
      .insert({
        center_id,
        client_email,
        client_name: client_name || client_email.split('@')[0],
        public_token: token,
        submission_status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (subError) throw subError;

    // Actualizar center con el token
    await supabase
      .from('centers')
      .update({ public_token: token })
      .eq('id', center_id);

    return NextResponse.json({
      success: true,
      token,
      submission_id: submission.id,
      evaluation_url: `${process.env.NEXT_PUBLIC_APP_URL}/cliente/${token}`,
    });

  } catch (error: any) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate token' },
      { status: 500 }
    );
  }
}

async function generateUniqueToken(): Promise<string> {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token: string;
  let exists = true;

  while (exists) {
    token = '';
    for (let i = 0; i < 32; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Verificar si ya existe
    const { data } = await supabase
      .from('client_submissions')
      .select('id')
      .eq('public_token', token)
      .single();

    exists = !!data;
  }

  return token!;
}
