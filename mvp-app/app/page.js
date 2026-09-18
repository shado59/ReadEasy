import Link from "next/link";
import { ArrowRight, Brain, Sparkles, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4 text-center">
      <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-6">
        Making Learning <span className="text-gradient">Effortless</span>
      </h1>
      <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
        Turn long, complicated textbooks into simple, beautiful, and interactive slides that anyone can easily read and understand.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-24">
        <Link href="/learn" className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all">
          Start for Free <ArrowRight size={20} />
        </Link>
        <Link href="/about" className="flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
          Learn More
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 text-left">
        <FeatureCard 
          icon={<Brain size={32} className="text-indigo-500 dark:text-indigo-400" />}
          title="ADHD & Dyslexia Friendly"
          desc="Texts are broken down into bite-sized slides with distinct styling and spacing to reduce cognitive load."
        />
        <FeatureCard 
          icon={<Zap size={32} className="text-amber-500 dark:text-amber-400" />}
          title="Instant Quizzes"
          desc="Test your understanding instantly with auto-generated interactive quizzes based on your reading."
        />
        <FeatureCard 
          icon={<Sparkles size={32} className="text-emerald-500 dark:text-emerald-400" />}
          title="Smart Processing"
          desc="Upload images or documents. Our system will read, simplify, and restructure the content for you."
        />
      </div>

      {/* How it Works Section */}
      <div className="mb-24 text-left bg-white dark:bg-slate-900 p-10 md:p-16 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-12 text-center">How it Works</h2>
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          <StepCard 
            number="1"
            title="Upload your material"
            desc="Take a photo of a textbook page, or drag and drop a PDF file. You can even add custom instructions for how you want it simplified."
          />
          <StepCard 
            number="2"
            title="Let the magic happen"
            desc="The system instantly analyzes the complex text and restructures it into bite-sized, readable, and engaging slides."
          />
          <StepCard 
            number="3"
            title="Learn & Test"
            desc="Read through the simplified slides smoothly. When you're done, test your knowledge with auto-generated quizzes!"
          />
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-12 md:p-20 rounded-3xl shadow-2xl mb-16 text-center">
        <h2 className="text-4xl font-extrabold text-white mb-6">Ready to transform your reading?</h2>
        <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">Join the thousands of students reading easier, faster, and better today.</p>
        <Link href="/learn" className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-slate-50 px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-transform hover:-translate-y-1">
          Try ReadEasy Now <ArrowRight size={20} />
        </Link>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-medium">
        <p>© 2026 ReadEasy. Built for the Hackathon with ❤️.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-card p-8 hover:-translate-y-1 transition-transform group">
      <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-colors">
      <div className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-sm border border-slate-100 dark:border-slate-800">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

