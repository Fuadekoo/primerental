import React from "react";
import { Loader2 } from "lucide-react";

function loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 dark:text-blue-400" />
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Loading, please wait...
        </span>
      </div>
    </div>
  );
}

export default loading;
