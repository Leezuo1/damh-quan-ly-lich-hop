import { UserDocument } from './schemas/user.schema';

export function toPublicUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    position: user.position,
    role: user.role,
  };
}
