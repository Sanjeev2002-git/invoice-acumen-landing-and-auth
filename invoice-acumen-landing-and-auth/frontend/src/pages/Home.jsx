import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Package,
  ClipboardList,
  LineChart,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: Package, title: 'Track stock in real time', body: 'Every sale, restock, and adjustment updates your inventory instantly, so the number on screen matches the number on the shelf.' },
  { icon: ClipboardList, title: 'Manage orders end to end', body: 'From cart to fulfilment, follow each order through its lifecycle with a clear status trail for you and your customer.' },
  { icon: LineChart, title: 'Monitor revenue as it happens', body: 'Daily, weekly, and monthly totals roll up automatically into one dashboard, so you always know where the business stands.' },
  { icon: Receipt, title: 'Bill and get paid faster', body: 'Generate clean, itemised invoices in a click and give customers a straightforward way to pay them.' },
];

const STATS = [
  { value: '10k+', label: 'Invoices generated' },
  { value: '99.9%', label: 'Stock accuracy' },
  { value: '3 min', label: 'Avg. setup time' },
  { value: '24/7', label: 'Ledger sync' },
];

const STEPS = [
  { n: '01', title: 'Add your products', body: 'Load in what you sell, set stock levels and prices once, and let the catalog do the rest.' },
  { n: '02', title: 'Send the invoice', body: 'Turn an order into an itemised invoice automatically, no re-typing line items by hand.' },
  { n: '03', title: 'Get paid, reconciled', body: 'Payments post straight to the ledger. Revenue and stock update together, no separate spreadsheet required.' },
];

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}

export default function Home() {
  const { user } = useAuth();
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1 });
  const [stepsRef, stepsInView] = useInView({ threshold: 0.2 });

  return (
    <div className="evo-page min-h-screen overflow-hidden">
      <div className="evo-glow" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24 text-center sm:pt-32">
        <div className="animate-rise-in mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-evo-muted">
          Billing &amp; inventory, in one ledger
        </div>

        <h1 className="animate-rise-in mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Evolving your back office into{' '}
          <span className="evo-gradient-text">one connected ledger</span>
        </h1>

        <p className="animate-rise-in mx-auto mt-6 max-w-xl text-lg leading-relaxed text-evo-muted" style={{ animationDelay: '80ms' }}>
          Invoice Acumen keeps your stock, your orders, and your revenue reading from the
          same page, so closing the books stops being a monthly scramble.
        </p>

        <div className="animate-rise-in mt-10 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: '140ms' }}>
          {!user ? (
            <>
              <Link to="/register" className="evo-btn-primary evo-focus-ring group inline-flex items-center gap-2 px-7 py-3 font-medium">
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/login" className="evo-btn-secondary evo-focus-ring px-7 py-3 font-medium">
                Sign in
              </Link>
            </>
          ) : (
            <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="evo-btn-primary evo-focus-ring inline-flex items-center gap-2 px-7 py-3 font-medium">
              Go to your dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="animate-rise-in mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-evo-muted" style={{ animationDelay: '200ms' }}>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-evo-violet" /> No card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-evo-violet" /> Set up in minutes
          </span>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="evo-gradient-text font-display text-3xl font-semibold sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-evo-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Everything the back office needs
          </h2>
          <p className="mt-4 text-evo-muted">
            Nothing it doesn&apos;t. Built for teams who want stock, orders, and revenue to agree with each other.
          </p>
        </div>

        <div ref={featuresRef} className="mt-14 grid gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className={'evo-card p-6 evo-slide-rtl' + (featuresInView ? ' evo-in-view' : '')} style={{ animationDelay: `${i * 120}ms` }}>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                <Icon className="h-5 w-5 text-evo-violet" />
              </div>
              <h3 className="font-semibold text-evo-text">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-evo-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
            From stockroom to statement, in three steps
          </h2>
          <div ref={stepsRef} className="mt-14 grid gap-10 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.n} className={'evo-card p-6 evo-slide-rtl' + (stepsInView ? ' evo-in-view' : '')} style={{ animationDelay: `${i * 150}ms` }}>
                <span className="evo-gradient-text font-display text-4xl font-semibold opacity-60">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-evo-text">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-evo-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Close the gap between the <span className="evo-gradient-text">stockroom and the ledger</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-evo-muted">
            Create an account and have your first invoice out the door in minutes.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            {!user ? (
              <Link to="/register" className="evo-btn-primary evo-focus-ring inline-flex items-center gap-2 px-7 py-3 font-medium">
                Create your account
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="evo-btn-primary evo-focus-ring inline-flex items-center gap-2 px-7 py-3 font-medium">
                Go to your dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-xs text-evo-muted">
        Invoice Acumen — billing and inventory management.
      </footer>
    </div>
  );
}
