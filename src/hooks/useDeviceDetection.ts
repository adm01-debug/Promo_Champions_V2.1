import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DeviceInfo {
  browser: string;
  os: string;
  userAgent: string;
  fingerprint: string;
}

const detectBrowser = (ua: string): string => {
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Unknown Browser';
};

const detectOS = (ua: string): string => {
  if (ua.includes('Windows NT 10')) return 'Windows 10';
  if (ua.includes('Windows NT 11')) return 'Windows 11';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux') && ua.includes('Android')) return 'Android';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown OS';
};

const generateFingerprint = (ua: string): string => {
  // Simple fingerprint based on available browser data
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  const renderer = gl?.getParameter(gl.RENDERER) || '';
  
  const data = [
    ua,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    renderer,
  ].join('|');
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const useDeviceDetection = () => {
  const { user } = useAuth();

  const getDeviceInfo = useCallback((): DeviceInfo => {
    const ua = navigator.userAgent;
    return {
      browser: detectBrowser(ua),
      os: detectOS(ua),
      userAgent: ua,
      fingerprint: generateFingerprint(ua),
    };
  }, []);

  const checkAndAlertNewDevice = useCallback(async () => {
    if (!user?.email) return;

    const deviceInfo = getDeviceInfo();
    
    try {
      // Get approximate IP (in production, this would come from the server)
      let ipAddress = 'Unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (e) {
        console.log('Could not fetch IP');
      }

      // Call edge function to check device and send alert if new
      const { data, error } = await supabase.functions.invoke('new-device-alert', {
        body: {
          user_id: user.id,
          user_email: user.email,
          device_fingerprint: deviceInfo.fingerprint,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip_address: ipAddress,
        },
      });

      if (error) {
        console.error('Error checking device:', error);
        return;
      }

      if (data?.is_new) {
        console.log('New device detected and alert sent');
      }

      return data;
    } catch (error) {
      console.error('Error in device detection:', error);
    }
  }, [user, getDeviceInfo]);

  // Check device on login
  useEffect(() => {
    if (user) {
      // Small delay to ensure auth is complete
      const timer = setTimeout(() => {
        checkAndAlertNewDevice();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, checkAndAlertNewDevice]);

  return {
    getDeviceInfo,
    checkAndAlertNewDevice,
  };
};
