"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Vertical drag-and-drop list (pointer + keyboard). Order is the array order. */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  render,
  disabled = false,
  className,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  render: (item: T, index: number) => React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className={cn("space-y-2", className)}>
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id} disabled={disabled}>
              {render(item, index)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, disabled, children }: { id: string; disabled: boolean; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2 rounded-lg border border-ad-border bg-ad-card p-2", isDragging && "relative z-10 shadow-lg ring-1 ring-ad-accent/50")}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label="Sürüşdür"
        disabled={disabled}
        className="grid size-8 shrink-0 cursor-grab place-items-center rounded-md text-ad-muted-fg hover:bg-ad-muted hover:text-ad-fg active:cursor-grabbing disabled:opacity-40"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
