CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"sector" text
);
--> statement-breakpoint
CREATE TABLE "admin_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_key" text NOT NULL,
	"trigger_key" text NOT NULL,
	"rule_priority" integer DEFAULT 1 NOT NULL,
	"forces_minimum_status" text,
	"blocks_approval" boolean DEFAULT false NOT NULL,
	"requires_capa" boolean DEFAULT false NOT NULL,
	"required_action_text" text,
	"evidence_required_text" text,
	"recommended_timeline_days" integer,
	"applies_to_phase" text,
	"applies_to_sponsor" text,
	"active" boolean DEFAULT true NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"created_at_utc" timestamp DEFAULT now() NOT NULL,
	"updated_at_utc" timestamp DEFAULT now() NOT NULL,
	"updated_by_user_id" varchar
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"permission" text DEFAULT 'readonly' NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "chat_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"user_type" text,
	"user_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_key" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible_in_report" boolean DEFAULT true NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"updated_at_utc" timestamp DEFAULT now() NOT NULL,
	"updated_by_user_id" varchar,
	CONSTRAINT "domains_domain_key_unique" UNIQUE("domain_key")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"type" text DEFAULT 'YesNo' NOT NULL,
	"category" text NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"is_knock_out" boolean DEFAULT false,
	"enabled" boolean DEFAULT true,
	"keywords" text[],
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "report_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action_type" text NOT NULL,
	"actor_user_id" varchar,
	"actor_name" text,
	"ip_address" text,
	"user_agent" text,
	"created_at_utc" timestamp DEFAULT now() NOT NULL,
	"before_state_json" jsonb,
	"after_state_json" jsonb,
	"details_json" jsonb,
	"is_critical_change" boolean DEFAULT false NOT NULL,
	"change_reason" text
);
--> statement-breakpoint
CREATE TABLE "report_signatures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar NOT NULL,
	"signed_by_name" text NOT NULL,
	"signed_by_role" text NOT NULL,
	"signed_at_utc" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"hash_at_signature" text NOT NULL,
	"signature_method" text DEFAULT 'acknowledgment' NOT NULL,
	"signature_payload" jsonb
);
--> statement-breakpoint
CREATE TABLE "report_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status_type" text NOT NULL,
	"executive_summary_text" text NOT NULL,
	"reevaluation_clause_text" text,
	"domain_paragraph_templates_json" jsonb,
	"version_number" integer DEFAULT 1 NOT NULL,
	"updated_by_user_id" varchar,
	"updated_at_utc" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" varchar NOT NULL,
	"report_version" text NOT NULL,
	"generated_by_user_id" varchar NOT NULL,
	"generated_at_utc" timestamp DEFAULT now() NOT NULL,
	"status_at_generation" text NOT NULL,
	"final_status" text NOT NULL,
	"score_snapshot_json" jsonb NOT NULL,
	"rules_snapshot_json" jsonb NOT NULL,
	"templates_snapshot_json" jsonb NOT NULL,
	"mappings_snapshot_json" jsonb NOT NULL,
	"narrative_snapshot_json" jsonb,
	"capa_items_json" jsonb,
	"pdf_storage_path" text,
	"hash_sha256" text,
	"is_locked" boolean DEFAULT false NOT NULL,
	"previous_report_id" varchar
);
--> statement-breakpoint
CREATE TABLE "score_status_mapping" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"min_score" integer NOT NULL,
	"max_score" integer NOT NULL,
	"status_label" text NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"updated_by_user_id" varchar,
	"updated_at_utc" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"token" text,
	"location" text,
	"code" text,
	"country" text,
	"city" text,
	"address" text,
	"phone" text,
	"score" integer DEFAULT 0,
	"answers" jsonb DEFAULT '{}'::jsonb,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"evaluated_at" timestamp,
	"evaluated_by" text,
	"token_sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "terms_acceptance" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" varchar NOT NULL,
	"registrant_name" text NOT NULL,
	"registrant_email" text NOT NULL,
	"site_name" text,
	"accepted" boolean DEFAULT true NOT NULL,
	"accepted_at_utc" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"terms_version" text DEFAULT '1.0' NOT NULL,
	"terms_effective_date" text DEFAULT '2026-02-11' NOT NULL,
	"terms_text_sha256" text NOT NULL
);
