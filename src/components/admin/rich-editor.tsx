"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Redo2, Undo2 } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Tiptap editor storing HTML. `value` can change from outside (language
 * tabs), so the content is re-set when it no longer matches the editor.
 */
export function RichEditor({ value, onChange, id, className }: { value: string; onChange: (html: string) => void; id?: string; className?: string }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, defaultProtocol: "https" } })],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: { attributes: { id: id ?? "", class: "rich-editor min-h-40 px-3 py-2 text-sm leading-relaxed focus:outline-none" } },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if ((value || "") !== current) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return <div className={cn("min-h-48 animate-pulse rounded-lg border border-ad-border bg-ad-muted/40", className)} />;

  const btn = (active: boolean) => cn("grid size-8 place-items-center rounded-md text-ad-muted-fg transition-colors hover:bg-ad-muted hover:text-ad-fg", active && "bg-ad-muted text-ad-fg");

  function link() {
    const previous = editor!.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link (https://…)", previous ?? "https://");
    if (href === null) return;
    if (href === "") editor!.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor!.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div className={cn("rounded-lg border border-ad-border bg-ad-bg focus-within:border-ad-accent focus-within:ring-2 focus-within:ring-ad-ring/40", className)}>
      <div className="flex flex-wrap gap-0.5 border-b border-ad-border p-1" role="toolbar" aria-label="Formatlama">
        <button type="button" onMouseDown={(e) => e.preventDefault()} className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Qalın"><Bold className="size-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Kursiv"><Italic className="size-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Başlıq 2"><Heading2 className="size-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Başlıq 3"><Heading3 className="size-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Siyahı"><List className="size-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Nömrəli siyahı"><ListOrdered className="size-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} className={btn(editor.isActive("link"))} onClick={link} aria-label="Link"><Link2 className="size-4" /></button>
        <span className="mx-1 w-px bg-ad-border" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} className={btn(false)} onClick={() => editor.chain().focus().undo().run()} aria-label="Geri"><Undo2 className="size-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} className={btn(false)} onClick={() => editor.chain().focus().redo().run()} aria-label="İrəli"><Redo2 className="size-4" /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
