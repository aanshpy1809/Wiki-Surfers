import React, { useEffect, useState } from 'react';

const TimerBox = ({ timeOver, setTimeOver, result }) => {
  const totalDuration = 120;

  const [timeLeft, setTimeLeft] = useState(() => {
    const savedStartTime = localStorage.getItem('startTime');
    if (savedStartTime) {
      const elapsedTime = Math.floor((Date.now() - parseInt(savedStartTime, 10)) / 1000);
      return Math.max(totalDuration - elapsedTime, 0);
    }
    return totalDuration;
  });

  useEffect(() => {
    // Check if the timer should run
    if (timeLeft > 0 && !result) {
      const timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          const newTimeLeft = prevTimeLeft - 1;
          if (newTimeLeft <= 0) {
            setTimeOver(true);
            clearInterval(timer);
            return 0;
          }
          return newTimeLeft;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    if(timeLeft === 0 && !result) {
      setTimeOver(true);
    }
  }, [timeLeft, result, setTimeOver]);

  useEffect(() => {
    // Only set the start time if it's not already set
    if (!localStorage.getItem('startTime')) {
      localStorage.setItem('startTime', Date.now().toString());
    }
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="flex justify-center items-center h-10 w-20 bg-gray-800 text-white font-bold text-xl rounded-md shadow-md">
      <p>{formatTime(timeLeft)}</p>
    </div>
  );
};

export default TimerBox;
