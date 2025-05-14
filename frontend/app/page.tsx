import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono flex flex-col">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            AI Timetable Generator
          </h1>
          
          <p className="text-xl mb-8 text-center max-w-2xl text-gray-300">
            An intelligent system that automatically generates optimized class timetables 
            for schools and colleges by considering multiple constraints and preferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-16">
          <FeatureCard 
            title="Constraint-Based Optimization" 
            description="Handles complex scheduling constraints like faculty availability, subject load, and classroom capacity."
            delay="0"
            icon={<OptimizationIcon />}
          />
          <FeatureCard 
            title="Real-Time Updates" 
            description="Supports dynamic updates when constraints change, such as when a faculty member becomes unavailable."
            delay="150"
            icon={<UpdatesIcon />}
          />
          <FeatureCard 
            title="Analytics Dashboard" 
            description="Provides insights into timetable efficiency, resource utilization, and identifies potential improvements."
            delay="300"
            icon={<AnalyticsIcon />}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up">
          <Link 
            href="/generate" 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Generate Timetable
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
          <Link 
            href="/view" 
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-700"
          >
            View Existing Timetables
          </Link>
          <Link 
            href="/data" 
            className="bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-200 font-bold py-4 px-8 rounded-lg flex items-center justify-center transition-all duration-300 border border-indigo-800/50"
          >
            Browse Data
          </Link>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, delay, icon }: { title: string; description: string; delay: string; icon: React.ReactNode }) {
  return (
    <div 
      className="bg-gray-800/50 backdrop-blur p-6 rounded-xl shadow-xl hover:shadow-2xl hover:bg-gray-800/70 transition-all duration-300 border border-gray-700/50 animate-fade-in-up" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-indigo-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-indigo-300">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function OptimizationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function UpdatesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
} 