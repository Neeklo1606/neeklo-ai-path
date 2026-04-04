import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ADDABLE_BLOCK_TYPES, BLOCK_EDITOR_HELP, BLOCK_LABELS, defaultBlock, editorKeyForBlock } from "./block-registry";
import { BlockEditorRouter } from "./BlockEditorRouter";

export type WrappedBlock = { sid: string; block: unknown };

export function unwrapBlocks(rows: WrappedBlock[]): unknown[] {
  return rows.map((r) => r.block);
}

export function wrapBlocksFromJson(blocks: unknown): WrappedBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block) => ({ sid: crypto.randomUUID(), block }));
}

type SortableRowProps = {
  row: WrappedBlock;
  index: number;
  onChange: (index: number, block: Record<string, unknown>) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
};

function SortableBlockRow({ row, index, onChange, onDuplicate, onRemove }: SortableRowProps) {
  const [open, setOpen] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.sid });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const block = row.block;
  const rec = typeof block === "object" && block !== null ? (block as Record<string, unknown>) : { type: "unknown" };
  const key = editorKeyForBlock(block);
  const label = BLOCK_LABELS[key] || BLOCK_LABELS[String(rec.type)] || String(rec.type || "block");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("rounded-2xl border border-[#E8E6E0] bg-white shadow-sm", isDragging && "opacity-70 z-10 ring-2 ring-[#0052FF]/30")}
    >
      <div className="flex items-center gap-2 border-b border-[#E8E6E0] px-3 py-2">
        <button
          type="button"
          className="touch-none p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Перетащить"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <button type="button" className="flex flex-1 items-center gap-2 text-left min-w-0" onClick={() => setOpen((o) => !o)}>
          {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
          <span className="font-heading font-bold text-sm truncate">{label}</span>
          <span className="text-[10px] font-mono text-muted-foreground truncate">{String(rec.type ?? "")}</span>
        </button>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => onDuplicate(index)} aria-label="Дублировать">
          <Copy className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={() => onRemove(index)} aria-label="Удалить">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {open ? (
        <div className="space-y-0">
          {BLOCK_EDITOR_HELP[key] ? (
            <p className="text-xs text-muted-foreground px-4 pt-1 pb-2 leading-relaxed border-b border-[#E8E6E0]/80">
              {BLOCK_EDITOR_HELP[key]}
            </p>
          ) : null}
          <div className="p-4">
            <BlockEditorRouter value={rec} onChange={(next) => onChange(index, next)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  rows: WrappedBlock[];
  onRowsChange: (rows: WrappedBlock[]) => void;
};

export function VisualBlocksEditor({ rows, onRowsChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => rows.map((r) => r.sid), [rows]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.sid === active.id);
    const newIndex = rows.findIndex((r) => r.sid === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onRowsChange(arrayMove(rows, oldIndex, newIndex));
  };

  const changeBlock = (index: number, next: Record<string, unknown>) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], block: next };
    onRowsChange(copy);
  };

  const duplicate = (index: number) => {
    const b = rows[index]?.block;
    const copy = [...rows];
    const cloned = JSON.parse(JSON.stringify(b));
    copy.splice(index + 1, 0, { sid: crypto.randomUUID(), block: cloned });
    onRowsChange(copy);
  };

  const remove = (index: number) => {
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  const [addOpen, setAddOpen] = useState(false);
  const addBlock = (type: string) => {
    const block = defaultBlock(type);
    onRowsChange([...rows, { sid: crypto.randomUUID(), block }]);
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <SortableBlockRow
                key={row.sid}
                row={row}
                index={index}
                onChange={changeBlock}
                onDuplicate={duplicate}
                onRemove={remove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" className="rounded-xl w-full border-dashed border-2 border-[#0D0D0B]/20 py-6" onClick={() => setAddOpen(true)}>
        + Добавить блок
      </Button>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Тип блока</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 max-h-[60vh] overflow-y-auto">
            {ADDABLE_BLOCK_TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                className="rounded-xl border border-[#E8E6E0] px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
                onClick={() => addBlock(t.type)}
              >
                {t.label}
                <span className="block text-[10px] font-mono text-muted-foreground mt-0.5">{t.type}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
