import { useEffect, useRef } from 'react';
import Quill, { Delta } from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextProps {
    initialData?: Record<any, any>;
    readOnly: boolean;
    onChange: (delta: Delta) => void;
}

/**
 *
 * initialData should a 'Delta' object like Quill expects.
 * Treat Delta like a Pojo
 * @returns
 */
export function RichText({ readOnly, initialData, onChange }: RichTextProps) {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const richeditorRef = useRef<Quill>();

    useEffect(() => {
        if (richeditorRef.current) {
            return;
        }

        const editor = new Quill(editorContainerRef.current!, {
            readOnly,
            theme: 'snow',
            modules: {
                toolbar: !readOnly,
            },
        });
        editor.setContents((initialData as Delta) ?? []);
        editor.on(Quill.events.TEXT_CHANGE, (delta) => {
            onChange(editor.getContents());
        });
        richeditorRef.current = editor;
    }, []);

    return (
        <div>
            <div ref={editorContainerRef}></div>
        </div>
    );
}
