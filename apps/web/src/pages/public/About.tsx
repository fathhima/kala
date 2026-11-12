import {
  ArrowRight,
  Award,
  Calendar,
  Heart,
  Palette,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const CORE_VALUES = [
  {
    icon: <Video size={22} className="text-kala-terracotta" />,
    title: 'Live Over Pre-Recorded',
    desc: 'True craft is learned through conversation, observation, and real-time feedback — never just passive video playback.',
  },
  {
    icon: <Award size={22} className="text-kala-terracotta" />,
    title: 'Artisans at the Center',
    desc: 'Independent artists set their own schedules and hourly rates, building sustainable livelihoods by sharing what they love.',
  },
  {
    icon: <ShieldCheck size={22} className="text-kala-terracotta" />,
    title: 'Curated & Verified',
    desc: 'Every instructor profile and skill offering is reviewed by our team before going live, ensuring thoughtful, authentic instruction.',
  },
  {
    icon: <Heart size={22} className="text-kala-terracotta" />,
    title: 'Joyful Making',
    desc: 'Whether you are picking up a brush for the first time or refining bridal mehendi techniques, Kala makes space for mindful creativity.',
  },
];

const JOURNEY_PILLARS = [
  {
    icon: <Users size={20} className="text-kala-amber" />,
    title: '1-on-1 Personal Attention',
    desc: 'Every session is tailored to your pace, materials, and creative goals.',
  },
  {
    icon: <Calendar size={20} className="text-kala-amber" />,
    title: 'Flexible Slot Booking',
    desc: 'Browse open availability windows and book sessions that fit seamlessly into your week.',
  },
  {
    icon: <Palette size={20} className="text-kala-amber" />,
    title: 'Traditional & Modern Crafts',
    desc: 'From mehendi and calligraphy to watercolor painting and resin art, all under one roof.',
  },
];

export function About() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-kala-cream via-amber-50 to-orange-50 section-padding overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-kala-amber/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-kala-terracotta/10 blur-3xl pointer-events-none"
        />

        <div className="page-container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-kala-amber/10 text-kala-terracotta text-sm font-medium px-4 py-2 rounded-full mb-6 border border-kala-amber/20">
              <Sparkles size={14} />
              Our Story &amp; Mission
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-kala-brown leading-tight mb-5">
              Preserving Craft Through{' '}
              <span className="text-kala-terracotta">Live Human Connection</span>
            </h1>

            <p className="text-lg text-stone-600 leading-relaxed max-w-2xl">
              Kala is a creative learning marketplace built around a simple idea: the best way to
              learn an art form is live, side-by-side with an artisan who genuinely lives and
              breathes their craft.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission & Editorial Story ── */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h2 className="text-3xl font-bold text-kala-brown">Why We Built Kala</h2>
              <p className="text-stone-600 leading-relaxed">
                Online learning became crowded with pre-recorded videos where learners watch alone
                without anyone to answer questions, adjust their hand angle, or guide their
                brushwork. Meanwhile, skilled artisans lacked a dedicated home to teach directly
                without managing complex booking tools.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Kala bridges that gap. We combine curated skill discovery, seamless slot scheduling,
                secure Razorpay checkout, direct student-instructor messaging, and built-in live
                video rooms — so learners and creators can focus purely on making.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link to="/skills">
                  <Button className="gap-2">
                    Explore Skills <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline">Contact Our Team</Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              {JOURNEY_PILLARS.map((pillar) => (
                <Card
                  key={pillar.title}
                  className="p-5 bg-gradient-to-br from-kala-cream to-amber-50/60 border-amber-100 flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0 shadow-2xs">
                    {pillar.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-kala-brown mb-1">{pillar.title}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="section-padding bg-kala-cream">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kala-brown mb-3">What We Stand For</h2>
            <p className="text-stone-500 max-w-md mx-auto">
              Four principles that guide every feature we build for learners and instructors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_VALUES.map((val) => (
              <Card
                key={val.title}
                className="p-6 bg-white border-amber-100/80 flex flex-col gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-kala-amber/10 flex items-center justify-center shrink-0">
                  {val.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-kala-brown mb-1.5">{val.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{val.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Learners & Artisans ── */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50/70 border-amber-100 flex flex-col justify-between gap-6">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-kala-terracotta bg-white px-3 py-1 rounded-full border border-amber-200 mb-4">
                  For Learners
                </span>
                <h3 className="text-2xl font-bold text-kala-brown mb-3">
                  Learn at Your Own Rhythm
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-4">
                  Browse verified artisans, view real portfolio work, pick a time slot that suits
                  you, message your instructor ahead of class, and join your live video session in
                  one click.
                </p>
              </div>
              <div>
                <Link to="/instructors">
                  <Button className="gap-2">
                    Find an Instructor <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-stone-50 to-amber-50/40 border-stone-200 flex flex-col justify-between gap-6">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-kala-brown bg-white px-3 py-1 rounded-full border border-stone-200 mb-4">
                  For Instructors
                </span>
                <h3 className="text-2xl font-bold text-kala-brown mb-3">
                  Share Your Craft With the World
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-4">
                  Create skill offerings with your own hourly rate, set weekly availability rules or
                  one-time slots, chat directly with booked students, and track your earnings
                  cleanly from your studio dashboard.
                </p>
              </div>
              <div>
                <Link to="/dashboard/become-instructor">
                  <Button variant="outline" className="gap-2 bg-white">
                    Become an Instructor <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-gradient-to-br from-kala-brown to-amber-900 text-white">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold mb-3">Have Questions or Want to Collaborate?</h2>
          <p className="text-amber-100 mb-7 max-w-md mx-auto text-sm leading-relaxed">
            Our team is always happy to help learners, artisans, and creative partners get started
            on Kala.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-kala-brown hover:bg-amber-50 gap-2">
                Get in Touch <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
