import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { getFooterConfig, saveFooterConfig, Policy } from "@/lib/footerConfig";

let uid = 3000;

export default function FooterPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(() => getFooterConfig().policies);
  const [selected, setSelected] = useState<number>(getFooterConfig().policies[0]?.id ?? 0);
  const [hasChanges, setHasChanges] = useState(false);

  const addPolicy = () => {
    const newP: Policy = { id: ++uid, name: "New Policy", content: "", showInFooter: false };
    setPolicies((p) => [...p, newP]);
    setSelected(newP.id);
    setHasChanges(true);
  };

  const updatePolicy = (patch: Partial<Policy>) => {
    setPolicies((p) => p.map((x) => x.id === selected ? { ...x, ...patch } : x));
    setHasChanges(true);
  };

  const deletePolicy = (id: number) => {
    setPolicies((p) => {
      const next = p.filter((x) => x.id !== id);
      if (selected === id) setSelected(next[0]?.id ?? 0);
      return next;
    });
    setHasChanges(true);
  };

  const toggleFooter = (id: number) => {
    setPolicies((p) => p.map((x) => x.id === id ? { ...x, showInFooter: !x.showInFooter } : x));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveFooterConfig({ policies });
    setHasChanges(false);
  };

  const activePolicy = policies.find((p) => p.id === selected);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Footer Settings - Policies</h2>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${hasChanges ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : "bg-secondary text-muted-foreground border-border cursor-default"}`}
        >
          <Save className="w-3.5 h-3.5" />
          {hasChanges ? "Save Changes" : "No Changes"}
        </button>
      </div>

      <div className="flex gap-5 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-0 section-card !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-bold text-foreground">Policies</span>
            <button onClick={addPolicy} className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {policies.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer border-b border-border/50 last:border-0 transition-colors ${selected === p.id ? "bg-primary/10 text-primary" : "hover:bg-secondary/60 text-foreground"}`}
              >
                <span className="text-sm font-medium truncate flex-1">{p.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePolicy(p.id); }}
                  className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors shrink-0 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-border px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">Footer Visibility</p>
            <div className="flex flex-col gap-1.5">
              {policies.map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.showInFooter}
                    onChange={() => toggleFooter(p.id)}
                    className="w-3.5 h-3.5 accent-primary"
                  />
                  <span className="text-xs text-foreground truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right editor */}
        <div className="flex-1 section-card !p-0 overflow-hidden flex flex-col">
          {activePolicy ? (
            <>
              <div className="px-5 py-3 border-b border-border">
                <input
                  type="text"
                  value={activePolicy.name}
                  onChange={(e) => updatePolicy({ name: e.target.value })}
                  className="w-full text-base font-semibold bg-transparent focus:outline-none focus:ring-0 text-foreground"
                  placeholder="Policy name..."
                />
              </div>
              <textarea
                value={activePolicy.content}
                onChange={(e) => updatePolicy({ content: e.target.value })}
                className="flex-1 px-5 py-4 text-sm text-foreground bg-background focus:outline-none resize-none leading-relaxed"
                placeholder="Write your policy content here..."
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a policy to edit, or add a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
