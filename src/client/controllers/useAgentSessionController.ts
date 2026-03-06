"use client";

import { useCallback, useState } from "react";

interface SessionPayload {
  agentId: string;
}

export interface AgentSessionControllerState {
  isSubmitting: boolean;
  errorMessage: string | null;
  loginAsAgent: (agentId: string) => Promise<void>;
  clearSession: () => Promise<void>;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "Session request failed.";
  } catch {
    return "Session request failed.";
  }
}

export function useAgentSessionController(): AgentSessionControllerState {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginAsAgent = useCallback(async (agentId: string): Promise<void> => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId } satisfies SessionPayload),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not establish session.";
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const clearSession = useCallback(async (): Promise<void> => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/session", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not clear session.";
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    errorMessage,
    loginAsAgent,
    clearSession,
  };
}
