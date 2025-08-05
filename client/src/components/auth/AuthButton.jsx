import React from 'react';
import { Loader2 } from 'lucide-react';

export const AuthButton = ({ 
  isLoading, 
  text, 
  loadingText, 
  colorFrom, 
  colorTo,
  hoverFrom,
  hoverTo
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full bg-gradient-to-r from-${colorFrom}-500 to-${colorTo}-500 hover:from-${hoverFrom || colorFrom}-600 hover:to-${hoverTo || colorTo}-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          {loadingText}
        </div>
      ) : (
        text
      )}
    </button>
  );
};  