import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
] as const;

export default function AppleNav() {
  return (
    <nav aria-label="Primary">
      <ul
        style={{
          display: "flex",
          gap: 16,
          listStyle: "none",
          margin: 0,
          padding: 16,
        }}
      >
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

