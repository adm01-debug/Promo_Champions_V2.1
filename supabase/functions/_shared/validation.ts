/**
 * Shared validation utilities for Edge Functions
 * Uses Zod-like manual validation for Deno edge runtime.
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Validate string field
 */
export function validateString(
  value: unknown,
  field: string,
  opts?: { required?: boolean; maxLength?: number; minLength?: number }
): ValidationError | null {
  const { required = false, maxLength = 10000, minLength = 0 } = opts ?? {};

  if (value === undefined || value === null || value === "") {
    return required ? { field, message: `${field} é obrigatório` } : null;
  }

  if (typeof value !== "string") {
    return { field, message: `${field} deve ser uma string` };
  }

  if (value.length < minLength) {
    return { field, message: `${field} deve ter pelo menos ${minLength} caracteres` };
  }

  if (value.length > maxLength) {
    return { field, message: `${field} excede o limite de ${maxLength} caracteres` };
  }

  return null;
}

/**
 * Validate UUID field
 */
export function validateUUID(value: unknown, field: string, required = false): ValidationError | null {
  if (!value) return required ? { field, message: `${field} é obrigatório` } : null;
  if (typeof value !== "string") return { field, message: `${field} deve ser uma string` };

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value) ? null : { field, message: `${field} não é um UUID válido` };
}

/**
 * Validate array field
 */
export function validateArray(
  value: unknown,
  field: string,
  opts?: { required?: boolean; maxLength?: number }
): ValidationError | null {
  const { required = false, maxLength = 100 } = opts ?? {};
  if (!value) return required ? { field, message: `${field} é obrigatório` } : null;
  if (!Array.isArray(value)) return { field, message: `${field} deve ser um array` };
  if (value.length > maxLength) return { field, message: `${field} excede o limite de ${maxLength} itens` };
  return null;
}

/**
 * Validate enum field
 */
export function validateEnum(
  value: unknown,
  field: string,
  allowed: string[],
  required = false
): ValidationError | null {
  if (!value) return required ? { field, message: `${field} é obrigatório` } : null;
  if (typeof value !== "string") return { field, message: `${field} deve ser uma string` };
  return allowed.includes(value) ? null : { field, message: `${field} deve ser: ${allowed.join(", ")}` };
}

/**
 * Collect validation errors, returning a 400 response if any
 */
export function collectErrors(errors: (ValidationError | null)[]): ValidationError[] {
  return errors.filter((e): e is ValidationError => e !== null);
}

/**
 * Create a standard 400 error response
 */
export function validationErrorResponse(
  errors: ValidationError[],
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ error: "Dados inválidos", details: errors }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
