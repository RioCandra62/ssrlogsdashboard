import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Welcome back, check your system status
        </p>
      </div>
      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            System Online
          </span>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm relative group">
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-800"></span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
