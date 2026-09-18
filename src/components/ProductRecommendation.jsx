import AffiliateButton from './AffiliateButton';

export default function ProductRecommendation({ product }) {
  return (
    <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 backdrop-blur-xl shadow-xl shadow-purple-950/5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#ec4899]">{product.category}</p>
          <h3 className="mt-1 text-lg font-bold text-[#2e1f3b]">{product.title}</h3>
          <p className="mt-2 text-sm text-[#2e1f3b]/75">{product.description}</p>
        </div>
        {product.badge && (
          <span className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-3 py-1 text-xs font-bold text-white shadow">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#e9d5ff]/60">
        <span className="text-lg font-bold text-[#2e1f3b]">{product.price}</span>
        <AffiliateButton label="View on Amazon" />
      </div>
    </div>
  );
}


