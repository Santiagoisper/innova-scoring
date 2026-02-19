import { describe, expect, it } from "vitest";
import { detectCriticalRuleChange } from "./helpers";

describe("detectCriticalRuleChange", () => {
  it("returns true when forcesMinimumStatus is relaxed (e.g. Not Approved -> Approved)", () => {
    const existing = { forcesMinimumStatus: "Not Approved", blocksApproval: true, active: true };
    const updates = { forcesMinimumStatus: "Approved" };
    expect(detectCriticalRuleChange(existing, updates)).toBe(true);
  });

  it("returns false when forcesMinimumStatus is tightened", () => {
    const existing = { forcesMinimumStatus: "Approved", blocksApproval: false, active: true };
    const updates = { forcesMinimumStatus: "Not Approved" };
    expect(detectCriticalRuleChange(existing, updates)).toBe(false);
  });

  it("returns true when blocksApproval changes from true to false", () => {
    const existing = { forcesMinimumStatus: "Approved", blocksApproval: true, active: true };
    const updates = { blocksApproval: false };
    expect(detectCriticalRuleChange(existing, updates)).toBe(true);
  });

  it("returns true when active rule with blocksApproval is deactivated", () => {
    const existing = { forcesMinimumStatus: "Not Approved", blocksApproval: true, active: true };
    const updates = { active: false };
    expect(detectCriticalRuleChange(existing, updates)).toBe(true);
  });

  it("returns false for unrelated updates", () => {
    const existing = { forcesMinimumStatus: "Approved", blocksApproval: false, active: true };
    const updates = { requiredActionText: "New text" };
    expect(detectCriticalRuleChange(existing, updates)).toBe(false);
  });
});
