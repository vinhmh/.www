import en from '../Languages/en.json'
import fr from '../Languages/fr.json'
import it from '../Languages/it.json'
import es from '../Languages/es.json'

const LANGUAGES_SUPPORT = ['EN', 'NL', 'FR', 'IT', 'PT', 'ES', 'PL', 'RU', 'DE']

const termFinder = (theObject, path, separator) => {
  try {
    separator = separator || '.'

    return path
      .replace('[', separator)
      .replace(']', '')
      .split(separator)
      .reduce((obj, property) => obj[property], theObject)
  } catch (err) {
    return undefined
  }
}

const translator = (term, lang) => {
  if (LANGUAGES_SUPPORT.findIndex((l) => l == lang) == -1) {
    lang = 'EN'
  }
  switch (lang) {
    case 'EN':
      return termFinder(en, term)
    case 'FR':
      return termFinder(fr, term)
    case 'ES':
      return termFinder(es, term)
    case 'IT':
      return termFinder(it, term)
    default:
      return termFinder(en, term)
  }
}

export default translator
