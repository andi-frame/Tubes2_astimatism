import React from "react";

interface FullPageLoaderProps {
  progress?: number;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({ progress = 0 }) => {
  const displayProgress = Math.round(progress * 100);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="w-24 h-24 border-t-4 border-b-4 border-white rounded-full animate-spin mb-4"></div>
      <div className="text-white text-xl">Loading...</div>
      
      {progress > 0 && progress < 1 && (
        <div className="mt-4 w-64">
          <div className="bg-gray-700 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            ></div>
          </div>
          <div className="text-white text-sm text-center mt-2">
            {displayProgress}% complete
          </div>
        </div>
      )}
    </div>
  );
};

export default FullPageLoader;