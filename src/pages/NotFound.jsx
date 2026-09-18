import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <Layout>
      <Seo
        title="Page Not Found"
        description="The requested page could not be found on Lavs Studio."
      />
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">404 Error</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#2e1f3b] sm:text-5xl">Page not found</h1>
        <p className="mt-6 text-lg text-[#2e1f3b]/75">The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="mt-8 inline-block rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 shadow-md shadow-[#f472b6]/20">
          Back to home
        </Link>
      </section>

    </Layout>
  );
}

