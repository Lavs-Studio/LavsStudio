import Layout from '../components/Layout';
import Seo from '../components/Seo';
import useRemoteData from '../hooks/useRemoteData';
import { fetchPublishedPage, defaultPageCopy } from '../lib/content';

const fetchPrivacyPage = () => fetchPublishedPage('privacy');

export default function PrivacyPolicy() {
  const [page] = useRemoteData(fetchPrivacyPage, defaultPageCopy.privacy);

  return (
    <Layout>
      <Seo
        title={page.title}
        description={page.description}
      />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#2e1f3b] sm:text-5xl">{page.title}</h1>
        <p className="mt-6 text-lg text-[#2e1f3b]/75 leading-relaxed">{page.description}</p>
      </section>

    </Layout>
  );
}

