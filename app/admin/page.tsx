import Link from "next/link";
import { cookies } from "next/headers";

type AdminUser = {
  id: number;
  role: string;
  created_at: string;
  last_login_at: string | null;
  providers: string[];
  username: string | null;
  subscription_status: string;
};

const API_BASE = process.env.BACKEND_API_BASE ?? "http://localhost:8000";

async function fetchAdminUsers(): Promise<AdminUser[]> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const res = await fetch(`${API_BASE}/api/admin/users?page=1&page_size=50`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  });
  if (!res.ok) return [];
  return (await res.json()) as AdminUser[];
}

export default async function AdminPage() {
  const users = await fetchAdminUsers();
  return (
    <main style={{ maxWidth: 960, margin: "48px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Admin Console (MVP)</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        当前为极简管理页，核心用于查看用户、订阅状态与 provider。
      </p>
      <p style={{ marginBottom: 20 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          返回首页
        </Link>
      </p>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid rgba(120,120,120,0.3)",
          }}
        >
          <thead>
            <tr>
              {["ID", "用户名", "角色", "Provider", "订阅", "最后登录"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderBottom: "1px solid rgba(120,120,120,0.3)",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(120,120,120,0.18)" }}>
                  {u.id}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(120,120,120,0.18)" }}>
                  {u.username ?? "-"}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(120,120,120,0.18)" }}>
                  {u.role}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(120,120,120,0.18)" }}>
                  {u.providers.join(", ")}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(120,120,120,0.18)" }}>
                  {u.subscription_status}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(120,120,120,0.18)" }}>
                  {u.last_login_at ?? "-"}
                </td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "16px 12px", opacity: 0.8 }}>
                  暂无可显示数据（需要管理员登录并配置后端联通）。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
