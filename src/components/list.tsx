export default function List() {
  // checked in flex justify content space between
  // unlocking: block
  return (
    <div className="bg-black w-4/6 p-8 rounded-lg">
      <div className="flex justify-between mb-8">
        <p className="text-gray-500 text-lg">Checked in</p>
        <button className="bg-blue-900 bg-opacity-75 text-blue-300 py-2 px-4 rounded-lg text-lg">
          RSVPd
        </button>
      </div>
      <div className="flex justify-between mb-3">
        <p className="text-gray-500 text-lg">Checked in</p>
        <p className="w-2/5 text-right text-white text-lg">
          November 12 at 11:59 PM
        </p>
      </div>
      <div>
        <p className="text-xl text-white">Unlocking GPT-3: Open AI Workshop</p>
        <p className="text-gray-500 text-lg">3:30 PM • Workshop</p>
      </div>
    </div>
  );
}
