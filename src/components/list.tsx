export default function List() {
  return (
    <div className="m-3 bg-black w-3/6 p-4 rounded-lg">
      <div className="flex justify-between mb-4">
        <p className="text-gray-500 text-sm">Checked in</p>
        <button className="bg-blue-900 bg-opacity-75 text-blue-300 py-1 px-3 rounded-lg text-sm">
          RSVPd
        </button>
      </div>
      <div className="flex justify-between mb-2">
        <p className="text-gray-500 text-sm">Checked in</p>
        <p className="w-2/5 text-right text-white text-sm">
          November 12 at 11:59 PM
        </p>
      </div>
      <div>
        <p className="text-lg text-white">Unlocking GPT-3: Open AI Workshop</p>
        <p className="text-gray-500 text-sm">3:30 PM • Workshop</p>
      </div>
    </div>
  );
}
