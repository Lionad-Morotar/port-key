import { describe, it, expect } from 'vitest';
import { checkPortAvailabilityTool } from '../../src/tools/check-port-availability.js';

describe('checkPortAvailabilityTool', () => {
  it('should have correct name and schema', () => {
    expect(checkPortAvailabilityTool.name).toBe('check-port-availability');
    expect(checkPortAvailabilityTool.inputSchema).toBeDefined();
    expect(checkPortAvailabilityTool.inputSchema.port).toBeDefined();
  });
});
