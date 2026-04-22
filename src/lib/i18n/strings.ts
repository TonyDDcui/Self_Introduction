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
  | "section.about.stats.awards.label"
  | "section.about.stats.awards.value"
  | "section.about.stats.projects.label"
  | "section.about.stats.projects.value"
  | "section.about.stats.interests.label"
  | "section.about.stats.interests.value"
  | "section.projects.title"
  | "section.projects.subtitle"
  | "section.projects.cta.learnMore"
  | "section.projects.cta.viewCode"
  | "section.projects.items.selfintro.title"
  | "section.projects.items.selfintro.desc"
  | "section.projects.items.logistics.title"
  | "section.projects.items.logistics.desc"
  | "section.projects.items.firecar.title"
  | "section.projects.items.firecar.desc"
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
  | "blog.back"
  | "admin.title"
  | "admin.subtitle"
  | "admin.loginHint";

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
  "section.about.stats.awards.label": "竞赛奖项",
  "section.about.stats.awards.value": "9+",
  "section.about.stats.projects.label": "公开项目",
  "section.about.stats.projects.value": "3",
  "section.about.stats.interests.label": "兴趣",
  "section.about.stats.interests.value": "科技 / 摄影 / 文学 / 日落",
  "section.projects.title": "Featured Projects",
  "section.projects.subtitle": "一些真实项目与实践记录。",
  "section.projects.cta.learnMore": "Learn more",
  "section.projects.cta.viewCode": "View code",
  "section.projects.items.selfintro.title": "Self_Introduction（个人主页 + 博客）",
  "section.projects.items.selfintro.desc":
    "以 Apple 风格为灵感的个人站点：Home 分镜、MDX 博客、仓库图片自动接入与图库页。",
  "section.projects.items.logistics.title": "Logistics-truck（路径学习搬运物流车）",
  "section.projects.items.logistics.desc":
    "低成本物流车项目（预算 1200 元）：围绕嵌入式控制与驱动层搭建，聚焦可实现与可维护。",
  "section.projects.items.firecar.title": "Fire_Car-ERCC（ERCC 消防车项目）",
  "section.projects.items.firecar.desc":
    "面向 ERCC 竞赛的消防车项目：以 C 语言为主，包含运动控制、传感器与工程文件。",
  "section.writing.title": "Writing",
  "section.writing.subtitle": "最新文章与项目记录。",
  "section.writing.empty.pre": "暂无文章。你可以先访问 ",
  "section.writing.empty.post": " 查看全部文章。",
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
  "admin.title": "管理后台",
  "admin.subtitle": "用户、订阅与用量（MVP 极简版）",
  "admin.loginHint": "请先通过 GitHub 登录；仅管理员可访问此页面。",
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
  "section.about.stats.awards.label": "Awards",
  "section.about.stats.awards.value": "9+",
  "section.about.stats.projects.label": "Public projects",
  "section.about.stats.projects.value": "3",
  "section.about.stats.interests.label": "Interests",
  "section.about.stats.interests.value": "Tech / Photography / Literature / Sunsets",
  "section.projects.title": "Featured Projects",
  "section.projects.subtitle": "A few real projects and hands-on notes.",
  "section.projects.cta.learnMore": "Learn more",
  "section.projects.cta.viewCode": "View code",
  "section.projects.items.selfintro.title": "Self_Introduction (site + blog)",
  "section.projects.items.selfintro.desc":
    "An Apple-inspired personal site with a storyboarded Home, MDX blog, repo-image integration, and a gallery.",
  "section.projects.items.logistics.title": "Logistics-truck (low-cost AGV)",
  "section.projects.items.logistics.desc":
    "A budget-friendly logistics vehicle (≈ ¥1200): embedded control + drivers organized for maintainability and reproducibility.",
  "section.projects.items.firecar.title": "Fire_Car-ERCC (ERCC competition)",
  "section.projects.items.firecar.desc":
    "An ERCC-oriented fire truck project in C, covering motion control, sensors, and engineering assets.",
  "section.writing.title": "Writing",
  "section.writing.subtitle":
    "Latest 3 posts from Blog metadata (or fewer if there aren’t enough). A light, card-based layout with compact tags.",
  "section.writing.empty.pre": "No posts yet. Visit ",
  "section.writing.empty.post": " to browse all posts.",
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
  "admin.title": "Admin Console",
  "admin.subtitle": "Users, subscriptions, and usage (MVP)",
  "admin.loginHint": "Please sign in with GitHub first; admin role is required.",
};

export function t(lang: SiteLang, key: Key): string {
  return (lang === "en" ? EN : ZH)[key] ?? ZH[key] ?? key;
}
