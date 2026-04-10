"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import heic2any from "heic2any";

import styles from "./UploadForm.module.css";
import { isHeicLike, toJpegFilename } from "../../lib/gallery/imageFormats";

type UploadResponse =
  | { ok: true; id: string }
  | { ok: false; reason?: string; message?: string };

function formatError(res: Response, data: UploadResponse | null) {
  if (data && "ok" in data && data.ok === false) {
    return data.message || data.reason || `上传失败（${res.status}）`;
  }
  return `上传失败（${res.status}）`;
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID() as string;
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function UploadForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file");

    if (!(file instanceof File)) {
      setError("缺少图片文件（file）");
      setSubmitting(false);
      return;
    }

    try {
      // HEIC/HEIF 浏览器兼容性较差：在客户端先转为 JPG 再上传到 Blob
      let uploadFile: File = file;
      if (isHeicLike({ name: file.name, type: file.type })) {
        try {
          const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          });
          const blob = Array.isArray(converted) ? converted[0] : converted;
          uploadFile = new File([blob], toJpegFilename(file.name), {
            type: "image/jpeg",
          });
        } catch {
          throw new Error("HEIC/HEIF 转换失败：请先在本地转换为 JPG/PNG/WEBP 后再上传");
        }
      }

      // 关键修复：
      // - Vercel 服务端上传受限于 4.5MB request body，容易触发 413
      // - 采用 Vercel Blob Client Upload，让文件从浏览器直传到 Blob
      const ext =
        (uploadFile.name.split(".").pop() || "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "") ||
        "img";
      const filename = `gallery/${randomId()}.${ext}`;

      const blob = await upload(filename, uploadFile, {
        access: "public",
        handleUploadUrl: "/api/gallery/blob",
      });

      // 上传完成后再写数据库（小 JSON，不会触发 body 限制）
      const payload = {
        blobUrl: blob.url,
        blobPathname: blob.pathname,
        title: fd.get("title"),
        caption: fd.get("caption"),
        category: fd.get("category"),
        tags: fd.get("tags"),
        visibility: "public",
      };

      const res = await fetch("/api/gallery/photos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as UploadResponse | null;
      if (!res.ok || !data || ("ok" in data && data.ok === false)) {
        setError(formatError(res, data));
        return;
      }

      router.push("/gallery");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败（网络错误）");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.card} aria-busy={submitting}>
      <form className={styles.inner} onSubmit={onSubmit}>
        <div className={styles.fields}>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="file">
              图片文件（必填）
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              required
              className={styles.input}
            />
            <div className={styles.hint}>
              建议选择横向 4:3 或接近的比例，效果更统一。
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">
              标题
            </label>
            <input
              id="title"
              name="title"
              type="text"
              maxLength={120}
              placeholder="可选"
              className={styles.input}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="category">
              分类
            </label>
            <input
              id="category"
              name="category"
              type="text"
              maxLength={60}
              placeholder="例如：travel / work / random（可选）"
              className={styles.input}
              autoComplete="off"
            />
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="caption">
              说明
            </label>
            <textarea
              id="caption"
              name="caption"
              maxLength={500}
              placeholder="可选"
              className={styles.textarea}
            />
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="tags">
              标签（逗号分隔）
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              maxLength={240}
              placeholder="例如：coffee, hk, street（可选）"
              className={styles.input}
              autoComplete="off"
            />
            <div className={styles.hint}>
              上传后会自动去重与去空格；最多支持常见 emoji/中英文标签。
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} type="submit" disabled={submitting}>
            {submitting ? "上传中…" : "上传并发布"}
          </button>

          <div className={styles.status}>
            {submitting ? "请勿关闭页面" : "上传完成后将自动返回 Gallery"}
          </div>
        </div>
      </form>

      {error ? <div className={styles.error}>{error}</div> : null}
    </section>
  );
}
