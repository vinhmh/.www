export const LANGUAGES_SUPPORT = ['EN', 'NL', 'FR', 'IT', 'PT', 'ES', 'PL', 'RU', 'DE']

export const langGenerator = (lang) => {
  const finalLang = LANGUAGES_SUPPORT.findIndex((l) => l == lang) > -1 ? lang : 'EN'
  return finalLang
}
