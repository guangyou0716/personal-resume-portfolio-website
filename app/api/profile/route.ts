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
    await saveProfile(await request.json());
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to save the profile yet. Please try again shortly." }, { status: 400 });
  }
}
