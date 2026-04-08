const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'active', label: 'Actives' },
  { key: 'done', label: 'Complétées' },
]

export default function TaskFilters({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-3 py-1 rounded border text-sm ${
            value === f.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-100'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
