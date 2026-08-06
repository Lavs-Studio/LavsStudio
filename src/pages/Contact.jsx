import Layout from '../components/Layout';
import Seo from '../components/Seo';

export default function Contact() {
  return (
    <Layout>
      <Seo
        title="Contact"
        description="Contact Lavs Studio for collaborations, brand inquiries, and lifestyle partnerships."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold sm:text-5xl">Contact</h1>
        <p className="mt-6 text-lg text-espresso/70">Reach out for collaborations, brand inquiries, or general questions.</p>
        <form className="mt-8 space-y-4 rounded-[24px] border border-rose/20 bg-white p-8 shadow-soft">
          <input className="w-full rounded-full border border-rose/20 px-4 py-3" placeholder="Your name" />
          <input className="w-full rounded-full border border-rose/20 px-4 py-3" placeholder="Your email" />
          <textarea className="min-h-[140px] w-full rounded-[20px] border border-rose/20 px-4 py-3" placeholder="Your message" />
          <button className="rounded-full bg-espresso px-6 py-3 text-white">Send message</button>
        </form>
      </section>
    </Layout>
  );
}
