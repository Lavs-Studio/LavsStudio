import { Link, NavLink } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'Categories', to: '/categories' },
  { name: 'Blog', to: '/blog' },
  { name: 'About', to: '/about' },
  { name: 'Contact', to: '/contact' },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-transparent text-espresso">
      <header className="sticky top-0 z-50 border-b border-rose/20 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-2xl font-semibold tracking-[0.3em] text-espresso">
            LAVS STUDIO
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm transition ${isActive ? 'text-rose' : 'text-espresso/80 hover:text-rose'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-rose/30 p-2 text-espresso/80 transition hover:border-rose hover:text-rose">
              🔍
            </button>
            <div className="hidden rounded-full bg-cream px-3 py-2 text-sm md:block">
              Shop by Mood
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-b-[24px] border border-rose/20 bg-cream px-4 py-3 text-sm text-espresso/80 sm:mx-4 sm:px-6 lg:mx-8 lg:px-8">
          <span>Disclosure: Lavs Studio may earn a commission from qualifying Amazon purchases. Prices and availability are placeholders.</span>
          <Link to="/affiliate-disclosure" className="font-semibold text-rose">Learn more</Link>
        </div>
        <Breadcrumbs />
        {children}
      </main>

      <footer className="border-t border-rose/20 bg-white/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">Lavs Studio</h3>
            <p className="mt-2 text-sm text-espresso/70">
              Curated fashion, beauty, and lifestyle picks for a soft, elevated life.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Explore</h3>
            <ul className="mt-2 space-y-2 text-sm text-espresso/70">
              <li><Link to="/categories" className="hover:text-rose">Categories</Link></li>
              <li><Link to="/amazon-finds" className="hover:text-rose">Amazon Finds</Link></li>
              <li><Link to="/blog" className="hover:text-rose">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Policies</h3>
            <ul className="mt-2 space-y-2 text-sm text-espresso/70">
              <li><Link to="/privacy-policy" className="hover:text-rose">Privacy Policy</Link></li>
              <li><Link to="/affiliate-disclosure" className="hover:text-rose">Affiliate Disclosure</Link></li>
              <li className="pt-2 text-xs">Amazon disclaimer: affiliate links and recommendations are placeholders for future Amazon Associates integration.</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
