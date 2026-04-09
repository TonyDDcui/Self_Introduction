"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "./UploadForm.module.css";

type UploadResponse =
  | { ok: true; id: string }
  | { ok: false; reason?: string; message?: string };

function formatError(res: Response, data: UploadResponse | null) {
  if (data && "ok" in data && data.ok === false) {
    return data.message || data.reason || `上传失败（${res.status}）`;
  }
  return `上传失败（${res.status}）`;
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

    try {
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        body: fd,
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

