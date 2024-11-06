import React from 'react';

const SkeletonWaitingCard = () => {
  return (
    <div className="flex flex-col mt-10 justify-center max-h-screen items-center p-4 bg-gray-900 rounded-md  animate-pulse">
      
      <p className='text-lg text-red-500 mb-8'>Waiting for a user to join</p>
      <div className="w-36 h-36 bg-gray-300 rounded-full"></div>
      
      
      <div className="ml-4 flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  );
};

export default SkeletonWaitingCard;
