"use client";

declare global {
  interface Window {
    RichTextEditor: any; // Define RichTextEditor on the Window interface
  }
}

import { useEffect, useRef } from "react";

export default function RichTextEditor({
  onChange,
  value = "",
}: {
  onChange?: (content: string) => void;
  value?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  let rte = null;
  useEffect(() => {
    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/richtexteditor/rte_theme_default.css";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src = "/richtexteditor/rte.js";
    const pluginsScript = document.createElement("script");
    script.onload = () => {
      pluginsScript.src = "/richtexteditor/plugins/all_plugins.js";
      pluginsScript.onload = () => {
        if (editorRef.current) {
          // Initialize the RichTextEditor
          rte = new window.RichTextEditor(editorRef.current);
          rte.setHTMLCode(value);
          rte.attachEvent("change", function () {
            var textCount: string = rte.getHTMLCode();
            if (onChange) {
              onChange(textCount);
            }
          });
        }
      };
    };
    document.body.appendChild(pluginsScript);
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(link);
      document.body.removeChild(script);
      document.body.removeChild(pluginsScript);
    };
  }, []);

  return <div ref={editorRef}></div>;
}
