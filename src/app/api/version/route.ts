import packageJson from "../../../../package.json";
import { jsonError, jsonOk } from "@/shared/http/apiResponse";

interface VersionResponseData {
  name: string;
  version: string;
  node: string;
  timestamp: string;
}

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const name = packageJson.name?.trim();
  const version = packageJson.version?.trim();

  if (!name || !version) {
    return jsonError(
      500,
      "INVALID_PACKAGE_METADATA",
      "Unable to read name/version from package metadata.",
    );
  }

  const payload: VersionResponseData = {
    name,
    version,
    node: process.version,
    timestamp: new Date().toISOString(),
  };

  return jsonOk(payload);
}
