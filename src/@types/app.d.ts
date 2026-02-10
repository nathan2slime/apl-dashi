import { Session } from '~/app/session/session.model';

export type Request = Express.Request & {
  user: Session;
  cookies: Record<string, string>;
};
