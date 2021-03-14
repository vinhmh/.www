export const sortByUser = (field) => (a, b) => {
  if (a["user"][field] < b["user"][field]) {
    return -1
  } else if (a["user"][field] < b["user"][field]) {
    return 1
  }
  return 0
}
