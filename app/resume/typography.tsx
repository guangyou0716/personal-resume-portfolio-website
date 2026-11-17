import type { ReactNode } from "react";

const NBHYPHEN = "\u2011";
const ENDASH = "\u2013";
const NBSP = "\u00A0";

/** Prefer typographic en dashes in date ranges. */
export function formatDateRange(...parts: Array<string | undefined>) {
  const values = parts.filter((part) => part?.trim()).map((part) => normalizeDateDashes(part!));
  return values.join(` ${ENDASH} `);
}

export function normalizeDateDashes(value: string) {
  return value
    .replace(/\s*[—–]\s*/g, ` ${ENDASH} `)
    .replace(/\s+-\s+/g, ` ${ENDASH} `)
    .replace(/ {2,}/g, " ")
    .trim();
}

/** Keep letter-hyphen-letter compounds from breaking mid-word (e-Invoicing, Full-time). */
export function protectHyphenated(value: string) {
  return value.replace(/(?<=[\p{L}\p{N}])-(?=[\p{L}\p{N}])/gu, NBHYPHEN);
}

export function displayUrl(value: string) {
  return value.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

/** Screen text can break at separators; print uses a single un-broken run so PDF annotations stay one rect. */
export function VisibleUrl({ value }: { value: string }) {
  return (
    <>
      <span className="resume-url-break">
        <BreakableUrl value={value} />
      </span>
      <span className="resume-url-solid">{protectHyphenated(displayUrl(value))}</span>
    </>
  );
}

/** Break a URL or email only after ".", "/", or "@"; hyphens in the value stay intact. */
export function BreakableUrl({ value }: { value: string }) {
  const text = displayUrl(value);
  const nodes: ReactNode[] = [];
  let buffer = "";
  const flush = () => {
    if (!buffer) return;
    nodes.push(protectHyphenated(buffer));
    buffer = "";
  };
  for (const character of text) {
    if (character === "." || character === "/" || character === "@") {
      buffer += character;
      flush();
      nodes.push(<wbr key={`wbr-${nodes.length}`} />);
    } else {
      buffer += character;
    }
  }
  flush();
  return <>{nodes}</>;
}

export function Nowrap({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={className ? `${className} resume-nowrap` : "resume-nowrap"}>{children}</span>;
}

/** Split a middot-separated string so each phrase stays on one line. */
export function NowrapList({ text }: { text: string }) {
  const parts = text.split(" · ").map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return <Nowrap>{protectHyphenated(text)}</Nowrap>;
  }
  return (
    <>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {index > 0 ? " · " : null}
          <Nowrap>{protectHyphenated(part)}</Nowrap>
        </span>
      ))}
    </>
  );
}

export function SkillList({ items }: { items: string[] }) {
  return (
    <span className="resume-skill-list">
      {items.map((item, index) => (
        <span key={`${item}-${index}`}>
          {index > 0 ? <span className="resume-skill-sep"> · </span> : null}
          <span className="resume-skill">{protectHyphenated(item)}</span>
        </span>
      ))}
    </span>
  );
}

export function RoleCompany({ role, company }: { role: string; company: string }) {
  return (
    <>
      {`${protectHyphenated(role)}${NBSP}· `}
      <span className="resume-company">{company}</span>
    </>
  );
}
