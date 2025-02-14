import { cn } from '@/lib/utils';
import style from './ColorPicker.module.css';
import { CSSProperties } from 'react';

export function ColorPicker({
    colors,
    colorChange,
    selectedColor,
}: {
    colors: string[];
    colorChange: (color: string) => void;
    selectedColor: string;
}) {
    return (
        <div className={style.row}>
            {colors.map((item) => (
                <button
                    type="button"
                    style={
                        {
                            '--color': item,
                        } as CSSProperties
                    }
                    key={item}
                    className={cn(
                        style.colorItem,
                        selectedColor === item && style.selected
                    )}
                    onClick={() => {
                        colorChange(item);
                    }}
                />
            ))}
        </div>
    );
}
