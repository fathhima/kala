import { Link } from 'react-router-dom'
import { Palette, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-kala-brown text-stone-300 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <Palette className="text-kala-amber" size={22} />
              Kala
            </div>
            <p className="text-sm text-stone-400 max-w-xs leading-relaxed">
              A creative learning marketplace connecting artisans with students who want to explore the joy of making.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/skills" className="hover:text-kala-amber transition-colors">Browse Skills</Link></li>
              <li><Link to="/instructors" className="hover:text-kala-amber transition-colors">Find Instructors</Link></li>
              <li><Link to="/register" className="hover:text-kala-amber transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Teach on Kala</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard/become-instructor" className="hover:text-kala-amber transition-colors">Become an Instructor</Link></li>
              <li><Link to="/register" className="hover:text-kala-amber transition-colors">Join Kala</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">© 2026 Kala. All rights reserved.</p>
          <p className="text-xs text-stone-500 flex items-center gap-1">
            Made with <Heart size={12} className="text-kala-rose" /> for creative souls
          </p>
        </div>
      </div>
    </footer>
  )
}
