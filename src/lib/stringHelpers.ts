export const stringHelpers = {
  capitalize: (str: string) => 
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),

  truncate: (str: string, length: number) => 
    str.length > length ? `${str.slice(0, length)}...` : str,

  slug: (str: string) => 
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),

  initials: (name: string) => 
    name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),

  mask: (str: string, visibleChars = 4) => 
    str.slice(0, visibleChars) + '*'.repeat(Math.max(0, str.length - visibleChars)),

  pluralize: (count: number, singular: string, plural: string) => 
    count === 1 ? singular : plural,
};
