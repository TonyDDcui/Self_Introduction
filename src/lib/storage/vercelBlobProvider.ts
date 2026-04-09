import { del, put } from "@vercel/blob";
import type { StorageProvider } from "./provider";

export const vercelBlobProvider: StorageProvider = {
  async putImage({ file, filename, contentType }) {
    const res = await put(filename, file, {
      access: "public",
      contentType,
    });

    return { url: res.url, pathname: res.pathname };
  },

  async delImage(pathname) {
    await del(pathname);
  },
};

