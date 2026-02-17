const runtimeDbCandidates = [
  "DATABASE_URL",
  "NEON_DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "SUPABASE_DATABASE_URL",
] as const;
const optionalButRecommended = [
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "OPENAI_API_KEY",
] as const;

function hasValue(name: string): boolean {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

function main() {
  const isStrict = Boolean(process.env.VERCEL || process.env.CI);
  const hasAnyDbUrl = runtimeDbCandidates.some((name) => hasValue(name));

  if (!hasAnyDbUrl && isStrict) {
    console.error("Vercel preflight failed.");
    console.error(
      `Missing database environment variable. Set one of: ${runtimeDbCandidates.join(", ")}`,
    );
    console.error(
      "Set these variables in Vercel Project Settings > Environment Variables and redeploy.",
    );
    process.exit(1);
  }
  if (!hasAnyDbUrl) {
    console.warn(
      `Vercel preflight warning. Missing database env in local shell. Expected one of: ${runtimeDbCandidates.join(", ")}`,
    );
    console.warn(
      "In production Vercel deploy this will fail if variables are not configured.",
    );
    return;
  }

  const dbUrl =
    process.env.DATABASE_URL ??
    process.env.NEON_DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.SUPABASE_DATABASE_URL ??
    "";
  if (!/^postgres(ql)?:\/\//i.test(dbUrl)) {
    console.error("Vercel preflight failed.");
    console.error("DATABASE_URL must be a valid Postgres connection string.");
    process.exit(1);
  }

  const missingOptional = optionalButRecommended.filter((name) => !hasValue(name));
  if (missingOptional.length > 0) {
    console.warn(
      `Vercel preflight warning. Optional variables not set: ${missingOptional.join(", ")}`,
    );
  }

  console.log("Vercel preflight OK.");
}

main();
