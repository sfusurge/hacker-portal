interface ToolTipProps {
  direction: 'left' | 'right' | 'up' | 'down';
}

export default function ToolTip({ direction }: ToolTipProps) {
  const tooltipBaseStyles =
    'relative inline-block bg-gray-800 text-white text-sm py-2 px-4 rounded-xl';
  const triangleBaseStyles = 'absolute w-0 h-0 border-solid';

  const directionStyles = {
    up: {
      tooltip: '',
      triangle:
        'left-1/2 transform -translate-x-1/2 top-[-7px] border-b-[8px] border-b-gray-800 border-x-[9px] border-x-transparent border-t-0',
    },
    down: {
      tooltip: '',
      triangle:
        'left-1/2 transform -translate-x-1/2 bottom-[-7px] border-t-[8px] border-t-gray-800 border-x-[9px] border-x-transparent border-b-0',
    },
    left: {
      tooltip: '',
      triangle:
        'top-1/2 transform -translate-y-1/2 left-[-7px] border-r-[8px] border-r-gray-800 border-y-[9px] border-y-transparent border-l-0',
    },
    right: {
      tooltip: '',
      triangle:
        'top-1/2 transform -translate-y-1/2 right-[-7px] border-l-[8px] border-l-gray-800 border-y-[9px] border-y-transparent border-r-0',
    },
  };

  const currentStyles = directionStyles[direction];

  return (
    <div className="flex items-center justify-center m-2">
      <div className={`${tooltipBaseStyles} ${currentStyles.tooltip}`}>
        Tooltip Text
        <div className={`${triangleBaseStyles} ${currentStyles.triangle}`} />
      </div>
    </div>
  );
}
