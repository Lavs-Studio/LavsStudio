import Layout from '../components/Layout';
import Seo from '../components/Seo';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <Seo
        title="Privacy Policy"
        description="Read the Lavs Studio privacy policy and understand how your data is handled on the site."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold sm:text-5xl">Privacy Policy</h1>
        <p className="mt-6 text-lg text-espresso/70">
          This page outlines how user information may be collected, used, and protected on Lavs Studio.
        </p>
      </section>
    </Layout>
  );
}
