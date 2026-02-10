/**
 * Represents an authentication session for a user.
 *
 * Contains access and refresh tokens together with metadata used to manage
 * and validate a user's active session.
 *
 * @remarks
 * Sessions typically map to a single device or browser instance and are used
 * to authorize requests and refresh short-lived access tokens.
 *
 * @property id - Unique identifier for the session (e.g., a UUID or database ID).
 * @property userId - Identifier of the user who owns this session.
 * @property createdAt - Timestamp when the session was created.
 * @property updatedAt - Timestamp when the session was last updated (for example, when tokens are rotated).
 */
export type Session = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
