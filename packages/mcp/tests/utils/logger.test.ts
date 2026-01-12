import { describe, it, expect } from 'vitest';
import logger from '../../src/utils/logger.js';

describe('Logger', () => {
  it('should have a defined level', () => {
    expect(logger.level).toBeDefined();
  });

  it('should allow getting the current level', () => {
    const level = logger.getLevel();
    expect(typeof level).toBe('string');
  });

  it('should allow changing levels', () => {
    const originalLevel = logger.getLevel();
    logger.setLevel('error');
    expect(logger.getLevel()).toBe('error');
    logger.setLevel(originalLevel); // Restore
  });
});
