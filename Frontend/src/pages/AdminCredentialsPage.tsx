import { useState } from "react";
import { getAdminConfig, saveAdminConfig, updateCredentials } from "@/lib/adminConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Link2, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminCredentialsPage() {
  const cfg = getAdminConfig();

  // Admin URL state
  const [adminPath, setAdminPath] = useState(cfg.adminPath || "/admin");
  const [urlSaved, setUrlSaved] = useState(false);
  const [urlError, setUrlError] = useState("");

  // Credentials state
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [credSaved, setCredSaved] = useState(false);
  const [credError, setCredError] = useState("");

  const commonAdminWords = ["admin", "dashboard", "panel", "login", "signin", "wp-admin", "manager", "control"];

  const handleUrlSave = () => {
    setUrlError("");
    if (!adminPath.startsWith("/")) { setUrlError("Must start with /"); return; }
    if (adminPath.length < 8) { setUrlError("Must be at least 8 characters"); return; }
    if (commonAdminWords.some(w => adminPath.toLowerCase().includes(w))) {
      setUrlError("Must not contain common admin keywords (admin, dashboard, panel, etc.)"); return;
    }
    saveAdminConfig({ adminPath });
    setUrlSaved(true);
    setTimeout(() => {
      setUrlSaved(false);
      // Full page reload so App.tsx re-reads the new adminPath from localStorage
      window.location.href = adminPath;
    }, 1000);
  };

  const handleCredSave = () => {
    setCredError("");
    if (!newEmail && !newPass) { setCredError("Enter at least one field to update."); return; }
    if (newPass && newPass.length < 8) { setCredError("Password must be at least 8 characters."); return; }
    if (newPass && newPass !== confirmPass) { setCredError("Passwords do not match."); return; }

    const emailToSave = newEmail || cfg.email;
    const passToSave = newPass || atob(cfg.passwordHash);
    updateCredentials(emailToSave, passToSave);
    setCredSaved(true);
    setNewEmail("");
    setNewPass("");
    setConfirmPass("");
    setTimeout(() => setCredSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Security Notice */}
      <div className="flex gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
        <div className="text-sm space-y-0.5">
          <p className="font-semibold text-yellow-800 dark:text-yellow-300">Important Security Notice</p>
          <ul className="text-yellow-700 dark:text-yellow-400 space-y-0.5">
            <li>• Changing the admin URL will redirect you to the new URL automatically</li>
            <li>• Save your new admin URL securely – you'll need it to access the admin panel</li>
            <li>• Updating credentials will log you out of all sessions</li>
            <li>• You must use the NEW email and password to login again</li>
            <li>• All old credentials will stop working immediately</li>
          </ul>
        </div>
      </div>

      {/* Admin URL section */}
      <div className="section-card space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold">Custom Admin URL</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-path">Admin Panel URL Path</Label>
          <Input
            id="admin-path"
            value={adminPath}
            onChange={(e) => { setAdminPath(e.target.value); setUrlError(""); }}
            placeholder="/my-secret-panel"
          />
          <p className="text-xs text-muted-foreground">
            Must start with /, be at least 8 characters, and not contain common admin keywords. Use a unique, hard-to-guess URL.
          </p>
          {urlError && <p className="text-xs text-destructive font-medium">{urlError}</p>}
        </div>

        <Button onClick={handleUrlSave} disabled={urlSaved}>
          {urlSaved ? "Redirecting…" : "Update Admin URL"}
        </Button>
      </div>

      {/* Credentials section */}
      <div className="section-card space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold">Admin Credentials</h3>
        </div>

        {/* Show current email masked */}
        <div className="px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-muted-foreground">
          Current Admin Email: {cfg.email.replace(/(.{2}).*(@.*)/, "$1***$2")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-email">New Admin Email</Label>
          <Input
            id="new-email"
            type="email"
            placeholder="Enter new admin email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">This will be your new login email</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-pass">New Password</Label>
          <div className="relative">
            <Input
              id="new-pass"
              type={showPass ? "text" : "password"}
              placeholder="Enter new password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-pass">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm-pass"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {credError && <p className="text-xs text-destructive font-medium">{credError}</p>}
        {credSaved && <p className="text-xs text-green-600 font-medium">Credentials updated successfully!</p>}

        <Button onClick={handleCredSave}>Update Admin Credentials</Button>
      </div>
    </div>
  );
}
