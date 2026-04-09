import type { PhotoRow } from "./photos";

export type AlbumRule = {
  slug: string;
  title: string;
  /**
   * 归类关键词：命中任意一个即归入该相册。
   * 建议使用中文关键词（可包含短语）。
   */
  keywords: string[];
  /**
   * 用于后续“图文页”选文的主题标签。
   */
  themeTags: string[];
};

export const DEFAULT_ALBUM = {
  slug: "uncategorized",
  title: "未分类",
  themeTags: ["日常", "随记"],
} as const;

export const ALBUM_RULES: AlbumRule[] = [
  {
    slug: "tachun",
    title: "踏春",
    keywords: ["踏春", "春游", "春天", "樱花", "桃花", "油菜花", "花海", "春日"],
    themeTags: ["春", "花", "风", "游"],
  },
  {
    slug: "sunset",
    title: "日落",
    keywords: ["日落", "落日", "夕阳", "黄昏", "晚霞", "日暮"],
    themeTags: ["日落", "光", "暮色", "温柔"],
  },
  {
    slug: "night",
    title: "夜色",
    keywords: ["夜", "夜景", "霓虹", "路灯", "灯", "月", "星"],
    themeTags: ["夜", "灯", "城", "静"],
  },
  {
    slug: "street",
    title: "街拍",
    keywords: ["街", "街拍", "路人", "市集", "巷", "车流", "城市"],
    themeTags: ["街", "城", "人间", "行走"],
  },
  {
    slug: "mountain",
    title: "山野",
    keywords: ["山", "登山", "徒步", "森林", "原野", "野", "山野"],
    themeTags: ["山", "野", "远方", "呼吸"],
  },
  {
    slug: "sea",
    title: "海边",
    keywords: ["海", "海边", "海风", "浪", "沙滩", "礁石", "港口"],
    themeTags: ["海", "风", "自由", "远"],
  },
  {
    slug: "rain",
    title: "雨天",
    keywords: ["雨", "下雨", "雨天", "雨夜", "水滴", "伞"],
    themeTags: ["雨", "清", "听", "慢"],
  },
];

function normalizeText(v: string): string {
  return v
    .toLowerCase()
    .replaceAll(/\s+/g, " ")
    .replaceAll("，", ",")
    .replaceAll("。", ".")
    .trim();
}

export function classifyAlbumFromPhoto(
  photo: Pick<PhotoRow, "title" | "caption" | "tags" | "category">,
): { slug: string; title: string; themeTags: string[] } {
  const text = normalizeText(
    `${photo.title ?? ""} ${photo.caption ?? ""} ${photo.category ?? ""} ${(photo.tags ?? []).join(" ")}`,
  );

  for (const rule of ALBUM_RULES) {
    if (rule.keywords.some((k) => text.includes(normalizeText(k)))) {
      return { slug: rule.slug, title: rule.title, themeTags: rule.themeTags };
    }
  }

  return {
    slug: DEFAULT_ALBUM.slug,
    title: DEFAULT_ALBUM.title,
    themeTags: [...DEFAULT_ALBUM.themeTags],
  };
}

