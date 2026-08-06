export default function ComparisonTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-rose/20 bg-white shadow-soft">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-cream text-espresso">
          <tr>
            <th className="px-4 py-3">Feature</th>
            <th className="px-4 py-3">Option A</th>
            <th className="px-4 py-3">Option B</th>
            <th className="px-4 py-3">Option C</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-t border-rose/10">
              <td className="px-4 py-3 font-semibold">{row.feature}</td>
              <td className="px-4 py-3">{row.itemA}</td>
              <td className="px-4 py-3">{row.itemB}</td>
              <td className="px-4 py-3">{row.itemC}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
