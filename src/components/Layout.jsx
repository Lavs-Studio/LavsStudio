import { Link, NavLink } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import useRemoteData from '../hooks/useRemoteData';
import { fetchSiteSettings, fallbackSiteSettings } from '../lib/content';
import AmazonDisclosure from './AmazonDisclosure';

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'Categories', to: '/categories' },
  { name: 'Amazon Finds', to: '/amazon-finds' },
  { name: 'Fashion', to: '/fashion' },
  { name: 'Jewellery', to: '/jewellery' },
  { name: 'Hair Care', to: '/hair-care' },
  { name: 'Skin Care', to: '/skin-care' },
  { name: 'Blog', to: '/blog' },
  { name: 'About', to: '/about' },
  { name: 'Contact', to: '/contact' },
];

export default function Layout({ children }) {
  const [siteSettings] = useRemoteData(fetchSiteSettings, fallbackSiteSettings);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde8f3_0%,#f3e8ff_50%,#faf4fb_100%)] text-[#2e1f3b]">
      {/* Top Banner Notice */}
      <div className="border-b border-[#e9d5ff]/70 bg-white/60 px-4 py-2.5 text-center text-xs text-[#2e1f3b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 flex-wrap">
          <span>✨ {siteSettings.navDisclosure}</span>
          <Link to="/affiliate-disclosure" className="font-semibold text-[#ec4899] hover:underline">
            Learn more →
          </Link>
        </div>
      </div>

      {/* Glass Header */}
      <header className="sticky top-0 z-50 border-b border-[#e9d5ff]/70 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">
              Studio Edit
            </span>
            <span className="text-xl font-bold tracking-[0.25em] text-[#2e1f3b] transition group-hover:text-[#ec4899]">
              {siteSettings.brandName.toUpperCase()}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#f472b6] to-[#c084fc] font-semibold text-white shadow-md shadow-[#f472b6]/20'
                      : 'text-[#2e1f3b]/80 hover:bg-[#f3e8ff]/60 hover:text-[#2e1f3b]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/login"
              className="rounded-full border border-[#f472b6]/40 bg-white/90 px-4 py-2 text-xs font-semibold text-[#2e1f3b] transition hover:border-[#f472b6] hover:bg-[#fde8f3]"
            >
              Admin Console
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <Breadcrumbs />
        {children}
      </main>

      {/* Glass Footer */}
      <footer className="mt-20 border-t border-[#e9d5ff]/70 bg-white/85 px-4 py-12 text-[#2e1f3b] backdrop-blur-xl sm:px-6 lg:px-8 shadow-sm">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">
              About Lavs Studio
            </p>
            <h3 className="text-2xl font-bold">{siteSettings.brandName}</h3>
            <p className="max-w-md text-sm leading-relaxed text-[#2e1f3b]/75">
              {siteSettings.footerDescription}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#ec4899]">
              Explore
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#2e1f3b]/75">
              <li>
                <Link to="/categories" className="transition hover:text-[#ec4899]">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/amazon-finds" className="transition hover:text-[#ec4899]">
                  Amazon Finds
                </Link>
              </li>
              <li>
                <Link to="/fashion" className="transition hover:text-[#ec4899]">
                  Affordable Fashion
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition hover:text-[#ec4899]">
                  Style & Beauty Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#ec4899]">
              Information
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#2e1f3b]/75">
              <li>
                <Link to="/about" className="transition hover:text-[#ec4899]">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-[#ec4899]">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="transition hover:text-[#ec4899]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/affiliate-disclosure" className="transition hover:text-[#ec4899]">
                  Affiliate Disclosure
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-[#e9d5ff]/60 pt-6">
          <AmazonDisclosure />
          <p className="mt-4 text-center text-xs text-[#2e1f3b]/50">
            © {new Date().getFullYear()} {siteSettings.brandName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}



