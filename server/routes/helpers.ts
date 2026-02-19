import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function runCommand(command: string, args: string[], cwd = process.cwd()) {
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 10,
  });
  return {
    stdout: (stdout || "").trim(),
    stderr: (stderr || "").trim(),
  };
}

export function detectCriticalRuleChange(
  existing: { forcesMinimumStatus?: string | null; blocksApproval?: boolean; active?: boolean },
  updates: Record<string, unknown>
): boolean {
  const statusSeverity: Record<string, number> = {
    "Not Approved": 3,
    "Conditionally Approved": 2,
    "Approved": 1,
  };
  if (updates.forcesMinimumStatus != null && existing.forcesMinimumStatus != null) {
    const oldSev = statusSeverity[existing.forcesMinimumStatus] || 0;
    const newSev = statusSeverity[updates.forcesMinimumStatus as string] || 0;
    if (newSev < oldSev) return true;
  }
  if (updates.blocksApproval === false && existing.blocksApproval === true) return true;
  if (updates.active === false && existing.active === true && existing.blocksApproval) return true;
  return false;
}
