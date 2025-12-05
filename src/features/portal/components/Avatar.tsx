import React, { useState } from 'react';


const avatarCandidate = (seed: string) => [
  `https://avatar-placeholder.iran.liara.run/face?username=${encodeURIComponent(seed)}`,
  `https://i.pravatar.cc/64?u=${encodeURIComponent(seed)}`,
];


export const Avatar: React.FC<{ name?: string; small?: boolean }> = ({ name = 'User', small = false }) => {
  const [srcIdx, setSrcIdx] = useState(0);
  const size = small ? 'h-5 w-5' : 'h-7 w-7';
  const src = avatarCandidate(name)[srcIdx];
  return (
    <div className={`${size} rounded-full overflow-hidden bg-gradient-to-tr from-gray-200 to-gray-300 shadow-inner grid place-items-center text-[10px] text-gray-600`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setSrcIdx((i) => Math.min(i + 1, avatarCandidate(name).length - 1))}
      />
    </div>
  );
};