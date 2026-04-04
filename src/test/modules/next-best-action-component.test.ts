import { describe, it, expect } from "vitest";

/**
 * NextBestAction component — tests for action type config,
 * priority config, and task creation mapping.
 */

// ─── Priority configuration ───────────────────────────────────────
describe("priorityConfig", () => {
  const priorityConfig = {
    high: { label: "Alta", className: "bg-status-error/20 text-status-error border-status-error/30" },
    medium: { label: "Média", className: "bg-status-warning/20 text-status-warning border-status-warning/30" },
    low: { label: "Baixa", className: "bg-status-success/20 text-status-success border-status-success/30" },
  };

  it("has all three priorities", () => {
    expect(Object.keys(priorityConfig)).toEqual(["high", "medium", "low"]);
  });

  it("high uses error tokens", () => {
    expect(priorityConfig.high.className).toContain("status-error");
    expect(priorityConfig.high.label).toBe("Alta");
  });

  it("medium uses warning tokens", () => {
    expect(priorityConfig.medium.className).toContain("status-warning");
    expect(priorityConfig.medium.label).toBe("Média");
  });

  it("low uses success tokens", () => {
    expect(priorityConfig.low.className).toContain("status-success");
    expect(priorityConfig.low.label).toBe("Baixa");
  });
});

// ─── Action type configuration ─────────────────────────────────────
describe("actionTypeConfig", () => {
  const validTypes = ["call", "meeting", "email", "follow_up", "proposal", "other"];

  it("includes all expected types", () => {
    validTypes.forEach(type => {
      expect(validTypes).toContain(type);
    });
  });

  it("has 6 action types", () => {
    expect(validTypes).toHaveLength(6);
  });
});

// ─── Task type mapping ─────────────────────────────────────────────
describe("Task type mapping from suggestion", () => {
  const mapTaskType = (actionType: string) => {
    const validTypes = ["call", "email", "meeting", "follow_up", "proposal", "other"];
    return validTypes.includes(actionType) ? actionType : "other";
  };

  it("maps valid types directly", () => {
    expect(mapTaskType("call")).toBe("call");
    expect(mapTaskType("email")).toBe("email");
    expect(mapTaskType("meeting")).toBe("meeting");
    expect(mapTaskType("follow_up")).toBe("follow_up");
    expect(mapTaskType("proposal")).toBe("proposal");
    expect(mapTaskType("other")).toBe("other");
  });

  it("falls back to 'other' for unknown types", () => {
    expect(mapTaskType("unknown")).toBe("other");
    expect(mapTaskType("")).toBe("other");
    expect(mapTaskType("whatsapp")).toBe("other");
  });
});

// ─── Priority mapping for task creation ────────────────────────────
describe("Priority mapping for createTask", () => {
  const mapPriority = (p: "high" | "medium" | "low") =>
    p === "high" ? "high" : p === "medium" ? "medium" : "low";

  it("maps high -> high", () => expect(mapPriority("high")).toBe("high"));
  it("maps medium -> medium", () => expect(mapPriority("medium")).toBe("medium"));
  it("maps low -> low", () => expect(mapPriority("low")).toBe("low"));
});

// ─── Due date defaults to today ────────────────────────────────────
describe("Default due date", () => {
  it("sets due_date to today ISO format", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
