import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import useUpdateProfileImg from '../../hooks/useUpdateProfileImg';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';

const ProfilePage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { data: gamedata } = useQuery({ queryKey: ["gamedata"] });
  const [profileImg, setProfileImg] = useState(authUser.profileImg);
  const [profileImgUpdated, setProfileImgUpdated] = useState(false);
  const { updateProfileImg, isPending } = useUpdateProfileImg();
  const profileImgRef = useRef(null);

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImg(reader.result);
        setProfileImgUpdated(true);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (profileImgUpdated) {
      updateProfileImg(profileImg);
      setProfileImgUpdated(false);
    }
  }, [profileImgUpdated, profileImg]);

  return (
    <>
    <Navbar/>
    <div className="flex flex-col  items-center p-6 bg-gray-900 max-h-screen">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="relative flex justify-center mb-6">
          {isPending ? (
            <div className="rounded-full w-24 h-24 border-2 border-blue-400"></div>
          ) : (
            <>
              <img
                src={profileImg}
                alt="Profile Picture"
                className="rounded-full w-24 h-24 border-2 border-blue-500"
              />
              <button
                className="absolute bottom-0 right-40 bg-orange-500 text-white p-1 rounded-full hover:bg-orange-600"
                title="Update Profile Picture"
                onClick={() => profileImgRef.current.click()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232a2.828 2.828 0 010 4l-9.28 9.28A4 4 0 004 20h0v0l-.708-.708a4 4 0 01-4-4L5.232 8.768a2.828 2.828 0 014 0l5.768 5.768a2.828 2.828 0 000 4l-1.768 1.768a2.828 2.828 0 104 4l1.768-1.768a2.828 2.828 0 000-4L8.768 5.232z"
                  />
                </svg>
              </button>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            ref={profileImgRef}
            onChange={handleImgChange}
          />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-blue-400">{authUser.fullName}</h2>
          <p className="text-blue-300">{authUser.username}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-700 p-4 rounded-lg">
            <span className=" text-sm">Games Played</span>
            <p className="text-lg font-semibold">{gamedata?.gamesPlayed}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <span className="text-sm">Wins</span>
            <p className="text-lg font-semibold text-green-500">{gamedata?.gamesWon}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <span className=" text-sm">Losses</span>
            <p className="text-lg font-semibold text-red-500">
              {gamedata?.gamesPlayed - gamedata?.gamesWon}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Name</span>
            <p className="border rounded-lg p-2 w-1/2 bg-gray-700">{authUser.fullName}</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Username</span>
            <p className="border rounded-lg p-2 w-1/2 bg-gray-700">{authUser.username}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;
