export default function AffiliateButton({ label = 'View on Amazon', onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition hover:bg-rose"
    >
      {label}
    </button>
  );
}
