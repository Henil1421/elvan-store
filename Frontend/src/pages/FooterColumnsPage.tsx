import { useState } from "react";
import { Save, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { getFooterConfig, saveFooterConfig, FooterLink, FooterContentBlock, FooterColumn } from "@/lib/footerConfig";

let nextId = 10000;
const uid = () => ++nextId;

const BLOCK_TYPES = ["Link List", "Text", "Image", "Social Icons", "Newsletter"];

function LinkRow({
  link, onChange, onDelete,
}: { link: FooterLink; onChange: (l: FooterLink) => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={link.label}
        onChange={(e) => onChange({ ...link, label: e.target.value })}
        placeholder="Label"
        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="text"
        value={link.url}
        onChange={(e) => onChange({ ...link, url: e.target.value })}
        placeholder="https://..."
        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        onClick={onDelete}
        className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function BlockCard({
  block, onUpdate, onDelete,
}: { block: FooterContentBlock; onUpdate: (b: FooterContentBlock) => void; onDelete: () => void }) {
  const setVisible = (v: boolean) => onUpdate({ ...block, visible: v });
  const setType = (t: string) => onUpdate({ ...block, type: t });

  const addLink = () =>
    onUpdate({ ...block, links: [...block.links, { id: uid(), label: "", url: "" }] });

  const updateLink = (link: FooterLink) =>
    onUpdate({ ...block, links: block.links.map((l) => (l.id === link.id ? link : l)) });

  const deleteLink = (id: number) =>
    onUpdate({ ...block, links: block.links.filter((l) => l.id !== id) });

  return (
    <div className="rounded-xl border border-border bg-background p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <select
          value={block.type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none pr-8"
        >
          {BLOCK_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setVisible(!block.visible)}
          className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>

      {block.type === "Link List" && (
        <div className="flex flex-col gap-2">
          {block.links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              onChange={updateLink}
              onDelete={() => deleteLink(link.id)}
            />
          ))}
          <button
            onClick={addLink}
            className="text-sm text-primary hover:underline text-left mt-1"
          >
            + Add Link
          </button>
        </div>
      )}

      {block.type !== "Link List" && (
        <p className="text-xs text-muted-foreground italic">
          Configure {block.type} content here.
        </p>
      )}
    </div>
  );
}

function ColumnCard({
  column, onUpdate, onDelete,
}: { column: FooterColumn; onUpdate: (c: FooterColumn) => void; onDelete: () => void }) {
  const setTitle = (t: string) => onUpdate({ ...column, title: t });
  const setVisible = (v: boolean) => onUpdate({ ...column, visible: v });

  const addBlock = () =>
    onUpdate({
      ...column,
      blocks: [
        ...column.blocks,
        { id: uid(), type: "Link List", visible: true, links: [] },
      ],
    });

  const updateBlock = (block: FooterContentBlock) =>
    onUpdate({ ...column, blocks: column.blocks.map((b) => (b.id === block.id ? block : b)) });

  const deleteBlock = (id: number) =>
    onUpdate({ ...column, blocks: column.blocks.filter((b) => b.id !== id) });

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={column.title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Column title..."
          className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => setVisible(!column.visible)}
          className="p-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          {column.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={onDelete}
          className="p-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={addBlock}
        className="text-sm text-primary hover:underline text-left"
      >
        + Add Content Block
      </button>

      {column.blocks.map((block) => (
        <BlockCard
          key={block.id}
          block={block}
          onUpdate={updateBlock}
          onDelete={() => deleteBlock(block.id)}
        />
      ))}
    </div>
  );
}

export default function FooterColumnsPage() {
  const [columns, setColumns] = useState<FooterColumn[]>(() => getFooterConfig().columns);
  const [hasChanges, setHasChanges] = useState(false);

  const addColumn = () => {
    setColumns((c) => [
      ...c,
      { id: uid(), title: "", visible: true, blocks: [] },
    ]);
    setHasChanges(true);
  };

  const updateColumn = (col: FooterColumn) => {
    setColumns((c) => c.map((x) => (x.id === col.id ? col : x)));
    setHasChanges(true);
  };

  const deleteColumn = (id: number) => {
    setColumns((c) => c.filter((x) => x.id !== id));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveFooterConfig({ columns });
    setHasChanges(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Footer Settings - Columns</h2>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            hasChanges
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              : "bg-secondary text-muted-foreground border-border cursor-default"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {hasChanges ? "Save Changes" : "No Changes"}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Footer Columns &amp; Content</h3>
        <button
          onClick={addColumn}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Column
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {columns.length === 0 && (
          <div className="section-card flex items-center justify-center h-32 text-muted-foreground text-sm border-dashed">
            No columns yet. Click "Add Column" to get started.
          </div>
        )}
        {columns.map((col) => (
          <ColumnCard
            key={col.id}
            column={col}
            onUpdate={updateColumn}
            onDelete={() => deleteColumn(col.id)}
          />
        ))}
      </div>
    </div>
  );
}
