export default function AmazonDisclosure({ className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-[#ec4899]/30 bg-[#fde8f3]/80 p-4 text-xs text-[#2e1f3b] backdrop-blur-md ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base font-bold text-[#ec4899]">ℹ</span>
        <div className="space-y-1">
          <p className="font-semibold text-[#ec4899]">
            Amazon Associates Program Disclosure
          </p>
          <p className="leading-relaxed text-[#2e1f3b]/80">
            As an Amazon Associate, Lavs Studio earns from qualifying purchases. Product prices, discounts, ratings, and availability are set by Amazon and are accurate at the time of listing. Prices on Amazon are subject to change.
          </p>
        </div>
      </div>
    </div>
  );
}


