export default function ReviewCard({ name, title, review }) {
  return (
    <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 backdrop-blur-xl shadow-xl shadow-purple-950/5 space-y-3">
      <p className="text-sm italic text-[#2e1f3b]/85 leading-relaxed">“{review}”</p>
      <div>
        <p className="font-bold text-[#2e1f3b]">{name}</p>
        <p className="text-xs text-[#2e1f3b]/60">{title}</p>
      </div>
    </div>
  );
}


