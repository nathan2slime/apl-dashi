import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CookieAuthGuard extends AuthGuard('cookie') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<T>(err: Error | null, user: T) {
    if (err || !user) throw err || new UnauthorizedException();

    return user;
  }
}
