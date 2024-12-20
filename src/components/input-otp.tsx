export default function InputOtp() {
  return (
    <div className="bg-black py-2 flex">
      <div className="relative w-10 h-10 my-3 ml-3 rounded-l-lg">
        <input
          type=""
          className="absolute inset-0 h-full w-full bg-gray-800 text-white text-center border border-gray-300 rounded-l-lg focus:outline-none focus:border-2 focus:border-blue-500"
          maxLength={1}
          placeholder="1"
        />
      </div>
      <div className="relative w-10 h-10 my-3">
        <input
          type=""
          className="absolute inset-0 h-full w-full bg-gray-800 text-white text-center border border-gray-300 focus:outline-none focus:border-2 focus:border-blue-500"
          maxLength={1}
          placeholder="2"
        />
      </div>
      <div className="relative w-10 h-10 my-3">
        <input
          type=""
          className="absolute inset-0 h-full w-full bg-gray-800 text-white text-center border border-gray-300 focus:outline-none focus:border-2 focus:border-blue-500"
          maxLength={1}
          placeholder="3"
        />
      </div>
      <div className="relative w-10 h-10 my-3">
        <input
          type=""
          className="absolute inset-0 h-full w-full bg-gray-800 text-white text-center border border-gray-300 focus:outline-none focus:border-2 focus:border-blue-500"
          maxLength={1}
          placeholder="4"
        />
      </div>
      <div className="relative w-10 h-10 my-3">
        <input
          type=""
          className="absolute inset-0 h-full w-full bg-gray-800 text-white text-center border border-gray-300 focus:outline-none focus:border-2 focus:border-blue-500"
          maxLength={1}
          placeholder="5"
        />
      </div>
      <div className="relative w-10 h-10 my-3 mr-3 rounded-r-lg">
        <input
          type=""
          className="absolute inset-0 h-full w-full bg-gray-800 text-white text-center border border-gray-300 rounded-r-lg focus:outline-none focus:border-2 focus:border-blue-500"
          maxLength={1}
          placeholder="6"
        />
      </div>
    </div>
  );
}
