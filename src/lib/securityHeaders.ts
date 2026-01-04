// Security Headers Helper
export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

export const applySecurityHeaders = () => {
  // These headers should be set at the server level
  // This is a reference for documentation purposes
  return SECURITY_HEADERS;
};

// Verify security headers are present
export const checkSecurityHeaders = async (): Promise<{
  present: string[];
  missing: string[];
}> => {
  const response = await fetch(window.location.href, { method: 'HEAD' });
  const headers = response.headers;
  
  const requiredHeaders = Object.keys(SECURITY_HEADERS);
  const present: string[] = [];
  const missing: string[] = [];
  
  requiredHeaders.forEach(header => {
    if (headers.has(header)) {
      present.push(header);
    } else {
      missing.push(header);
    }
  });
  
  return { present, missing };
};
