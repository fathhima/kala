import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const SUPPORT_EMAIL = 'admin@kalaaa.in';

const TOPICS = [
  'General Inquiry',
  'Booking & Payments',
  'Instructor Application',
  'Technical Support',
  'Partnerships',
] as const;

const FAQS = [
  {
    q: 'How do live 1-on-1 sessions work on Kala?',
    a: 'Once you book an available slot and complete payment, your session is confirmed. You can chat with your instructor beforehand to confirm materials and join the built-in live video classroom directly from your booking page.',
  },
  {
    q: 'How do I become an instructor?',
    a: 'Sign up for a free account, head to "Become an Instructor" in your dashboard, complete your bio, add at least one skill offering with portfolio media, and submit your application for admin review.',
  },
  {
    q: 'What if I need to cancel or request a refund?',
    a: 'You can cancel an eligible booking from your My Bookings page. Refunds for paid sessions are processed via Razorpay back to your original payment method.',
  },
  {
    q: 'Can I message an instructor before or after booking?',
    a: 'After a booking is confirmed, a dedicated chat room opens automatically in your Messages inbox so you and your instructor can coordinate supplies, references, and session prep.',
  },
  {
    q: 'How long does instructor application review take?',
    a: 'Our team reviews applications and portfolio media carefully. You can track real-time offering approval status or requested changes right inside your dashboard.',
  },
];

interface FormValues {
  name: string;
  email: string;
  topic: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function Contact() {
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    topic: TOPICS[0],
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted context
    }
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!values.name.trim() || values.name.trim().length < 2) {
      next.name = 'Please enter your full name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (!values.subject.trim() || values.subject.trim().length < 3) {
      next.subject = 'Please add a short subject.';
    }
    if (!values.message.trim() || values.message.trim().length < 10) {
      next.message = 'Please enter at least 10 characters in your message.';
    }
    return next;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setSubmittedData({ ...values });
  };

  const handleReset = () => {
    setSubmittedData(null);
    setErrors({});
    setValues({
      name: '',
      email: '',
      topic: TOPICS[0],
      subject: '',
      message: '',
    });
  };

  const mailtoHref = submittedData
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `[${submittedData.topic}] ${submittedData.subject}`,
      )}&body=${encodeURIComponent(
        `Name: ${submittedData.name}\nEmail: ${submittedData.email}\n\n${submittedData.message}`,
      )}`
    : `mailto:${SUPPORT_EMAIL}`;

  return (
    <div className="overflow-x-hidden">
      {/* ── Header ── */}
      <section className="relative bg-gradient-to-br from-kala-cream via-amber-50 to-orange-50 py-14 md:py-18 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-kala-amber/15 blur-3xl pointer-events-none"
        />
        <div className="page-container relative z-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-kala-brown mb-4">
            We&apos;d Love to Hear From You
          </h1>
          <p className="text-stone-600 text-base md:text-lg leading-relaxed">
            Questions about booking a creative session, applying as an instructor, or partnering
            with Kala? Reach out anytime.
          </p>
        </div>
      </section>

      {/* ── Main Content: Contact Info + Form ── */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Info Cards */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-6 bg-gradient-to-br from-kala-cream to-amber-50/70 border-amber-100">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white border border-amber-100 flex items-center justify-center text-kala-terracotta shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-kala-brown text-base">Email Support</h2>
                    <p className="text-xs text-stone-500 mt-0.5 mb-2.5">
                      For account, booking, or instructor inquiries
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="text-sm font-semibold text-kala-terracotta hover:underline"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                      >
                        {copiedEmail ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-stone-200/80">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-kala-amber shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-kala-brown text-base">Support Hours</h2>
                    <p className="text-sm text-stone-600 mt-1">
                      Monday – Saturday · 9:00 AM – 6:00 PM IST
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Typical response time: within 1 business day
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-stone-200/80">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-kala-brown text-base">
                      Built for Creators Everywhere
                    </h2>
                    <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                      Kala operates online across India, connecting independent artisans and
                      learners through live 1-on-1 video sessions.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-stone-50/70 border-stone-200/80">
                <h3 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
                  <MessageSquare size={15} className="text-kala-terracotta" />
                  Quick Links
                </h3>
                <div className="flex flex-col gap-2 text-sm">
                  <Link
                    to="/skills"
                    className="text-stone-600 hover:text-kala-terracotta transition-colors"
                  >
                    → Explore Creative Skill Categories
                  </Link>
                  <Link
                    to="/instructors"
                    className="text-stone-600 hover:text-kala-terracotta transition-colors"
                  >
                    → Browse Verified Instructors
                  </Link>
                  <Link
                    to="/dashboard/become-instructor"
                    className="text-stone-600 hover:text-kala-terracotta transition-colors"
                  >
                    → Apply to Teach on Kala
                  </Link>
                </div>
              </Card>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              <Card className="p-6 sm:p-8 border-stone-200/90 shadow-xs">
                {submittedData ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={30} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-kala-brown">Message Prepared</h2>
                      <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
                        Thanks, {submittedData.name}! Your inquiry under{' '}
                        <span className="font-semibold text-stone-700">{submittedData.topic}</span>{' '}
                        is ready. Send it directly via your mail app or submit another note.
                      </p>
                    </div>

                    <div className="text-left bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-1.5 text-xs text-stone-600 max-w-lg mx-auto">
                      <p>
                        <span className="font-semibold text-stone-800">Subject:</span>{' '}
                        {submittedData.subject}
                      </p>
                      <p>
                        <span className="font-semibold text-stone-800">Reply to:</span>{' '}
                        {submittedData.email}
                      </p>
                      <p className="pt-1 text-stone-500 whitespace-pre-wrap">
                        {submittedData.message}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center pt-2">
                      <a href={mailtoHref}>
                        <Button className="gap-2">
                          <Mail size={16} /> Open in Email App
                        </Button>
                      </a>
                      <Button variant="outline" onClick={handleReset}>
                        Send Another Message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                      <h2 className="text-xl font-bold text-kala-brown">Send Us a Message</h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Fill out the form below and we&apos;ll help route your request right away.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        placeholder="Aarav Sharma"
                        value={values.name}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        error={errors.name}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        value={values.email}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        error={errors.email}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contact-topic"
                          className="text-sm font-medium text-stone-700"
                        >
                          Topic
                        </label>
                        <select
                          id="contact-topic"
                          value={values.topic}
                          onChange={(e) =>
                            setValues((prev) => ({
                              ...prev,
                              topic: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-kala-amber focus:border-kala-amber transition-colors"
                        >
                          {TOPICS.map((topic) => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Subject"
                        placeholder="How can we help?"
                        value={values.subject}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                        error={errors.subject}
                      />
                    </div>

                    <Textarea
                      label="Message"
                      rows={5}
                      placeholder="Share details about your question, booking ID, or idea..."
                      value={values.message}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      error={errors.message}
                    />

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <p className="text-xs text-stone-400">
                        Or email directly at{' '}
                        <a
                          href={`mailto:${SUPPORT_EMAIL}`}
                          className="text-kala-terracotta hover:underline"
                        >
                          {SUPPORT_EMAIL}
                        </a>
                      </p>
                      <Button type="submit" size="lg" className="gap-2">
                        <Send size={16} /> Send Message
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Accordion ── */}
      <section className="section-padding bg-kala-cream">
        <div className="page-container max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-kala-terracotta mb-2">
              <HelpCircle size={14} />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl font-bold text-kala-brown">Common Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <Card key={faq.q} className="border-amber-100/90 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
                  >
                    <span className="font-semibold text-sm sm:text-base text-kala-brown">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        'text-stone-400 shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180 text-kala-terracotta',
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                      {faq.a}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
