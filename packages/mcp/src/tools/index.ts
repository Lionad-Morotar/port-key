import { mapProjectNameToPortTool } from './map-project-name-to-port.js';
import { getDesignPhilosophyTool } from './get-design-philosophy.js';
import { checkPortAvailabilityTool } from './check-port-availability.js';
import { getPortOccupancyTool } from './get-port-occupancy.js';

export const tools = [
  mapProjectNameToPortTool,
  getDesignPhilosophyTool,
  checkPortAvailabilityTool,
  getPortOccupancyTool,
];
