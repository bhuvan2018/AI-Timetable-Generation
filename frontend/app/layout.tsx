import '../styles/globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Timetable Generator',
  description: 'Intelligent system for generating optimized school/college timetables',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 to-black text-white antialiased`}>
        <header className="border-b border-gray-800 shadow-md py-4 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition">
              AI Timetable Generator
            </Link>
            <nav>
              <ul className="flex space-x-6">
                <li><Link href="/" className="text-gray-300 hover:text-white transition">Home</Link></li>
                <li><Link href="/generate" className="text-gray-300 hover:text-white transition">Generate</Link></li>
                <li><Link href="/view" className="text-gray-300 hover:text-white transition">View</Link></li>
                <li><Link href="/data" className="text-gray-300 hover:text-white transition">Data</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="container mx-auto py-8 px-4">
          {children}
        </main>
        <footer className="mt-auto py-6 border-t border-gray-800 text-center text-gray-400 text-sm">
          AI Timetable Generator | Developed with Next.js and FastAPI
        </footer>
      </body>
    </html>
  )
} 