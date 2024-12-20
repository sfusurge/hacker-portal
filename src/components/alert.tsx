import DangerIcon from '../../public/components/danger.png';
import SuccessIcon from '../../public/components/success.png';
import InfoIcon from '../../public/components/info.png';
import Info2Icon from '../../public/components/info2.png';
import WarningIcon from '../../public/components/warning.png';
import Image from 'next/image';

export default function Alert() {
  // styling not added yet
  const alertData = [
    { color: 'green-400', Icon: SuccessIcon },
    { color: 'yellow-400', Icon: WarningIcon },
    { color: 'red-400', Icon: DangerIcon },
    { color: 'purple-400', Icon: InfoIcon },
    { color: 'gray-400', Icon: Info2Icon },
  ];

  return (
    <div className="mb-5 py-2 px-2 space-y-3 bg-black w-4/6">
      {alertData.map(({ color, Icon }, index) => (
        <div
          key={index}
          className={`flex p-2 rounded-xl border border-${color} bg-${color}-100`}
        >
          <div
            className={`flex justify-center w-8 h-8 bg-${color}-200 rounded-full pt-1`}
          >
            <Image src={Icon} alt={`${color} alert icon`} className="w-5 h-5" />
          </div>
          <div className="ml-2 flex-grow">
            <div className="flex justify-between items-start">
              <h2 className={`font-bold text-white text-sm`}>Title of alert</h2>
              <button className="text-xs text-white hover:text-gray-700 pr-1">
                ✕
              </button>
            </div>
            <p className="text-xs text-white pt-1">
              File upload failed. Check your connection and try again.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
