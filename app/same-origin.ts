/** True when Origin — or Referer, only if Origin is absent — matches this request's origin. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const claimed = origin === null ? request.headers.get("referer") : origin;
  if (!claimed) return false;
  try {
    return new URL(claimed).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
