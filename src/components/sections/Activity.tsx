"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Activity.module.css";

type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

type ApiDay = {
  date: string;
  contributionCount: number;
  contributionLevel: ContributionLevel;
};

type ApiWeek = { contributionDays: ApiDay[] };
type ApiCalendar = { totalContributions: number; weeks: ApiWeek[] };

type ApiErrorReason =
  | "missing_env"
  | "github_401"
  | "github_403"
  | "github_rate_limit"
  | "github_error"
  | "unknown_error";

type ApiResult =
  | { ok: true; calendar: ApiCalendar }
  | { ok: false; reason: ApiErrorReason };

function explain(reason: ApiErrorReason) {
  switch (reason) {
    case "missing_env":
      return "未配置 GitHub 环境变量（GITHUB_USERNAME / GITHUB_TOKEN）。";
    case "github_401":
      return "GitHub Token 已失效（401）。请在 Vercel 更新 GITHUB_TOKEN。";
    case "github_403":
      return "GitHub Token 权限不足（403）。请检查 token 权限或仓库访问范围。";
    case "github_rate_limit":
      return "GitHub 接口触发限流（rate limit）。稍后再试。";
    case "github_error":
      return "GitHub 接口返回错误，暂时无法获取贡献数据。";
    case "unknown_error":
      return "发生未知错误，暂时无法获取贡献数据。";
    default:
      return "暂时无法获取 GitHub 贡献数据。";
  }
}

function levelToInt(level: ContributionLevel): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case "FIRST_QUARTILE":
      return 1;
    case "SECOND_QUARTILE":
      return 2;
    case "THIRD_QUARTILE":
      return 3;
    case "FOURTH_QUARTILE":
      return 4;
    default:
      return 0;
  }
}

export default function Activity() {
  const [result, setResult] = useState<ApiResult | null>(null);
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    day: ApiDay;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/github/contributions")
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setResult(j as ApiResult);
      })
      .catch(() => {
        if (!alive) return;
        setResult({ ok: false, reason: "unknown_error" });
      });
    return () => {
      alive = false;
    };
  }, []);

  const meta = useMemo(() => {
    if (!result) return "正在加载贡献日历…";
    if (!result.ok) {
      return explain(result.reason);
    }
    return `过去一年 · ${result.calendar.totalContributions} contributions`;
  }, [result]);

  return (
    <section
      id="activity"
      data-reveal
      data-delay="40"
      className={styles.section}
      aria-label="Activity section"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>Activity</h2>
          <p className={styles.subtitle}>{meta}</p>
        </header>

        {!result || !result.ok ? (
          <div className={styles.fallback} role="status" aria-live="polite">
            {meta}
          </div>
        ) : (
          <div className={styles.calendarWrap}>
            <div
              className={styles.calendar}
              ref={gridRef}
              onMouseLeave={() => setHover(null)}
            >
              {result.calendar.weeks.map((w, wi) => (
                <div className={styles.week} key={wi} aria-hidden="true">
                  {w.contributionDays.map((d) => {
                    const level = levelToInt(d.contributionLevel);
                    return (
                      <div
                        key={d.date}
                        className={styles.day}
                        data-level={level}
                        onMouseEnter={(e) => {
                          const grid = gridRef.current;
                          if (!grid) return;
                          const r = grid.getBoundingClientRect();
                          setHover({
                            x: e.clientX - r.left,
                            y: e.clientY - r.top,
                            day: d,
                          });
                        }}
                        title={`${d.date} · ${d.contributionCount} contributions`}
                      />
                    );
                  })}
                </div>
              ))}

              {hover ? (
                <div
                  className={styles.tooltip}
                  style={{
                    left: Math.min(hover.x + 12, 640),
                    top: Math.max(hover.y - 34, 0),
                  }}
                  role="status"
                >
                  <span className={styles.tooltipLine}>
                    {hover.day.date}
                  </span>
                  <span className={styles.tooltipLineMuted}>
                    {hover.day.contributionCount} contributions
                  </span>
                </div>
              ) : null}
            </div>

            <div className={styles.legend} aria-label="Legend">
              <span className={styles.legendLabel}>Less</span>
              <span className={styles.legendDots} aria-hidden="true">
                <span className={styles.legendDot} data-level="0" />
                <span className={styles.legendDot} data-level="1" />
                <span className={styles.legendDot} data-level="2" />
                <span className={styles.legendDot} data-level="3" />
                <span className={styles.legendDot} data-level="4" />
              </span>
              <span className={styles.legendLabel}>More</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
