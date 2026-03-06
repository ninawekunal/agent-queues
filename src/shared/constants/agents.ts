export interface AgentProfile {
  id: string;
  displayName: string;
  squad: string;
}

export const AGENT_PROFILES: AgentProfile[] = [
  {
    id: "agent-101",
    displayName: "Ariana Stone",
    squad: "North America Hotels",
  },
  {
    id: "agent-202",
    displayName: "Brandon Li",
    squad: "EMEA Hospitality",
  },
  {
    id: "agent-303",
    displayName: "Carla Mendez",
    squad: "APAC Premium Support",
  },
  {
    id: "agent-404",
    displayName: "Devon Wright",
    squad: "Enterprise Travel Ops",
  },
];

export const DEFAULT_AGENT_ID = AGENT_PROFILES[0].id;
export const SESSION_COOKIE_NAME = "refund-agent-id";

const agentById = new Map<string, AgentProfile>(
  AGENT_PROFILES.map((agentProfile) => [agentProfile.id, agentProfile]),
);

export function getAgentProfile(agentId: string | undefined | null): AgentProfile | null {
  if (!agentId) {
    return null;
  }

  return agentById.get(agentId) ?? null;
}

export function isKnownAgentId(agentId: string): boolean {
  return agentById.has(agentId);
}
