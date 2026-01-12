import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../../src/utils/session-manager.js';

describe('SessionManager', () => {
  let sessionManager: SessionManager<any>;

  beforeEach(() => {
    vi.useFakeTimers();
    sessionManager = new SessionManager({ ttl: 60, timeout: 300 });
  });

  afterEach(() => {
    sessionManager.destroy();
    vi.useRealTimers();
  });

  it('should store and retrieve data', () => {
    const data = { id: 1 };
    sessionManager.set('session1', data);
    expect(sessionManager.get('session1')).toEqual(data);
  });

  it('should return undefined for non-existent session', () => {
    expect(sessionManager.get('non-existent')).toBeUndefined();
  });

  it('should remove session', () => {
    sessionManager.set('session1', { id: 1 });
    sessionManager.remove('session1');
    expect(sessionManager.get('session1')).toBeUndefined();
  });

  it('should expire session after TTL', () => {
    sessionManager.set('session1', { id: 1 });
    // Advance time past TTL (60s)
    vi.advanceTimersByTime(61000);
    expect(sessionManager.get('session1')).toBeUndefined();
  });

  it('should refresh expiration on access', () => {
    sessionManager.set('session1', { id: 1 });
    // Advance time by 30s (T=30)
    vi.advanceTimersByTime(30000);
    // Access session, refreshes TTL to T=30+60=90
    expect(sessionManager.get('session1')).toBeDefined();
    
    // Advance time by another 31s (T=61)
    vi.advanceTimersByTime(31000);
    // 61 < 90, so should still exist. Refreshes TTL to T=61+60=121
    expect(sessionManager.get('session1')).toBeDefined();
    
    // Advance time by another 61s (T=122)
    // 122 > 121, so should expire
    vi.advanceTimersByTime(61000);
    expect(sessionManager.get('session1')).toBeUndefined();
  });
});
