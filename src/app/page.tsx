import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RefundQueueView } from "@/client/views/RefundQueueView";
import {
  SESSION_COOKIE_NAME,
  getAgentProfile,
} from "@/shared/constants/agents";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionAgentId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const agentProfile = getAgentProfile(sessionAgentId);

  if (!agentProfile) {
    redirect("/login");
  }

  return (
    <RefundQueueView
      agentId={agentProfile.id}
      agentDisplayName={agentProfile.displayName}
    />
  );
}
