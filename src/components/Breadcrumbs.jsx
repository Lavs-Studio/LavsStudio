import { Link, useLocation } from 'react-router-dom';

const labels = {
  '/': 'Home',
  '/categories': 'Categories',
  '/fashion': 'Fashion',
  '/jewellery': 'Jewellery',
  '/hair-care': 'Hair Care',
  '/skin-care': 'Skincare',
  '/amazon-finds': 'Amazon Finds',
  '/blog': 'Blog',
  '/about': 'About',
  '/contact': 'Contact',
  '/privacy-policy': 'Privacy Policy',
  '/affiliate-disclosure': 'Affiliate Disclosure',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mx-auto mb-6 flex max-w-7xl flex-wrap items-center gap-2 px-4 text-xs font-medium text-[#2e1f3b]/70 sm:px-6 lg:px-8">
      <Link to="/" className="hover:text-[#ec4899] transition">Home</Link>
      {pathnames.map((segment, index) => {
        const href = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = labels[href] || segment.replace(/-/g, ' ');

        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-[#2e1f3b]/30">/</span>
            {isLast ? <span className="text-[#ec4899] font-semibold capitalize">{label}</span> : <Link to={href} className="hover:text-[#ec4899] transition capitalize">{label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}


