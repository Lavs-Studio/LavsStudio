export default function PinterestPinButton({ label = 'Save' }) {
  return (
    <button className="rounded-full bg-rose px-4 py-2 text-sm text-white transition hover:bg-espresso">
      {label}
    </button>
  );
}
