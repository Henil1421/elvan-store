export default function SettingsPage() {
  return (
    <div>
      <h2 className="page-header">Settings</h2>
      <p className="page-sub">Manage your application settings and preferences.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General */}
        <div className="lg:col-span-2 section-card">
          <h3 className="text-base font-semibold mb-4">General</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Site Name</label>
              <input defaultValue="My Admin App" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Support Email</label>
              <input defaultValue="support@example.com" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Timezone</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-border flex justify-end">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="section-card flex flex-col gap-4">
          <h3 className="text-base font-semibold">Profile</h3>
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">A</div>
            <div className="text-center">
              <p className="font-medium">Admin User</p>
              <p className="text-sm text-muted-foreground">admin@example.com</p>
            </div>
            <button className="text-sm text-primary hover:underline">Change avatar</button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Display Name</label>
            <input defaultValue="Admin User" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/70 transition-colors border border-border">
            Update Profile
          </button>
        </div>

        {/* Notifications Settings */}
        <div className="lg:col-span-3 section-card">
          <h3 className="text-base font-semibold mb-4">Notifications</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Email notifications", desc: "Receive email updates for new orders and events" },
              { label: "Order alerts", desc: "Get notified when a new order is placed" },
              { label: "Security alerts", desc: "Receive alerts for suspicious login activity" },
              { label: "Product updates", desc: "News about product features and updates" },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-secondary rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
