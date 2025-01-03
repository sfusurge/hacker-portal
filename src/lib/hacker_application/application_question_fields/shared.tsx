'use client';

import { PrimitiveAtom, useAtom } from 'jotai';
import { QuestionTextLineInput } from '../types';
import { useCallback, useMemo, useState } from 'react';

/**
 * common untils shared amongst application question input fields.
 */

function useStringValidator(
    questionAtom: PrimitiveAtom<QuestionTextLineInput>
) {
    // const [question, setQuestion] = useAtom(questionAtom);
    // const [errorMsg, setErrorMsg] = useState<string|undefined>(undefined);

    // const validator = useMemo(() => {
    //     if (question.validationPatterns) {
    //         return new RegExp(question.validationPatterns.pattern, 'i');
    //     }
    //     else {
    //         return undefined;
    //     }
    // }, [question]);

    // const validateAndSave = useCallback((value:string) => {

    //     let valid = true;
    //     if (validator){
    //         valid = value.match(validator) !== null;
    //     }

    //     if (valid){
    //         // if valid, update the question value
    //         question.value = value;
    //         setErrorMsg(undefined);
    //         setQuestion({...question});
    //     }else{
    //         // else just set error msg and do nothing
    //     }

    // }, [setQuestion]) ;

    // actually this is overkill

    return [];
}
