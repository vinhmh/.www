import { v4 as uuidv4 } from 'uuid'

export const generateName = (selectedFile) =>
  selectedFile.name.split('.')[0] + '.' + uuidv4() + '.' + selectedFile.name.split('.')[1]

export const getOriginFileName = (url) => {
  const urlWithoutSlash = /[^/]*$/.exec(url)[0]
  // .split('.')
  // urlWithoutSlash.splice(1, 1)
  return urlWithoutSlash
}
