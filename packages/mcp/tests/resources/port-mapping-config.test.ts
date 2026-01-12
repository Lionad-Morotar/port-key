import { describe, it, expect } from 'vitest';
import { portMappingConfigResource } from '../../src/resources/port-mapping-config.js';

describe('portMappingConfigResource', () => {
  it('should have correct name and uri', () => {
    expect(portMappingConfigResource.name).toBe('config');
    expect(portMappingConfigResource.resourceUri).toBe('config://port-mapping');
  });

  it('should return config', async () => {
    const uri = new URL('config://port-mapping');
    const result = await portMappingConfigResource.execute(uri);
    expect(result.contents).toHaveLength(1);
    const content = JSON.parse(result.contents[0].text as string);
    expect(content.defaultMap).toBeDefined();
    expect(content.defaultBlockedPorts).toBeDefined();
  });
});
