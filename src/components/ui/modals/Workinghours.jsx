import React from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

const Workinghours = ({ percentage = 65 }) => {
  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg border border-gray-300 p-4 max-w-sm w-48">
      <h2 className="text-[10px] font-semibold text-gray-700 mb-2">Today Working Hours Complete</h2>
      <div className="w-24 h-24 mx-auto">
        <CircularProgressbar
          value={100}
          text={`${100}%`}
          styles={buildStyles({
            textColor: '#1f2937',
            pathColor: '#10b981',
            trailColor: '#d1d5db',
            textSize:"14px",
            
          })}
        />
      </div>
    </div>
  );
};

export default Workinghours;
