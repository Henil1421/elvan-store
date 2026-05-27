import { Search, Plus, MoreHorizontal } from "lucide-react";

const users = [
  { name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active", joined: "Jan 12, 2025" },
  { name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active", joined: "Feb 3, 2025" },
  { name: "Carol White", email: "carol@example.com", role: "Viewer", status: "Inactive", joined: "Mar 8, 2025" },
  { name: "David Lee", email: "david@example.com", role: "Editor", status: "Active", joined: "Apr 15, 2025" },
  { name: "Eva Martinez", email: "eva@example.com", role: "Viewer", status: "Active", joined: "May 22, 2025" },
  { name: "Frank Brown", email: "frank@example.com", role: "Admin", status: "Active", joined: "Jun 1, 2025" },
];

const roleColor: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700",
  Editor: "bg-blue-100 text-blue-700",
  Viewer: "bg-secondary text-secondary-foreground",
};

export default function UsersPage() {
  return (
    <div>
      <h2 className="page-header">Users</h2>
      <p className="page-sub">Manage and oversee all user accounts.</p>

      <div className="section-card">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-56"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Email", "Role", "Status", "Joined", ""].map((h) => (
                  <th key={h} className="text-left py-2.5 pr-4 text-muted-foreground font-medium last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name[0]}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{u.joined}</td>
                  <td className="py-3 text-right">
                    <button className="p-1 rounded hover:bg-secondary text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
