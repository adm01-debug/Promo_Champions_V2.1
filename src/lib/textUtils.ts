export const text = {
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  titleCase: (str: string): string => {
    return str.split(' ').map(word => text.capitalize(word)).join(' ');
  },
  
  truncate: (str: string, length: number, suffix = '...'): string => {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
  },
  
  slug: (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },
  
  initials: (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },
  
  mask: {
    phone: (value: string): string => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    },
    
    cpf: (value: string): string => {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
    
    cnpj: (value: string): string => {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },
    
    zipCode: (value: string): string => {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d{3})/, '$1-$2');
    },
  },
};
