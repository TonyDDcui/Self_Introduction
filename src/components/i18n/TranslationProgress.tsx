"use client";

export default function TranslationProgress(props: { progress: number; message?: string }) {
  const v = Math.max(0, Math.min(100, props.progress));
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
        {props.message ?? "Loading…"}
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "color-mix(in srgb, var(--ring) 70%, transparent)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${v}%`,
            height: "100%",
            borderRadius: 999,
            background: "var(--button-left, var(--accent))",
            transition: "width 260ms ease",
          }}
        />
      </div>
    </div>
  );
}

