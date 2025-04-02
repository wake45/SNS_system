import { User } from '../user/schemas/user.schema'; // User 스키마의 경로에 맞게 수정

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
