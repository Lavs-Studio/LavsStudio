export default function ViewOnAmazonButton({
  url,
  label = 'View on Amazon',
  className = '',
}) {
  const targetUrl = url || '#';

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:opacity-95 hover:shadow-lg hover:shadow-[#f472b6]/25 focus:outline-none focus:ring-2 focus:ring-[#f472b6]/50 active:scale-95 ${className}`}
    >
      {/* Amazon Shopping Bag / Cart Icon */}
      <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
      <span>{label}</span>
      <span className="text-xs">↗</span>
    </a>
  );
}


