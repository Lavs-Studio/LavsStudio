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
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose">404</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Page not found</h1>
        <p className="mt-6 text-lg text-espresso/70">The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="mt-8 inline-block rounded-full bg-espresso px-6 py-3 text-white">
          Back to home
        </Link>
      </section>
    </Layout>
  );
}
