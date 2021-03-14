import Admin from './admin'
import User from '../../models/user'

export const usersAll = () => {
  Admin.broadcast(Admin.USERS_ALL, { data: User.all })
}
