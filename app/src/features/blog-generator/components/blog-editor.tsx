"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import type { BlogGenerationResult } from "@/lib/blog-generator";
import { serializeBlogArticleHtml } from "./blog-preview";
import { Button } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Quote,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  Copy as CopyIcon,
  Download as DownloadIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
} from "lucide-react";

const buildDocumentHtml = (html: string) =>
  html.trimStart().toLowerCase().startsWith("<!doctype")
    ? html
    : `<!DOCTYPE html><html><body>${html}</body></html>`;

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "blog-post";

interface BlogEditorProps {
  blog: BlogGenerationResult;
  initialHtml?: string;
  onSave(html: string): void;
}

export const BlogEditor = ({ blog, initialHtml, onSave }: BlogEditorProps) => {
  const initialContent = useMemo(() => initialHtml ?? serializeBlogArticleHtml(blog), [blog, initialHtml]);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedBlog, setCopiedBlog] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingMinutes, setReadingMinutes] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: false }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Edit your blog content..." }),
    ],
    content: initialContent,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [editor, initialContent]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateMetrics = () => {
      const text = editor.getText().trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      setWordCount(words);
      setReadingMinutes(words === 0 ? 0 : Math.max(1, Math.ceil(words / 200)));
    };

    updateMetrics();
    editor.on("update", updateMetrics);
    return () => {
      editor.off("update", updateMetrics);
    };
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl, target: "_blank" })
      .run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const handleCopyBlog = useCallback(async () => {
    if (!editor) {
      return;
    }

    const html = editor.getHTML();
    const documentHtml = buildDocumentHtml(html);
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    const plainText = tempElement.textContent ?? "";

    try {
      if (navigator.clipboard && "write" in navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([documentHtml], { type: "text/html" }),
            "text/plain": new Blob([plainText], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      setCopiedBlog(true);
      window.setTimeout(() => setCopiedBlog(false), 2500);
    } catch (error) {
      console.error("Failed to copy blog", error);
      setCopiedBlog(false);
    }
  }, [editor]);

  const handleDownload = useCallback(() => {
    if (!editor) {
      return;
    }

    const html = editor.getHTML();
    const documentHtml = buildDocumentHtml(html);
    const blob = new Blob([documentHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${createSlug(blog.title)}.html`;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [blog.title, editor]);

  const handleCopyHtml = useCallback(async () => {
    if (!editor) {
      return;
    }
    const html = editor.getHTML();
    try {
      await navigator.clipboard.writeText(html);
    } catch (error) {
      console.error("Failed to copy from editor", error);
    }
  }, [editor]);

  const handleSave = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    onSave(html);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }, [editor, onSave]);

  if (!editor) {
    return null;
  }

  const headingButtons = [
    { level: 1, icon: Heading1 },
    { level: 2, icon: Heading2 },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 rounded-[28px] border border-[#2A33A4]/18 bg-white/95 p-5 shadow-[0_30px_80px_rgba(42,51,164,0.08)] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 px-3.5 py-3 shadow-[0_22px_65px_rgba(42,51,164,0.08)]">
        <div className="flex flex-wrap items-center gap-6 text-[#2A33A4]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#2A33A4]/60">Word Count</p>
            <p className="text-xl font-semibold">{wordCount.toLocaleString()} words</p>
          </div>
          <div className="hidden h-10 w-px bg-[#2A33A4]/10 md:block" aria-hidden="true" />
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#2A33A4]/60">Read Time</p>
            <p className="text-sm font-medium">{readingMinutes === 0 ? "0 min read" : `${readingMinutes} min read`}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            onClick={handleDownload}
            variant="ghost"
            className="border-[#2A33A4]/20 px-5 py-2 text-[#2A33A4]/90 hover:border-[#2A33A4]/40"
          >
            <DownloadIcon className="h-4 w-4" />
            Download
          </Button>
          <Button type="button" onClick={handleSave} variant={saved ? "ghost" : "solid"} className="px-5 py-2">
            <Save className="h-4 w-4" />
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 px-2.5 py-2 shadow-[0_18px_55px_rgba(42,51,164,0.05)]">
        <Button
          type="button"
          size="toolbar"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="toolbar"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="toolbar"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="toolbar"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="toolbar"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        {headingButtons.map(({ level, icon: Icon }) => (
          <Button
            key={level}
            type="button"
            size="toolbar"
            variant={editor.isActive("heading", { level }) ? "default" : "ghost"}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            aria-label={`Heading ${level}`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}

        <div className="mx-2 h-6 w-px bg-border" />

        <Button
          type="button"
          size="toolbar"
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          aria-label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="toolbar"
          variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          aria-label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="toolbar"
          variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          aria-label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button
          type="button"
          size="toolbar"
          variant={editor.isActive("link") ? "default" : "ghost"}
          onClick={() => {
            setShowLinkInput(true);
            const previousUrl = editor.getAttributes("link").href ?? "";
            setLinkUrl(previousUrl);
          }}
          aria-label="Insert link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="toolbar"
          variant="ghost"
          onClick={() => {
            const url = window.prompt("Image URL");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          aria-label="Insert image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button
          type="button"
          size="toolbar"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="toolbar"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button type="button" variant="ghost" onClick={handleCopyBlog} className="border-[#2A33A4]/25 px-5 py-2 text-[#1F2A6B]">
          <CopyIcon className="h-4 w-4" />
          {copiedBlog ? "Copied" : "Copy Blog"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleCopyHtml} className="border-[#2A33A4]/25 px-5 py-2 text-[#1F2A6B]">
          <CopyIcon className="h-4 w-4" /> Copy HTML
        </Button>
      </div>

      {showLinkInput ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            className="max-w-xs"
          />
          <Button type="button" onClick={applyLink}>
            Apply
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : null}

      <div className="rounded-2xl bg-white/90 shadow-[inset_0_1px_0_rgba(42,51,164,0.08)]">
        <EditorContent editor={editor} className="min-h-[480px] w-full text-[#2A33A4]" />
      </div>
    </div>
  );
};
