export type DigitKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type DigitLetterMap = Record<DigitKey | `${DigitKey}`, string>;

export type RejectedCandidate = {
  candidate: string;
  reason: string;
};

export type PickPortOptions = {
  preferDigitCount?: number;
  minPort?: number;
  maxPort?: number;
  blockedPorts?: ReadonlySet<number> | number[];
};

export const DEFAULT_MAP: Readonly<DigitLetterMap>;
export const DEFAULT_BLOCKED_PORTS: ReadonlySet<number>;

export function buildReverseMap(map: DigitLetterMap): Map<string, string>;
export function normalizeInput(text: unknown): string;
export function mapToDigits(text: unknown, map?: DigitLetterMap): string;
export function isValidPort(port: unknown): port is number;

export function pickPortFromDigits(
  digits: unknown,
  options?: PickPortOptions
):
  | { port: number; rejectedCandidates?: RejectedCandidate[] }
  | { port: null; reason: string; rejectedCandidates?: RejectedCandidate[] };

export function mapToPort(
  text: unknown,
  map?: DigitLetterMap,
  options?: PickPortOptions
): {
  digits: string;
  port: number | null;
  rejectedCandidates?: RejectedCandidate[];
  reason?: string;
};

export function parseUserMap(mapString: unknown): DigitLetterMap;
