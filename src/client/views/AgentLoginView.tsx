"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAgentSessionController } from "@/client/controllers/useAgentSessionController";
import {
  AGENT_PROFILES,
  DEFAULT_AGENT_ID,
  type AgentProfile,
} from "@/shared/constants/agents";

function renderAgentLabel(agentProfile: AgentProfile): string {
  return `${agentProfile.displayName} (${agentProfile.id})`;
}

export function AgentLoginView() {
  const router = useRouter();
  const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENT_ID);
  const { isSubmitting, errorMessage, loginAsAgent } = useAgentSessionController();

  const selectedAgent = useMemo(
    () => AGENT_PROFILES.find((agentProfile) => agentProfile.id === selectedAgentId) ?? AGENT_PROFILES[0],
    [selectedAgentId],
  );

  const login = async (agentId: string): Promise<void> => {
    await loginAsAgent(agentId);
    router.push("/");
    router.refresh();
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Simulation Login</p>
        <h1>Select Support Agent</h1>
        <p>
          This demo uses a session cookie only. No password or external auth provider is used.
        </p>

        <div className="auth-field">
          <label htmlFor="agent-select">Agent</label>
          <select
            id="agent-select"
            value={selectedAgentId}
            onChange={(event) => {
              setSelectedAgentId(event.target.value);
            }}
          >
            {AGENT_PROFILES.map((agentProfile) => (
              <option key={agentProfile.id} value={agentProfile.id}>
                {renderAgentLabel(agentProfile)}
              </option>
            ))}
          </select>
          <p className="selected-agent-squad">Team: {selectedAgent.squad}</p>
        </div>

        <div className="auth-actions">
          <button
            type="button"
            className="primary"
            disabled={isSubmitting}
            onClick={() => {
              void login(selectedAgentId);
            }}
          >
            {isSubmitting ? "Signing in..." : "Login to Session"}
          </button>
        </div>

        <div className="quick-login-grid">
          {AGENT_PROFILES.map((agentProfile) => (
            <button
              key={agentProfile.id}
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                void login(agentProfile.id);
              }}
            >
              {agentProfile.displayName}
            </button>
          ))}
        </div>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
      </section>
    </main>
  );
}
