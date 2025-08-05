import React from 'react';

export const ErrorMessage = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
      <p className="text-red-700 text-sm">{error}</p>
    </div>
  );
};