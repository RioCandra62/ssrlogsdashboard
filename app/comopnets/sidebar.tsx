"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, LayoutDashboard, Heart, Settings, Activity } from "lucide-react";

export default function SideBar() {
  const pathname = usePathname();

  const links = [
    {
      name: "Overview",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Today Activity",
      href: "/today",
      icon: Clock,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: Activity,
    },
  ];

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 shadow-[2px_0_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-none z-10">
      <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3 w-full group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
            SR
          </div>
          <span className="font-bold tracking-tight text-xl text-slate-900 dark:text-white bg-clip-text">
            SSR Radar
          </span>
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-3 px-2">
          Menu
        </p>
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-500/20"
                      : "group-hover:bg-slate-200/50 dark:group-hover:bg-slate-700/50"
                  }`}
                >
                  <link.icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                </div>
                <span className="text-[15px]">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800/60">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm border border-indigo-200/50 dark:border-indigo-700/30">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              John Doe
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
