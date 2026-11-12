import { ArrowRight, Clock, Palette, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SkillCard } from '../../components/shared/SkillCard';
import { Button } from '../../components/ui/Button';
import { useCategoriesQuery } from '../../features/categories/hooks';

// Decorative SVG blob — purely visual, aria-hidden
function ArtBlob({ className, color }: { className: string; color: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={color}
        d="M44.6,-62.3C56.8,-53.2,64.5,-37.9,68.3,-22.1C72.1,-6.3,72.1,10,66.4,23.9C60.7,37.8,49.4,49.3,36.3,57.1C23.1,64.9,8,69,-6.6,67.5C-21.1,66,-35.1,59,-46.4,49.1C-57.7,39.1,-66.3,26.2,-68.7,12.1C-71.1,-2,-67.3,-17.3,-59.6,-29.9C-51.9,-42.5,-40.4,-52.4,-27.6,-60.9C-14.8,-69.4,-0.8,-76.4,13.5,-75.5C27.8,-74.5,32.4,-71.4,44.6,-62.3Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

function SkillCardSkeleton() {
  return <div className="rounded-2xl bg-stone-100 animate-pulse h-36" />;
}

const WHY_KALA = [
  {
    icon: <Video size={22} className="text-kala-terracotta" />,
    title: 'Live 1-on-1 Sessions',
    desc: 'Real-time learning with dedicated attention from your instructor — no pre-recorded videos, no waiting.',
  },
  {
    icon: <Palette size={22} className="text-kala-terracotta" />,
    title: 'Authentic Art Forms',
    desc: 'From age-old mehendi to contemporary resin art — explore creative traditions kept alive by passionate artisans.',
  },
  {
    icon: <Clock size={22} className="text-kala-terracotta" />,
    title: 'Learn at Your Pace',
    desc: 'Book sessions that fit your schedule. No rigid batches, no rush — just you and your craft.',
  },
  {
    icon: <ShieldCheck size={22} className="text-kala-terracotta" />,
    title: 'Verified Instructors',
    desc: 'Every instructor is reviewed and approved. You learn from real artists with verified portfolios.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Discover',
    desc: 'Browse skill categories and find an instructor whose art resonates with you.',
    emoji: '🔍',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    step: '02',
    title: 'Book',
    desc: 'Pick an open slot that suits your schedule and confirm your session in seconds.',
    emoji: '📅',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    step: '03',
    title: 'Create',
    desc: 'Join the live video session with your instructor and start making something beautiful.',
    emoji: '🎨',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
];

export function Landing() {
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesQuery();

  // Flatten categories → show up to 6 subcategories as skill cards
  // Fall back to showing category-level cards if no subcategories
  const skillCards = categories.flatMap((cat) =>
    cat.subcategories && cat.subcategories.length > 0
      ? cat.subcategories.map((sub) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description ?? '',
        }))
      : [
          {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description ?? '',
          },
        ],
  );

  return (
    <div className="overflow-x-hidden">
      {/* ───── Hero ───── */}
      <section className="relative bg-gradient-to-br from-kala-cream via-amber-50 to-orange-50 section-padding overflow-hidden">
        {/* Decorative blobs */}
        <ArtBlob
          className="absolute -top-20 -right-24 w-72 opacity-20 pointer-events-none"
          color="#d97706"
        />
        <ArtBlob
          className="absolute bottom-0 left-0 w-56 opacity-10 pointer-events-none rotate-180"
          color="#c2410c"
        />

        <div className="page-container relative z-10">
          <div className="max-w-2xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-kala-amber/10 text-kala-terracotta text-sm font-medium px-4 py-2 rounded-full mb-6 border border-kala-amber/20">
              <Sparkles size={14} />
              Live Creative Learning
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-kala-brown leading-tight mb-5">
              Learn the Art of{' '}
              <span className="text-kala-terracotta relative inline-block">
                Making
                {/* Underline squiggle */}
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6 Q50 2 100 6 Q150 10 198 4"
                    stroke="#d97706"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-lg">
              Connect with passionate artisans and learn creative skills — mehendi, painting,
              calligraphy, resin art, and more — in live one-on-one sessions.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/instructors">
                <Button size="lg" className="gap-2 shadow-md">
                  Explore Creative Skills <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/dashboard/become-instructor">
                <Button variant="outline" size="lg">
                  Share Your Art
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Creative Skills ───── */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-kala-brown mb-3">Creative Skills to Explore</h2>
            <p className="text-stone-500 max-w-md mx-auto">
              From traditional art forms to modern crafts — find your creative calling.
            </p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkillCardSkeleton key={i} />
              ))}
            </div>
          ) : skillCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {skillCards.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400">
              <Palette size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No skills available yet — check back soon!</p>
            </div>
          )}

          {skillCards.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/instructors">
                <Button variant="outline" className="gap-2">
                  Browse All Skills <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="section-padding bg-kala-cream">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kala-brown mb-3">How Kala Works</h2>
            <p className="text-stone-500">Three simple steps to your creative journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop only) */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px border-t-2 border-dashed border-kala-amber/30 z-0"
            />

            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className={`relative z-10 ${step.bg} border ${step.border} rounded-2xl p-8 text-center`}
              >
                <div className="text-4xl mb-4">{step.emoji}</div>
                <div className="text-xs font-bold text-kala-amber tracking-widest mb-2 uppercase">
                  Step {step.step}
                </div>
                <h3 className="text-xl font-semibold text-kala-brown mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Why Kala ───── */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kala-brown mb-3">Why Learn on Kala?</h2>
            <p className="text-stone-500 max-w-md mx-auto">
              We've built Kala around one belief: the best way to learn a craft is from someone who
              truly loves it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_KALA.map((item) => (
              <div
                key={item.title}
                className="bg-gradient-to-br from-kala-cream to-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-kala-amber/10 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-kala-brown mb-1 text-base">{item.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA Banner ───── */}
      <section className="relative py-20 bg-gradient-to-br from-kala-brown to-amber-900 overflow-hidden">
        <ArtBlob
          className="absolute -top-10 -right-10 w-64 opacity-10 pointer-events-none"
          color="#fbbf24"
        />
        <ArtBlob
          className="absolute bottom-0 -left-16 w-56 opacity-10 pointer-events-none rotate-90"
          color="#fbbf24"
        />

        <div className="page-container text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-amber-200 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
            <Sparkles size={14} />
            Start your creative journey today
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-amber-100 mb-8 max-w-md mx-auto text-base leading-relaxed">
            Join students discovering the joy of making something beautiful — one live session at a
            time.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-kala-brown hover:bg-amber-50 shadow-lg gap-2"
              >
                Get Started — It&apos;s Free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/instructors">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 gap-2"
              >
                Browse Skills
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
