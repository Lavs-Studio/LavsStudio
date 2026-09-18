export default function ComparisonTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 backdrop-blur-xl shadow-xl shadow-purple-950/5">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#f3e8ff]/80 text-[#2e1f3b]">
          <tr>
            <th className="px-5 py-4 font-semibold">Feature</th>
            <th className="px-5 py-4 font-semibold">Option A</th>
            <th className="px-5 py-4 font-semibold">Option B</th>
            <th className="px-5 py-4 font-semibold">Option C</th>
          </tr>
        </thead>
        <tbody className="text-[#2e1f3b]/80">
          {rows.map((row) => (
            <tr key={row.feature} className="border-t border-[#e9d5ff]/60">
              <td className="px-5 py-4 font-semibold text-[#2e1f3b]">{row.feature}</td>
              <td className="px-5 py-4">{row.itemA}</td>
              <td className="px-5 py-4">{row.itemB}</td>
              <td className="px-5 py-4">{row.itemC}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


