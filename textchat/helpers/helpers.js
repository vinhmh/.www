export const langOptions = (conferences = []) => {
  if (conferences.length) {
    return conferences.map(c => {
      const value = c.code
      return { key: value, text: c.title, value }
    })
  }

  const { langs } = CONFIG
  return langs.map(lang => {
    const value = lang.id
    return { key: value, text: lang.title, value }
  })
}
