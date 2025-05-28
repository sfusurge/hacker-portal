import { useEffect, useRef } from 'react';
import Quill, { Delta } from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextProps {
    initialData?: Record<any, any>;
    readOnly: boolean;
    onChange: (delta: Delta) => void;
    placeholder?: string;
}

/**
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
                toolbar: !readOnly
                    ? [
                          ['bold', 'italic', 'strike', 'underline'],
                          ['link'],
                          [{ list: 'ordered' }, { list: 'bullet' }],
                          ['code-block'],
                      ]
                    : false,
            },
        });
        editor.setContents((initialData as Delta) ?? []);
        editor.on(Quill.events.TEXT_CHANGE, (delta: Delta) => {
            onChange(editor.getContents());
        });
        richeditorRef.current = editor;
    }, []);

    useEffect(() => {
        if (richeditorRef.current?.getLength() === 1) {
            // counts eof as a char for some reason
            richeditorRef.current?.setContents((initialData as Delta) ?? []);
        }
    }, [initialData]);

    return (
        <div className="mx-auto w-full">
            <div
                ref={editorContainerRef}
                className={`border border-neutral-600/60 bg-neutral-800/60 ${!readOnly ? 'rounded-b-lg border-t-0' : 'cursor-default rounded-lg'} min-h-[150px] text-white`}
            />
            <style jsx global>{`
                .ql-toolbar {
                    border-top-left-radius: 16px;
                    border-top-right-radius: 16px;
                    border-bottom: none;
                    background-color: rgba(38, 38, 38, 0.6);
                }

                .ql-container {
                    border-bottom-left-radius: 16px;
                    border-bottom-right-radius: 16px;
                    border-top: none;
                }

                .ql-snow {
                    border: 1px solid #525252bc !important;
                }

                .ql-editor {
                    min-height: 150px;
                }
            `}</style>
        </div>
    );
}
