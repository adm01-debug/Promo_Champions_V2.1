import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorConfig {
  enabled: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
}

export const use2FA = () => {
  const queryClient = useQueryClient();

  const getStatus = useQuery<TwoFactorConfig>({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_2fa')
        .select('enabled')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        enabled: data?.enabled || false,
      };
    },
  });

  const setup = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Generate secret (would use library like otpauth)
      const secret = generateSecret();
      const qrCode = generateQRCode(user.user.email!, secret);

      const { error } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: user.user.id,
          secret: secret,
          enabled: false,
        });

      if (error) throw error;

      return { secret, qrCode };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
  });

  const verify = useMutation({
    mutationFn: async (token: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: config } = await supabase
        .from('user_2fa')
        .select('secret')
        .eq('user_id', user.user.id)
        .single();

      if (!config) throw new Error('2FA not setup');

      const isValid = verifyToken(config.secret, token);

      if (isValid) {
        await supabase
          .from('user_2fa')
          .update({ enabled: true, verified_at: new Date().toISOString() })
          .eq('user_id', user.user.id);
      }

      return isValid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
  });

  const disable = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_2fa')
        .update({ enabled: false })
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
  });

  return {
    status: getStatus.data,
    isLoading: getStatus.isLoading,
    setup,
    verify,
    disable,
  };
};

// Helper functions (simplified - would use proper libraries)
function generateSecret(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateQRCode(email: string, secret: string): string {
  return `otpauth://totp/SalesPro:${email}?secret=${secret}&issuer=SalesPro`;
}

function verifyToken(secret: string, token: string): boolean {
  // Would use proper TOTP verification
  return token.length === 6;
}
