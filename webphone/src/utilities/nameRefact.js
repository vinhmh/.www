const ucFirst = str => str.charAt(0).toUpperCase() + str.slice(1)

export const nameRefact = string => string.split('_').map(name => ucFirst(name)).join(' ')