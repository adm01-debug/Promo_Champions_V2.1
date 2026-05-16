import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { triggerHaptic } from '@/lib/haptics';

/**
 * useVoiceNavigation - Professional voice command system for hands-free app control.
 */
export function useVoiceNavigation() {
  const navigate = useNavigate();

  const handleCommand = useCallback((transcript: string) => {
    const text = transcript.toLowerCase();
    
    // Command patterns
    if (text.includes('ir para dashboard') || text.includes('ir para início')) {
      navigate('/dashboard');
      toast.success('Navegando para o Dashboard');
      triggerHaptic('light');
    } 
    else if (text.includes('ir para vendas')) {
      navigate('/vendas');
      toast.success('Navegando para Vendas');
      triggerHaptic('light');
    }
    else if (text.includes('ir para clientes')) {
      navigate('/clientes');
      toast.success('Navegando para Clientes');
      triggerHaptic('light');
    }
    else if (text.includes('ir para pipeline')) {
      navigate('/pipeline');
      toast.success('Navegando para Pipeline');
      triggerHaptic('light');
    }
    else if (text.includes('voltar')) {
      navigate(-1);
      toast.info('Voltando...');
      triggerHaptic('light');
    }
    else if (text.includes('fechar') || text.includes('sair')) {
      // Trigger Esc key
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }
    else if (text.includes('buscar') || text.includes('pesquisar')) {
      // Trigger Cmd+K
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    }
  }, [navigate]);

  useEffect(() => {
    // Check if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Listen for special activation key (Ctrl + Shift + V)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        
        window.dispatchEvent(new CustomEvent('voice-nav:listening', { detail: true }));
        recognition.start();
        
        toast.info('IA ouvindo comandos...', {
          description: 'Diga "Ir para Vendas", "Voltar", etc.',
          duration: 3000
        });

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          window.dispatchEvent(new CustomEvent('voice-nav:listening', { detail: false }));
          handleCommand(transcript);
        };

        recognition.onerror = () => {
          window.dispatchEvent(new CustomEvent('voice-nav:listening', { detail: false }));
          toast.error('Erro ao reconhecer voz');
        };

        recognition.onend = () => {
          window.dispatchEvent(new CustomEvent('voice-nav:listening', { detail: false }));
        };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCommand]);
}
