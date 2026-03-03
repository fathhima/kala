import { Link } from 'react-router-dom'
import { ArrowRight, Star, Palette, Users, Calendar } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { SkillCard } from '../../components/shared/SkillCard'
import { InstructorCard } from '../../components/shared/InstructorCard'
import { mockSkills, mockInstructors } from '../../lib/mock'

export function Landing() {
  const featuredInstructors = mockInstructors.filter((i) => i.isApproved && i.isTopRated)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-kala-cream via-amber-50 to-orange-50 section-padding">
        <div className="page-container">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-kala-amber/10 text-kala-terracotta text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Palette size={14} />
              Live Creative Learning
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-kala-brown leading-tight mb-6">
              Learn the Art of
              <span className="text-kala-terracotta"> Making</span>
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-xl">
              Connect with passionate artisans and learn creative skills — mehendi, painting, calligraphy, resin art, and more — in live one-on-one sessions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/instructors">
                <Button size="lg" className="gap-2">
                  Explore Creative Skills <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/dashboard/become-instructor">
                <Button variant="outline" size="lg">
                  Share Your Art
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12">
              {[
                { icon: <Users size={18} />, value: '1,200+', label: 'Students' },
                { icon: <Palette size={18} />, value: '80+', label: 'Instructors' },
                { icon: <Star size={18} />, value: '4.8', label: 'Avg Rating' },
                { icon: <Calendar size={18} />, value: '3,400+', label: 'Sessions' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="p-2 bg-kala-amber/10 text-kala-terracotta rounded-xl">{stat.icon}</div>
                  <div>
                    <div className="font-bold text-kala-brown text-lg">{stat.value}</div>
                    <div className="text-xs text-stone-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kala-brown mb-3">Creative Skills to Explore</h2>
            <p className="text-stone-500 max-w-md mx-auto">From traditional art forms to modern crafts — find your creative calling.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-kala-cream">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kala-brown mb-3">How Kala Works</h2>
            <p className="text-stone-500">Three simple steps to your creative journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Discover', desc: 'Browse skills and find an instructor whose art resonates with you.', emoji: '🔍' },
              { step: '02', title: 'Book', desc: 'Pick an available slot and book your live creative session.', emoji: '📅' },
              { step: '03', title: 'Create', desc: 'Join the live session via video and start creating with your instructor.', emoji: '🎨' },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-4xl mb-4">{step.emoji}</div>
                <div className="text-xs font-bold text-kala-amber tracking-widest mb-2">{step.step}</div>
                <h3 className="text-xl font-semibold text-kala-brown mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Instructors */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-kala-brown mb-2">Top Rated Instructors</h2>
              <p className="text-stone-500">Learn from the best artisans on Kala</p>
            </div>
            <Link to="/instructors">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredInstructors.slice(0, 3).map((inst) => (
              <InstructorCard key={inst.id} instructor={inst} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gradient-to-br from-kala-brown to-amber-900 text-white">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">What Students Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Riya Singh', text: 'I learned bridal mehendi in just 3 sessions. Priya is incredibly talented and patient!', skill: 'Mehendi' },
              { name: 'Pooja Mehta', text: 'Sneha\'s calligraphy class changed how I write. My journaling looks beautiful now.', skill: 'Calligraphy' },
              { name: 'Kiran Joshi', text: 'Rahul taught me watercolor in a way that felt effortless. Absolutely loved it!', skill: 'Painting' },
            ].map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-kala-amber fill-kala-amber" />
                  ))}
                </div>
                <p className="text-stone-200 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.skill} Student</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-kala-cream">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold text-kala-brown mb-4">Ready to Start Creating?</h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">Join thousands of students discovering the joy of making something beautiful.</p>
          <Link to="/register">
            <Button size="lg">Get Started — It's Free</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
