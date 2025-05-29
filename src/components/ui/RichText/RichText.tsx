import { CSSProperties, useEffect, useRef, useState } from 'react';
import { type Delta } from 'quill';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import style from './Richtext.module.css';
import { useAtomValue } from 'jotai';
import { finalErrCheckAtom } from '@/components/application_components/InputForm';
interface RichTextProps {
    initialData?: Record<any, any>;
    readOnly: boolean;
    onChange: (delta: Delta) => void;
    placeholder?: string;
    maxLength?: number;
    required?: boolean;
}

/**
 * initialData should a 'Delta' object like Quill expects.
 * Treat Delta like a Pojo
 * @returns
 */
export function RichText({
    readOnly,
    initialData,
    onChange,
    maxLength,
    required,
}: RichTextProps) {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const richeditorRef = useRef<Quill>();
    const [lengthText, setLengthText] = useState('');
    const [errorMsg, setError] = useState('');
    const validRef = useRef<HTMLInputElement>(null);
    const finalCheck = useAtomValue(finalErrCheckAtom);

    function errorCheck() {
        // if (initialLoad && !finalCheck) {
        //     return;
        // }

        const editor = richeditorRef.current;
        if (!editor) {
            return;
        }
        if (required && editor.getLength() <= 1) {
            validRef.current?.setCustomValidity("Can't be empty");
            setError("Can't be empty");
        } else if (editor.getLength() - 1 > (maxLength ?? 99999)) {
            validRef.current?.setCustomValidity('Too much text');
            setError('Too much text');
        } else {
            validRef.current?.setCustomValidity('');
            setError('');
        }
    }

    function lengthCheck() {
        if (maxLength) {
            const editor = richeditorRef.current;
            if (!editor) {
                return;
            }
            setLengthText(`${editor.getLength() - 1}/${maxLength}`);
        }
    }

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
            errorCheck();
            lengthCheck();
        });
        richeditorRef.current = editor;
        lengthCheck();
    }, []);

    useEffect(() => {
        if (finalCheck) {
            errorCheck();
        }
    }, [finalCheck]);

    const [initialLoad, setinitialLoad] = useState(true);

    useEffect(() => {
        if (initialLoad && !finalCheck) {
            setinitialLoad(false);
            return;
        }

        if (richeditorRef.current?.getLength() === 1 && initialLoad) {
            // counts eof as a char for some reason
            richeditorRef.current?.setContents((initialData as Delta) ?? []);
        }
    }, [initialData]);

    return (
        <div
            className={`mx-auto w-full ${style.inputRoot} `}
            style={
                {
                    '--errorMsg': `"${errorMsg}"`,
                } as CSSProperties
            }
        >
            <input
                required={required}
                value={'dummy'}
                style={{ display: 'none' }}
                ref={validRef}
            />
            <div
                ref={editorContainerRef}
                className={`border border-neutral-600/60 bg-neutral-800/60 ${!readOnly ? 'rounded-b-lg border-t-0' : 'cursor-default rounded-lg'} min-h-[150px] text-white ${style.inputContainer}`}
                style={
                    {
                        '--lengthText': `"${lengthText}"`,
                        '--errorMsg': `"${errorMsg}"`,
                    } as CSSProperties
                }
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
