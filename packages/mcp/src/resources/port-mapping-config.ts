import { DEFAULT_MAP, DEFAULT_BLOCKED_PORTS } from "@lionad/port-key";

export const portMappingConfigResource = {
  name: "config",
  resourceUri: "config://port-mapping",
  title: "Port Mapping Configuration",
  description: "Default port mapping configuration and blocked ports",
  mimeType: "application/json",
  execute: async (uri: URL) => {
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify({
            defaultMap: DEFAULT_MAP,
            defaultBlockedPorts: Array.from(DEFAULT_BLOCKED_PORTS),
          }, null, 2),
        },
      ],
    };
  }
};
