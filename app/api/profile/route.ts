import { getChatGPTUser } from "../../chatgpt-auth";
import { isProfileEditor, saveProfile } from "../../data/profile-server";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user || !(await isProfileEditor(user))) {
    return Response.json({ error: "Not authorized" }, { status: 401 });
  }
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
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
