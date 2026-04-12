import { put } from "@vercel/blob";

import { getSiteKv, setSiteKv } from "./siteKv";

const AVATAR_KV_KEY = "site_avatar_url";

function extFromContentType(contentType: string | null): string {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("image/png")) return "png";
  if (ct.includes("image/webp")) return "webp";
  if (ct.includes("image/jpeg")) return "jpg";
  if (ct.includes("image/gif")) return "gif";
  return "png";
}

export async function getSiteAvatarUrl(): Promise<string | null> {
  return getSiteKv(AVATAR_KV_KEY);
}

type SignInMessage = {
  // next-auth events.signIn signature (we only use a subset)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile?: any;
};

export async function syncAvatarOnSignIn(message: SignInMessage): Promise<void> {
  // Prefer GitHub OAuth profile's avatar_url; fallback to user.image.
  const avatarUrl =
    (message.profile && typeof message.profile.avatar_url === "string"
      ? message.profile.avatar_url
      : null) ||
    (message.user && typeof message.user.image === "string" ? message.user.image : null);

  if (!avatarUrl) return;

  let res: Response;
  try {
    res = await fetch(avatarUrl, {
      headers: { accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8" },
      redirect: "follow",
    });
  } catch {
    return;
  }

  if (!res.ok) return;

  let buf: ArrayBuffer;
  try {
    buf = await res.arrayBuffer();
  } catch {
    return;
  }

  const ext = extFromContentType(res.headers.get("content-type"));
  const contentType = res.headers.get("content-type") || `image/${ext}`;

  // 固化为站点静态头像：覆盖写入同一个 key，直到下次登录再更新
  const pathname = `site/avatar.${ext}`;

  try {
    const blob = await put(pathname, buf, {
      access: "public",
      addRandomSuffix: false,
      contentType,
    });
    await setSiteKv(AVATAR_KV_KEY, blob.url);
  } catch {
    // ignore
  }
}

