import React, { useState } from 'react';

const PrivateWaiting = ({ roomId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="flex flex-col justify-center items-center mt-20 gap-5 px-4">
      <p className="text-md font-bold text-center md:text-lg lg:text-xl">
        Share the Room ID with your friend to join!
      </p>
      <div className="flex flex-col md:flex-row justify-center w-full md:w-3/4 lg:w-1/2 items-center space-y-4 md:space-y-0 md:space-x-4 p-4 bg-gray-800 shadow-md rounded-md">
        <div className="flex-1 text-center md:text-left">
          <p className="text-lg font-semibold text-white">Room ID:</p>
          <p className="text-gray-300 break-words">{roomId}</p>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none transition duration-300 ease-in-out"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export default PrivateWaiting;
