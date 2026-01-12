import { describe, it, expect } from 'vitest';
import { getPortOccupancyTool } from '../../src/tools/get-port-occupancy.js';

describe('getPortOccupancyTool', () => {
  it('should have correct name and schema', () => {
    expect(getPortOccupancyTool.name).toBe('get-port-occupancy');
    expect(getPortOccupancyTool.inputSchema).toBeDefined();
  });
});
