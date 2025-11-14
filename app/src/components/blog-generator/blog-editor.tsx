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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
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
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
} from "lucide-react";

interface BlogEditorProps {
  blog: BlogGenerationResult;
  initialHtml?: string;
  onSave(html: string): void;
}

export function BlogEditor({ blog, initialHtml, onSave }: BlogEditorProps) {
  const initialContent = useMemo(() => initialHtml ?? serializeBlogArticleHtml(blog), [blog, initialHtml]);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
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
      editor.commands.setContent(initialContent, false, {
        preserveWhitespace: "full",
      });
    }
  }, [editor, initialContent]);

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

  const handleCopy = useCallback(async () => {
    if (!editor) return;
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
    { level: 3, icon: Heading3 },
    { level: 4, icon: Heading4 },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 rounded-[30px] border border-[#2A33A4]/20 bg-white/95 p-6 shadow-[0_35px_90px_rgba(42,51,164,0.08)] md:p-8">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#2A33A4]/15 bg-white/85 p-3 shadow-[0_18px_55px_rgba(42,51,164,0.06)]">
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Block quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("codeBlock") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          aria-label="Code block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
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
            size="icon"
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
          size="icon"
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          aria-label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          aria-label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          aria-label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().unsetTextAlign().run()}
          aria-label="Reset alignment"
        >
          <span className="text-xs font-semibold">⟲</span>
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button
          type="button"
          size="icon"
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
          size="icon"
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
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button type="button" variant="secondary" onClick={handleCopy} className="flex items-center gap-2">
          <CopyIcon className="h-4 w-4" /> Copy HTML
        </Button>
        <Button
          type="button"
          variant={saved ? "outline" : "default"}
          onClick={handleSave}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saved ? "Saved" : "Save"}
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

      <div className="rounded-2xl border border-[#2A33A4]/18 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(42,51,164,0.08)]">
        <EditorContent editor={editor} className="min-h-[480px] w-full text-[#2A33A4]" />
      </div>
    </div>
  );
}
