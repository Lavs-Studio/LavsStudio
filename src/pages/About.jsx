import Layout from '../components/Layout';
import Seo from '../components/Seo';
import useRemoteData from '../hooks/useRemoteData';
import { fetchPublishedPage, defaultPageCopy } from '../lib/content';

const fetchAboutPage = () => fetchPublishedPage('about');

export default function About() {
  const [page] = useRemoteData(fetchAboutPage, defaultPageCopy.about);

  return (
    <Layout>
      <Seo
        title={page.title}
        description={page.description}
      />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#2e1f3b] sm:text-5xl">{page.title}</h1>
        <p className="mt-4 text-lg text-[#2e1f3b]/75 leading-relaxed">{page.description}</p>
        <div className="mt-8 rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-8 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
          <p className="text-[#2e1f3b]/85 leading-relaxed">{page.body}</p>
        </div>
      </section>

    </Layout>
  );
}

