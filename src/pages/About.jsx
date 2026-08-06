import Layout from '../components/Layout';
import Seo from '../components/Seo';

export default function About() {
  return (
    <Layout>
      <Seo
        title="About"
        description="Learn about Lavs Studio, a feminine lifestyle brand focused on affordable fashion, beauty and Pinterest-inspired recommendations."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold sm:text-5xl">About Lavs Studio</h1>
        <p className="mt-6 text-lg text-espresso/70">
          Lavs Studio is a feminine lifestyle destination built around thoughtfully curated fashion, beauty, and everyday indulgences. The goal is to make discovery feel calm, beautiful, and inspiring.
        </p>
        <div className="mt-8 rounded-[24px] border border-rose/20 bg-white p-8 shadow-soft">
          <p className="text-espresso/70">
            Every recommendation is designed to feel polished, attainable, and worthy of a second look.
          </p>
        </div>
      </section>
    </Layout>
  );
}
