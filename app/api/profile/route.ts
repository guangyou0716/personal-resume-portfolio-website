import { getChatGPTUser } from "../../chatgpt-auth";
import { getEditorUserId, saveProfile } from "../../data/profile-server";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  const editorUserId = await getEditorUserId();
  if (!user || !editorUserId || user.userId !== editorUserId) {
    return Response.json({ error: "Not authorized" }, { status: 401 });
  }
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }
  try {
    await saveProfile(await request.json());
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to save the profile yet. Please try again shortly." }, { status: 400 });
  }
}
