import React from 'react';

export default function MyPageIcon({
  isActive = false,
}: {
  isActive?: boolean;
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z"
        className={`${isActive ? ' stroke-white' : 'stroke-custom-gray-300'}`}
        strokeWidth="1.5"
      />
      <path
        d="M20 17.5C20 19.985 20 22 12 22C4 22 4 19.985 4 17.5C4 15.015 7.582 13 12 13C16.418 13 20 15.015 20 17.5Z"
        className={`${isActive ? ' stroke-white' : 'stroke-custom-gray-300'}`}
        strokeWidth="1.5"
      />
    </svg>
  );
}
