import { uniqueMaker } from './uniqueMaker'
export const titleGenerator = (members = [], ids, id) => {
  const title = [
    [
      ...uniqueMaker(
        members.filter((m) => ids.findIndex((id) => id == m.user.id) > -1 && m.user.id != id),
        'userId',
      ),
    ]
      .map((u) => u.user.displayName)
      .join(', '),
    ' You',
  ]
  const finalTitle = title.filter((t) => !!t)
  if (finalTitle.length > 1) return title.join(',')
  return 'You'
}
