const ucFirst = str => str.charAt(0).toUpperCase() + str.slice(1)

export const displayName = string => string.split('_').map(name => ucFirst(name)).join(' ')

export const shortName = string => {
  if (string.match('-')) {
    return string.split(' ').map((name) => {
      if (name.match('-')) return name.split('-').map(n => `${n.charAt(0).toUpperCase()}.`).join('')
      return name
    })
  }

  const words = string.split(' ')
  const lastIndex = words.length - 1
  const last = words[lastIndex]
  words[lastIndex] = `${last.charAt(0).toUpperCase()}.`
  return words.join(' ')
}

export const getBoolean = value => {
  switch (value) {
    case true:
    case 'true':
    case 1:
    case '1':
    case 'on':
    case 'yes':
      return true
    default:
      return false
  }
}
