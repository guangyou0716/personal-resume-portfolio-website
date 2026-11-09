import { expiredSessionCookie } from "../../../editor-session";
import { isSameOrigin } from "../../../same-origin";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/",
      "Set-Cookie": expiredSessionCookie(),
    },
  });
}
