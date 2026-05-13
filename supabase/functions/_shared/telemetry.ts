export async function withTelemetry(fnName: string, handler: (req: Request) => Promise<Response>): Promise<Response> {
  const start = Date.now();
  try {
    const response = await handler();
    const duration = Date.now() - start;
    console.info(`[TELEMETRY] ${fnName} success - duration: ${duration}ms - status: ${response.status}`);
    return response;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[TELEMETRY] ${fnName} failure - duration: ${duration}ms - error: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}
