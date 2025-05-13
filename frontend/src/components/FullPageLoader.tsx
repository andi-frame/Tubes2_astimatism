import React from "react";

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
      <p className="text-white text-lg">Scraping data...</p>
    </div>
  );
};

export default FullPageLoader;
