import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface TwoFactorStatus {
  enabled: boolean;
  lastVerified?: Date;
}

export const use2FA = () => {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery<TwoFactorStatus>({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_2fa')
        .select('enabled, verified_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        enabled: data?.enabled || false,
        lastVerified: data?.verified_at ? new Date(data.verified_at) : undefined,
      };
    },
  });

  const setupMutation = useMutation({
    mutationFn: async (): Promise<TwoFactorSetup> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const secret = authenticator.generateSecret();
      const otpauth = authenticator.keyuri(user.email!, 'SalesPro', secret);
      const qrCode = await QRCode.toDataURL(otpauth);

      const backupCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      const { error } = await supabase
        .from('user_2fa')
        .upsert({ user_id: user.id, secret, enabled: false });

      if (error) throw error;

      await Promise.all(
        backupCodes.map((code) =>
          supabase.from('user_2fa_backup_codes').insert({
            user_id: user.id,
            code,
          })
        )
      );

      return { secret, qrCode, backupCodes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (token: string): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: config } = await supabase
        .from('user_2fa')
        .select('secret')
        .eq('user_id', user.id)
        .single();

      if (!config) throw new Error('2FA not setup');

      const isValid = authenticator.verify({
        token,
        secret: config.secret,
      });

      if (isValid) {
        await supabase
          .from('user_2fa')
          .update({
            enabled: true,
            verified_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        await supabase.from('user_2fa_log').insert({
          user_id: user.id,
          success: true,
        });
      } else {
        await supabase.from('user_2fa_log').insert({
          user_id: user.id,
          success: false,
        });
      }

      return isValid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
  });

  const disableMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase
        .from('user_2fa')
        .update({ enabled: false })
        .eq('user_id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
  });

  return {
    status,
    isLoading,
    setup: setupMutation,
    verify: verifyMutation,
    disable: disableMutation,
  };
};
