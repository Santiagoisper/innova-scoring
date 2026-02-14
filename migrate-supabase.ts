import pg from "pg";

const rawUrl = process.env.SUPABASE_DATABASE_URL || "";
const url = rawUrl.replace(/^[\s\n\r]+/, "").replace(/[\s\n\r]+$/, "");
console.log("Connecting to Supabase...");

const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Connected! Creating tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        permission TEXT NOT NULL DEFAULT 'readonly',
        role TEXT NOT NULL DEFAULT 'admin'
      );
      CREATE TABLE IF NOT EXISTS sites (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        contact_name TEXT NOT NULL,
        email TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        token TEXT, location TEXT, code TEXT, country TEXT, city TEXT, address TEXT, phone TEXT,
        score INTEGER DEFAULT 0,
        answers JSONB DEFAULT '{}',
        registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        evaluated_at TIMESTAMP, evaluated_by TEXT, token_sent_at TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        text TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'YesNo',
        category TEXT NOT NULL, weight INTEGER NOT NULL DEFAULT 1,
        is_knock_out BOOLEAN DEFAULT false, enabled BOOLEAN DEFAULT true,
        keywords TEXT[], sort_order INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        "user" TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW(), type TEXT NOT NULL DEFAULT 'info', sector TEXT
      );
      CREATE TABLE IF NOT EXISTS chat_logs (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL,
        user_type TEXT, user_name TEXT, created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS terms_acceptance (
        id SERIAL PRIMARY KEY,
        site_id VARCHAR NOT NULL, registrant_name TEXT NOT NULL, registrant_email TEXT NOT NULL,
        site_name TEXT, accepted BOOLEAN NOT NULL DEFAULT true,
        accepted_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address TEXT, user_agent TEXT,
        terms_version TEXT NOT NULL DEFAULT '1.0',
        terms_effective_date TEXT NOT NULL DEFAULT '2026-02-11',
        terms_text_sha256 TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id VARCHAR NOT NULL, report_version TEXT NOT NULL,
        generated_by_user_id VARCHAR NOT NULL,
        generated_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
        status_at_generation TEXT NOT NULL, final_status TEXT NOT NULL,
        score_snapshot_json JSONB NOT NULL, rules_snapshot_json JSONB NOT NULL,
        templates_snapshot_json JSONB NOT NULL, mappings_snapshot_json JSONB NOT NULL,
        narrative_snapshot_json JSONB, capa_items_json JSONB,
        pdf_storage_path TEXT, hash_sha256 TEXT,
        is_locked BOOLEAN NOT NULL DEFAULT false, previous_report_id VARCHAR
      );
      CREATE TABLE IF NOT EXISTS report_signatures (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        report_id VARCHAR NOT NULL, signed_by_name TEXT NOT NULL,
        signed_by_role TEXT NOT NULL, signed_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address TEXT, user_agent TEXT, hash_at_signature TEXT NOT NULL,
        signature_method TEXT NOT NULL DEFAULT 'acknowledgment', signature_payload JSONB
      );
      CREATE TABLE IF NOT EXISTS admin_rules (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        domain_key TEXT NOT NULL, trigger_key TEXT NOT NULL,
        rule_priority INTEGER NOT NULL DEFAULT 1,
        forces_minimum_status TEXT, blocks_approval BOOLEAN NOT NULL DEFAULT false,
        requires_capa BOOLEAN NOT NULL DEFAULT false,
        required_action_text TEXT, evidence_required_text TEXT,
        recommended_timeline_days INTEGER,
        applies_to_phase TEXT, applies_to_sponsor TEXT,
        active BOOLEAN NOT NULL DEFAULT true, version_number INTEGER NOT NULL DEFAULT 1,
        created_at_utc TIMESTAMP NOT NULL DEFAULT NOW(), updated_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by_user_id VARCHAR
      );
      CREATE TABLE IF NOT EXISTS report_templates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        status_type TEXT NOT NULL, executive_summary_text TEXT NOT NULL,
        reevaluation_clause_text TEXT,
        domain_paragraph_templates_json JSONB,
        version_number INTEGER NOT NULL DEFAULT 1,
        updated_by_user_id VARCHAR, updated_at_utc TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS domains (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        domain_key TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
        description TEXT, display_order INTEGER NOT NULL DEFAULT 0,
        is_visible_in_report BOOLEAN NOT NULL DEFAULT true,
        version_number INTEGER NOT NULL DEFAULT 1,
        updated_at_utc TIMESTAMP NOT NULL DEFAULT NOW(), updated_by_user_id VARCHAR
      );
      CREATE TABLE IF NOT EXISTS score_status_mapping (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        min_score INTEGER NOT NULL, max_score INTEGER NOT NULL,
        status_label TEXT NOT NULL, version_number INTEGER NOT NULL DEFAULT 1,
        updated_by_user_id VARCHAR, updated_at_utc TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS report_audit_log (
        id SERIAL PRIMARY KEY,
        entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, action_type TEXT NOT NULL,
        actor_user_id VARCHAR, actor_name TEXT, ip_address TEXT, user_agent TEXT,
        created_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
        before_state_json JSONB, after_state_json JSONB, details_json JSONB,
        is_critical_change BOOLEAN NOT NULL DEFAULT false, change_reason TEXT
      );
    `);

    console.log("All tables created successfully!");

    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log("Tables in Supabase:", result.rows.map((r: any) => r.table_name).join(", "));
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => { console.error("Error:", e.message); process.exit(1); });
