# -*- coding: utf-8 -*-
# Guards de sessao nos caminhos de erro dos callbacks MFA: toast de uma
# operacao do usuario A nao pode aparecer na tela do usuario B.
path = "src/hooks/useMFA.ts"
with open(path, encoding="utf-8") as f:
    c = f.read()

subs = [
  # initializeTOTP catch
  ("""      if (import.meta.env.DEV) {
        console.error('Error initializing TOTP:', error);
      }
      toast.error('Erro ao inicializar TOTP');
      return null;""",
   """      if (import.meta.env.DEV) {
        console.error('Error initializing TOTP:', error);
      }
      if (isCurrentUser()) toast.error('Erro ao inicializar TOTP');
      return null;"""),
  # verifyAndEnableTOTP catch (indentação de 8 dentro do useCallback)
  ("""        if (import.meta.env.DEV) {
          console.error('Error verifying TOTP:', error);
        }
        toast.error('Código inválido');
        return false;""",
   """        if (import.meta.env.DEV) {
          console.error('Error verifying TOTP:', error);
        }
        if (isCurrentUser()) toast.error('Código inválido');
        return false;"""),
  # disableTOTP catch
  ("""      if (import.meta.env.DEV) {
        console.error('Error disabling TOTP:', error);
      }
      toast.error('Erro ao desativar TOTP');
      return false;""",
   """      if (import.meta.env.DEV) {
        console.error('Error disabling TOTP:', error);
      }
      if (isCurrentUser()) toast.error('Erro ao desativar TOTP');
      return false;"""),
]

for old, new in subs:
    assert c.count(old) == 1, f"nao achou: {old[:60]!r}"
    c = c.replace(old, new)

# setupSMS / verifySMSCode / disableSMS / verifyMFA / setPreferredMethod nao
# tem isCurrentUser — adiciono a closure e guardo os toasts de sucesso/erro.
pairs = [
  # setupSMS: define closure e guarda
  ("""      const uid = user?.id;
      if (!uid) return false;

      try {
        const { data, error } = await supabase.rpc('setup_sms_mfa', {
          p_phone: phoneNumber,
        });

        if (error) throw error;
        if (userRef.current?.id !== uid) return false;
        toast.info(`Código enviado para ${phoneNumber}`);
        return !!data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error setting up SMS:', error);
        }
        toast.error('Erro ao configurar SMS');
        return false;
      }""",
   """      const uid = user?.id;
      if (!uid) return false;
      const isCurrentUser = () => userRef.current?.id === uid;

      try {
        const { data, error } = await supabase.rpc('setup_sms_mfa', {
          p_phone: phoneNumber,
        });

        if (error) throw error;
        if (!isCurrentUser()) return false;
        toast.info(`Código enviado para ${phoneNumber}`);
        return !!data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error setting up SMS:', error);
        }
        if (isCurrentUser()) toast.error('Erro ao configurar SMS');
        return false;
      }"""),
  # verifySMSCode
  ("""      const uid = user?.id;
      if (!uid) return false;

      try {
        const { data, error } = await supabase.rpc('verify_and_enable_sms', {
          p_code: code,
        });

        if (error) throw error;

        if (data) {
          await fetchStatus();
          if (userRef.current?.id !== uid) return false;
          toast.success('SMS verificado e ativado!');
          return true;
        } else {
          toast.error('Código inválido ou expirado');
          return false;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error verifying SMS:', error);
        }
        toast.error('Erro ao verificar SMS');
        return false;
      }""",
   """      const uid = user?.id;
      if (!uid) return false;
      const isCurrentUser = () => userRef.current?.id === uid;

      try {
        const { data, error } = await supabase.rpc('verify_and_enable_sms', {
          p_code: code,
        });

        if (error) throw error;
        if (!isCurrentUser()) return false;

        if (data) {
          await fetchStatus();
          if (!isCurrentUser()) return false;
          toast.success('SMS verificado e ativado!');
          return true;
        } else {
          toast.error('Código inválido ou expirado');
          return false;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error verifying SMS:', error);
        }
        if (isCurrentUser()) toast.error('Erro ao verificar SMS');
        return false;
      }"""),
  # disableSMS
  ("""      const uid = user?.id;
      if (!uid) return false;

      try {
        const { data, error } = await supabase.rpc('disable_sms');
        if (error) throw error;
        await fetchStatus();
        if (userRef.current?.id !== uid) return false;
        toast.success('SMS desativado');
        return !!data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error disabling SMS:', error);
        }
        toast.error('Erro ao desativar SMS');
        return false;
      }""",
   """      const uid = user?.id;
      if (!uid) return false;
      const isCurrentUser = () => userRef.current?.id === uid;

      try {
        const { data, error } = await supabase.rpc('disable_sms');
        if (error) throw error;
        if (!isCurrentUser()) return false;
        await fetchStatus();
        if (!isCurrentUser()) return false;
        toast.success('SMS desativado');
        return !!data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error disabling SMS:', error);
        }
        if (isCurrentUser()) toast.error('Erro ao desativar SMS');
        return false;
      }"""),
  # verifyMFA — branch sem data precisa do guard antes do toast de erro
  ("""      const uid = user?.id;
      if (!uid) return false;

      try {
        const { data, error } = await supabase.rpc('verify_mfa_code', {
          p_code: method === 'backup_code' ? code.toUpperCase() : code,
          p_method: method || undefined,
        });

        if (error) throw error;

        if (data) {
          if (userRef.current?.id !== uid) return false;
          if (method === 'backup_code') {
            toast.success('Código de backup usado');
          }
          return true;
        } else {
          toast.error('Código inválido');
          return false;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error verifying MFA:', error);
        }
        toast.error('Erro na verificação MFA');
        return false;
      }""",
   """      const uid = user?.id;
      if (!uid) return false;
      const isCurrentUser = () => userRef.current?.id === uid;

      try {
        const { data, error } = await supabase.rpc('verify_mfa_code', {
          p_code: method === 'backup_code' ? code.toUpperCase() : code,
          p_method: method || undefined,
        });

        if (error) throw error;
        if (!isCurrentUser()) return false;

        if (data) {
          if (method === 'backup_code') {
            toast.success('Código de backup usado');
          }
          return true;
        } else {
          toast.error('Código inválido');
          return false;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error verifying MFA:', error);
        }
        if (isCurrentUser()) toast.error('Erro na verificação MFA');
        return false;
      }"""),
  # setPreferredMethod — toast de sucesso ja tem guarda; catch precisa
  ("""        if (error) throw error;
        await fetchStatus();
        if (userRef.current?.id !== uid) return false;
        toast.success(`Método preferido: ${method.toUpperCase()}`);
        return !!data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error setting preferred method:', error);
        }
        return false;
      }""",
   """        if (error) throw error;
        if (userRef.current?.id !== uid) return false;
        await fetchStatus();
        if (userRef.current?.id !== uid) return false;
        toast.success(`Método preferido: ${method.toUpperCase()}`);
        return !!data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error setting preferred method:', error);
        }
        return false;
      }"""),
]

for old, new in pairs:
    assert c.count(old) == 1, f"nao achou: {old[:80]!r}"
    c = c.replace(old, new)

# regenerateBackupCodes catch: guarda o toast de erro tambem
old = """        console.error('Error regenerating backup codes:', error);
      }
      toast.error('Erro ao regenerar códigos');
      return null;"""
new = """        console.error('Error regenerating backup codes:', error);
      }
      if (userRef.current?.id === uid) toast.error('Erro ao regenerar códigos');
      return null;"""
assert c.count(old) == 1
c = c.replace(old, new)

# Expõe statusError no retorno do hook
old = "    isLoading,\n    totpSecret: null as string | null,"
new = "    isLoading,\n    statusError,\n    totpSecret: null as string | null,"
assert c.count(old) == 1
c = c.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("OK useMFA")
