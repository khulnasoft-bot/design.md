import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { markdown } from '@codemirror/lang-markdown';
import { useDesignMdState } from '../../hooks/useDesignMdState';
import '../../styles/editor.css';

export function DesignMdEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { content, setContent } = useDesignMdState();

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      basicSetup,
      markdown(),
      EditorView.updateListener.of((update: any) => {
        if (update.docChanged) {
          setContent(update.state.doc.toString());
        }
      }),
    ];

    const doc = EditorState.create({
      doc: content,
      extensions,
    });

    const view = new EditorView({
      state: doc,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [setContent]);

  return <div ref={containerRef} className="design-md-editor" />;
}
