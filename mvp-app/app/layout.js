import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { ThemeProvider } from "../components/ThemeProvider";

export const metadata = {
  title: "ReadEasy",
  description: "Smart text simplification for Dyslexia, ADHD, and ESL learners.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <head>
        <meta name="darkreader-lock" content="true" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-50 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
