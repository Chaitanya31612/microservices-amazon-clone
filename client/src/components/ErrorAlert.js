const ErrorAlert = ({ message = "There was a problem", subMessage }) => {
  return (
    <div className="w-full border border-red-500 rounded-md mb-4 bg-white">
      <div className="flex p-4">
        <div className="flex-shrink-0 mr-3">
          <svg
            className="h-6 w-6 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <p className="font-medium text-red-600 text-sm">{message}</p>
          {subMessage && (
            <p className="text-sm text-gray-700 mt-1">{subMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
