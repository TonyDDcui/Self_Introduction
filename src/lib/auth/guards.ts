import type { Session } from "next-auth";

function normalizeLogin(v: string | null | undefined) {
  return (v ?? "").trim().toLowerCase();
}

export function isUploader(session: Session | null) {
  const login = normalizeLogin(session?.user?.login);
  if (login) return login === "tonyddcui";

  // Fallback for cases where login isn't available (older sessions / provider changes).
  const name = normalizeLogin(session?.user?.name);
  return name === "tonyddcui";
}

