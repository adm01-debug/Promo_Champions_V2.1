export function detectDeviceInfo() {
  const ua = navigator.userAgent;

  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  return { browser, os, userAgent: ua };
}

export function getStoredSessionId(): string | null {
  return localStorage.getItem('session_id');
}

export function setStoredSessionId(id: string) {
  localStorage.setItem('session_id', id);
}

export function clearStoredSessionId() {
  localStorage.removeItem('session_id');
}
