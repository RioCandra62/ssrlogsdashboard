export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        {/* Glow effect behind the spinner */}
        <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/30 animate-pulse"></div>
        
        {/* The spinner itself */}
        <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin relative z-10"></div>
      </div>
      
      <div className="flex flex-col items-center space-y-1">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 tracking-wide animate-pulse">
          Fetching Radar Data...
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Connecting to API endpoint
        </p>
      </div>
    </div>
  );
}
