import React from 'react';

const WaitingCard = ({ username, profilePic, playerNumber }) => {
  return (
    <div className="flex flex-col justify-center items-center p-4 bg-gray-900 max-h-screen rounded-md ">
      <header className='text-2xl mb-8'>Player {playerNumber}</header>
      <img
        src={profilePic}
        alt={`${username}'s profile`}
        className="w-36 h-36 rounded-full object-cover"
      />
      <div className="ml-4">
        <p className="text-lg font-semibold">{username}</p>
      </div>
    </div>
  );
};

export default WaitingCard;
