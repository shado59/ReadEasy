import { Users, Target, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-5xl font-extrabold text-slate-800 text-center mb-16">
        About <span className="text-gradient">Us</span>
      </h1>
      
      <div className="glass-card p-10 mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Target size={28} />
          </div>
          Our Mission
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          Our project aims to bring equality to education. Students with Dyslexia or ADHD often struggle with long, dense textbooks. Our mission is to convert even the most complex textbooks into visual, interactive slides that anyone can read effortlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Users size={24} />
            </div>
            Who is it for?
          </h2>
          <ul className="text-slate-600 leading-relaxed list-disc list-inside space-y-3">
            <li>Students with Dyslexia</li>
            <li>Individuals with ADHD</li>
            <li>English as a Second Language (ESL) learners</li>
            <li>Anyone who wants to digest complex topics quickly</li>
          </ul>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
              <Heart size={24} />
            </div>
            Why this project?
          </h2>
          <p className="text-slate-600 leading-relaxed">
            We chose this project for the hackathon to demonstrate how technology can genuinely change people's lives for the better. No student should be left behind just because traditional reading is challenging for them.
          </p>
        </div>
      </div>
    </div>
  );
}
