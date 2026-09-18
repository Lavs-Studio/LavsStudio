import Layout from '../components/Layout';
import Seo from '../components/Seo';
import useRemoteData from '../hooks/useRemoteData';
import { fetchPublishedPage, defaultPageCopy } from '../lib/content';

const fetchContactPage = () => fetchPublishedPage('contact');

export default function Contact() {
  const [page] = useRemoteData(fetchContactPage, defaultPageCopy.contact);

  return (
    <Layout>
      <Seo
        title={page.title}
        description={page.description}
      />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#2e1f3b] sm:text-5xl">{page.title}</h1>
        <p className="mt-4 text-lg text-[#2e1f3b]/75 leading-relaxed">{page.description}</p>
        <form className="mt-8 space-y-4 rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-8 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
          <input className="w-full rounded-full border border-[#e9d5ff] bg-white/80 px-5 py-3.5 text-sm text-[#2e1f3b] placeholder-[#2e1f3b]/40 outline-none focus:border-[#ec4899]" placeholder="Your name" />
          <input className="w-full rounded-full border border-[#e9d5ff] bg-white/80 px-5 py-3.5 text-sm text-[#2e1f3b] placeholder-[#2e1f3b]/40 outline-none focus:border-[#ec4899]" placeholder="Your email" />
          <textarea className="min-h-[140px] w-full rounded-[20px] border border-[#e9d5ff] bg-white/80 px-5 py-3.5 text-sm text-[#2e1f3b] placeholder-[#2e1f3b]/40 outline-none focus:border-[#ec4899]" placeholder="Your message" />
          <button className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 shadow-md shadow-[#f472b6]/20">Send message</button>
        </form>
      </section>

    </Layout>
  );
}

