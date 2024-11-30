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
    <div className="space-y-4 p-10 bg-black">
      {alertData.map(({ color, Icon }, index) => (
        <div
          key={index}
          className={`flex p-3 rounded-2xl border border-${color} bg-${color}-100`}
        >
          <div
            className={`flex justify-center w-10 h-10 bg-${color}-200 rounded-full pt-1`}
          >
            <Image src={Icon} alt={`${color} alert icon`} className="w-6 h-6" />
          </div>
          <div className="ml-1 flex-grow">
            <div className="flex justify-between items-start">
              <h2 className={`font-bold text-${color}`}>Title of alert</h2>
              <button className="text-sm text-white hover:text-gray-700">
                ✕
              </button>
            </div>
            <p className="text-sm text-white pt-1">
              File upload failed. Check your connection and try again.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
