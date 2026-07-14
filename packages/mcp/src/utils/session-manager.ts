import config from '../config/index.js';

interface SessionOptions {
  ttl: number;
}

interface SessionWrapper<T> {
  data: T;
  expiresAt: number;
}

export class SessionManager<T> {
  private sessions: Map<string, SessionWrapper<T>>;
  private options: SessionOptions;
  private cleanupInterval: NodeJS.Timeout;

  constructor(options: SessionOptions = config.session) {
    this.sessions = new Map();
    this.options = options;
    // 定时清理过期会话；unref 让该 timer 不阻止进程退出（测试/CLI 场景）
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    this.cleanupInterval.unref();
  }

  /**
   * Set a session with the given ID and data
   */
  set(id: string, data: T): void {
    const expiresAt = Date.now() + this.options.ttl * 1000;
    this.sessions.set(id, { data, expiresAt });
  }

  /**
   * Get a session by ID. Updates the expiration time (sliding window).
   */
  get(id: string): T | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    // Check if expired
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(id);
      return undefined;
    }

    // Refresh expiration
    session.expiresAt = Date.now() + this.options.ttl * 1000;
    return session.data;
  }

  /**
   * Remove a session by ID
   */
  remove(id: string): void {
    this.sessions.delete(id);
  }

  /**
   * Get the number of active sessions
   */
  get size(): number {
    return this.sessions.size;
  }

  /**
   * Cleanup expired sessions
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(id);
      }
    }
  }

  /**
   * Stop the cleanup interval and clear all sessions
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.sessions.clear();
  }
}
