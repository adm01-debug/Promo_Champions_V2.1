import { describe, it, expect } from "vitest";
import { mapFormToComposeInput, DEFAULT_COMPOSE_VALUES } from "./aiEmailHelpers";

describe("AIEmailComposer mapping logic", () => {
  it("should map form values to API input correctly", () => {
    const formValues = {
      ...DEFAULT_COMPOSE_VALUES,
      goal: "proposal" as const,
      tone: "formal" as const,
    };
    
    const context = {
      recipientId: "rec_123",
      recipientType: "contact" as const,
      recipientName: "John Doe",
      recipientCompany: "Acme Corp"
    };

    const result = mapFormToComposeInput(formValues, context);

    expect(result.goal).toBe("proposal");
    expect(result.tone).toBe("formal");
    expect(result.recipient_id).toBe("rec_123");
    expect(result.recipient_type).toBe("contact");
    // Should NOT have contact_context for non-manual types
    expect(result.contact_context).toBeUndefined();
  });

  it("should include contact_context for manual recipient type", () => {
    const formValues = DEFAULT_COMPOSE_VALUES;
    const context = {
      recipientType: "manual" as const,
      recipientName: "Jane Smith",
      recipientCompany: "Startup Inc"
    };

    const result = mapFormToComposeInput(formValues, context);

    expect(result.recipient_type).toBe("manual");
    expect(result.contact_context).toEqual({
      name: "Jane Smith",
      company: "Startup Inc"
    });
  });

  it("should use fallback values for missing fields", () => {
    // Testing runtime fallback for partial object by casting to any
    const result = mapFormToComposeInput({ goal: "intro" } as never, {});
    
    expect(result.goal).toBe("intro");
    expect(result.tone).toBe(DEFAULT_COMPOSE_VALUES.tone);
    expect(result.language).toBe(DEFAULT_COMPOSE_VALUES.language);
  });
});
