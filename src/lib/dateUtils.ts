import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateUtils = {
  format: (date: Date | string, formatStr = 'dd/MM/yyyy') => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, formatStr, { locale: ptBR });
  },
  
  formatRelative: (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    
    return dateUtils.format(d);
  },
  
  addBusinessDays: (date: Date, days: number): Date => {
    let result = new Date(date);
    let remaining = days;
    
    while (remaining > 0) {
      result = addDays(result, 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        remaining--;
      }
    }
    
    return result;
  },
  
  isBusinessDay: (date: Date): boolean => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  },
  
  getBusinessDaysBetween: (start: Date, end: Date): number => {
    let count = 0;
    let current = new Date(start);
    
    while (current <= end) {
      if (dateUtils.isBusinessDay(current)) {
        count++;
      }
      current = addDays(current, 1);
    }
    
    return count;
  },
};
