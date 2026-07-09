import { User } from '../../types';

export interface AuthProvider {
  /**
   * Initializes the auth state, checking for an existing session.
   * Returns the user if authenticated, null otherwise.
   */
  initialize(): Promise<User | null>;

  /**
   * Authenticates the user with email and password.
   */
  login(email: string, password?: string): Promise<User>;

  /**
   * Logs out the current user.
   */
  logout(): Promise<void>;

  /**
   * Returns the currently authenticated user synchronously.
   * Must be called AFTER initialize() has resolved.
   */
  current(): User | null;
}
