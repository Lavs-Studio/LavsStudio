import Layout from '../components/Layout';
import Seo from '../components/Seo';
import AffiliateButton from '../components/AffiliateButton';
import ProductRecommendation from '../components/ProductRecommendation';
import ComparisonTable from '../components/ComparisonTable';
import ReviewCard from '../components/ReviewCard';
import ProsConsSection from '../components/ProsConsSection';
import { affiliateProducts, affiliateComparisonRows } from '../affiliate/data';

export default function AffiliateDisclosure() {
  return (
    <Layout>
      <Seo
        title="Affiliate Disclosure"
        description="Learn how Lavs Studio may earn commissions through Amazon affiliate links and recommendations."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-rose/20 bg-white p-8 shadow-soft sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose">Affiliate Disclosure</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Amazon Associates-ready content structure</h1>
          <p className="mt-5 max-w-3xl text-lg text-espresso/70">
            Lavs Studio is prepared for Amazon Associates integration. This page and the reusable components below are structured so affiliate links can be dropped in later without changing the layout.
          </p>
        </div>

        <div className="mt-8 rounded-[24px] border border-rose/20 bg-cream p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Disclosure Banner</h2>
          <p className="mt-3 text-sm text-espresso/70">
            This site may earn a commission when you click on certain Amazon links. This does not affect the price you pay and helps support the content and recommendations on Lavs Studio.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-semibold">Reusable Affiliate Button</h2>
            <div className="mt-4">
              <AffiliateButton label="Placeholder Amazon Button" />
            </div>
          </div>
          <div className="rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-semibold">Product Recommendation Component</h2>
            <div className="mt-4 space-y-4">
              {affiliateProducts.map((product) => (
                <ProductRecommendation key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Comparison Table</h2>
          <div className="mt-4">
            <ComparisonTable rows={affiliateComparisonRows} />
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Review Cards</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ReviewCard name="Mina" title="College girl shopper" review="Easy to style and very affordable." />
            <ReviewCard name="Riya" title="Beauty lover" review="A soft and elevated everyday pick." />
            <ReviewCard name="Nia" title="Gift buyer" review="Elegant and easy to gift without overthinking." />
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Pros and Cons</h2>
          <div className="mt-4">
            <ProsConsSection pros={['Affordable', 'Easy to style', 'Great for gifting']} cons={['Limited stock', 'Prices may shift', 'Some options need personal styling']} />
          </div>
        </div>
      </section>
    </Layout>
  );
}
