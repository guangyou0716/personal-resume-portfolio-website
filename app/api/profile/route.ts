import { getEditorUser } from "../../auth";
import { saveProfile } from "../../data/profile-server";
import { isSameOrigin } from "../../same-origin";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!isJsonContentType(request.headers.get("content-type"))) {
    return Response.json({ error: "Expected application/json" }, { status: 415 });
  }
  const user = await getEditorUser();
  if (!user) {
    return Response.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const payload = await request.json() as { profile?: unknown; expectedUpdatedAt?: unknown };
    const expectedUpdatedAt = payload.expectedUpdatedAt;
    if (expectedUpdatedAt !== null && (typeof expectedUpdatedAt !== "number" || !Number.isSafeInteger(expectedUpdatedAt) || expectedUpdatedAt < 0)) {
      return Response.json({ error: "Invalid profile version" }, { status: 400 });
    }
    const updatedAt = await saveProfile(payload.profile, expectedUpdatedAt);
    if (updatedAt === null) {
      return Response.json({ error: "This profile changed elsewhere. Reload the editor before saving." }, { status: 409 });
    }
    return Response.json({ ok: true, updatedAt });
  } catch {
    return Response.json({ error: "Unable to save the profile yet. Please try again shortly." }, { status: 400 });
  }
}

function isJsonContentType(value: string | null): boolean {
  const mediaType = value?.split(";")[0]?.trim().toLowerCase();
  return mediaType === "application/json";
}
