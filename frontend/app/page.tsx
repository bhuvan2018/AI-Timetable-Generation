import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8 text-center">
          AI Timetable Generator
        </h1>
        
        <p className="text-lg mb-8 text-center max-w-2xl">
          An intelligent system that automatically generates optimized class timetables 
          for schools and colleges by considering multiple constraints and preferences.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
          <FeatureCard 
            title="Constraint-Based Optimization" 
            description="Handles complex scheduling constraints like faculty availability, subject load, and classroom capacity."
          />
          <FeatureCard 
            title="Real-Time Updates" 
            description="Supports dynamic updates when constraints change, such as when a faculty member becomes unavailable."
          />
          <FeatureCard 
            title="Analytics Dashboard" 
            description="Provides insights into timetable efficiency, resource utilization, and identifies potential improvements."
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/generate" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center"
          >
            Generate Timetable
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
          <Link 
            href="/view" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg"
          >
            View Existing Timetables
          </Link>
          <Link 
            href="/data" 
            className="bg-green-100 hover:bg-green-200 text-green-800 font-bold py-3 px-6 rounded-lg"
          >
            Browse Data
          </Link>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-3 text-indigo-700">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 