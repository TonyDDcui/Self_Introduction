import type { SiteLang } from "./types";

type Key =
  | "nav.home"
  | "nav.blog"
  | "nav.gallery"
  | "nav.openGithub"
  | "nav.toc"
  | "nav.langToEn"
  | "nav.langToZh"
  | "mode.lightToDark"
  | "mode.darkToLight"
  | "hero.subtitle"
  | "hero.blog"
  | "hero.learnMore"
  | "section.about.title"
  | "section.about.subtitle"
  | "section.about.p1"
  | "section.about.p2.pre"
  | "section.about.p2.blog"
  | "section.about.p2.mid"
  | "section.about.p2.gallery"
  | "section.about.p2.post"
  | "section.writing.title"
  | "section.writing.subtitle"
  | "section.writing.empty.pre"
  | "section.writing.empty.post"
  | "section.writing.viewAll"
  | "section.contact.title"
  | "section.contact.subtitle"
  | "section.contact.p2.pre"
  | "section.contact.p2.blog"
  | "section.contact.p2.post"
  | "section.contact.sendEmail"
  | "blog.title"
  | "blog.empty"
  | "blog.back";

const ZH: Record<Key, string> = {
  "nav.home": "Home",
  "nav.blog": "Blog",
  "nav.gallery": "Gallery",
  "nav.openGithub": "打开 GitHub 主页",
  "nav.toc": "目录",
  "nav.langToEn": "切换到英文",
  "nav.langToZh": "切换到中文",
  "mode.lightToDark": "浅色模式（切换到深色）",
  "mode.darkToLight": "深色模式（切换到浅色）",
  "hero.subtitle": "嵌入式 / 硬件 / 软件开发工程师。\n科技与摄影是日常，文学与日落是背景音乐。",
  "hero.blog": "Blog",
  "hero.learnMore": "Learn more",
  "section.about.title": "About",
  "section.about.subtitle": "一点自我介绍与日常兴趣。",
  "section.about.p1":
    "我是崔喆箫，做嵌入式 / 硬件 / 软件开发。性格偏 ENTP：好奇心有点“骨折眉”——总想把世界拆开看看，再认真装回去。\n白天和电路、日志打交道；傍晚追一段日落；夜里翻几页苏轼或李白，让脑子在诗里散个步。",
  "section.about.p2.pre": "你可以先看看 ",
  "section.about.p2.blog": "Blog",
  "section.about.p2.mid": " 的项目记录与随笔，或去 ",
  "section.about.p2.gallery": "Gallery",
  "section.about.p2.post": " 找找我留下的素材与片段（如果仓库里有图片，它会自动出现）。",
  "section.writing.title": "Writing",
  "section.writing.subtitle": "从 Blog 元信息读取最新 3 篇（不足则展示现有）。保持卡片化排版与轻量标签。",
  "section.writing.empty.pre": "暂无文章。你可以先访问 ",
  "section.writing.empty.post": " 查看占位页面。",
  "section.writing.viewAll": "View all writing",
  "section.contact.title": "Contact",
  "section.contact.subtitle": "如果你也在做硬件、软件，或只是想聊聊日落与相机，都欢迎来信。",
  "section.contact.p2.pre": "也可以从 ",
  "section.contact.p2.blog": "Blog",
  "section.contact.p2.post": " 了解更多内容更新。",
  "section.contact.sendEmail": "Send email",
  "blog.title": "Blog",
  "blog.empty": "暂无文章。",
  "blog.back": "← 返回列表",
};

const EN: Record<Key, string> = {
  "nav.home": "Home",
  "nav.blog": "Blog",
  "nav.gallery": "Gallery",
  "nav.openGithub": "Open GitHub profile",
  "nav.toc": "Contents",
  "nav.langToEn": "Switch to English",
  "nav.langToZh": "Switch to Chinese",
  "mode.lightToDark": "Light mode (switch to dark)",
  "mode.darkToLight": "Dark mode (switch to light)",
  "hero.subtitle":
    "Embedded / Hardware / Software Engineer.\nTech and photography in daily life; literature and sunsets as the soundtrack.",
  "hero.blog": "Blog",
  "hero.learnMore": "Learn more",
  "section.about.title": "About",
  "section.about.subtitle": "A brief intro and everyday interests.",
  "section.about.p1":
    "I’m Zhexiao Cui, working across embedded systems, hardware, and software. I’m an ENTP at heart—curious to the point of wanting to take the world apart, then put it back together carefully.\nBy day I deal with circuits and logs; at dusk I chase a sunset; at night I read a few pages of Su Shi or Li Bai, letting my mind take a walk through poetry.",
  "section.about.p2.pre": "Start with ",
  "section.about.p2.blog": "Blog",
  "section.about.p2.mid": " for project notes and essays, or head to ",
  "section.about.p2.gallery": "Gallery",
  "section.about.p2.post": " for fragments and materials I’ve captured (repo images, if any, will show up automatically).",
  "section.writing.title": "Writing",
  "section.writing.subtitle":
    "Latest 3 posts from Blog metadata (or fewer if there aren’t enough). A light, card-based layout with compact tags.",
  "section.writing.empty.pre": "No posts yet. Visit ",
  "section.writing.empty.post": " to see the placeholder page.",
  "section.writing.viewAll": "View all writing",
  "section.contact.title": "Contact",
  "section.contact.subtitle":
    "If you build hardware/software too—or just want to talk about sunsets and cameras—feel free to reach out.",
  "section.contact.p2.pre": "You can also check out ",
  "section.contact.p2.blog": "Blog",
  "section.contact.p2.post": " for more updates.",
  "section.contact.sendEmail": "Send email",
  "blog.title": "Blog",
  "blog.empty": "No posts yet.",
  "blog.back": "← Back",
};

export function t(lang: SiteLang, key: Key): string {
  return (lang === "en" ? EN : ZH)[key] ?? ZH[key] ?? key;
}
