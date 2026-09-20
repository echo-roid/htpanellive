const ErrorDisplay = ({ error, onRetry }) => {
    if (!error) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md">
        <div className="flex justify-between">
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={onRetry}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  };
  
 