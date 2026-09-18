import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass dark:border-slate-800 dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-md">
              <BookOpen size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">ReadEasy</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors hidden sm:block">Home</Link>
            <Link href="/about" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors hidden sm:block">About Us</Link>
            <ThemeToggle />
            <Link href="/learn" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm sm:text-base">
              Start Learning
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
