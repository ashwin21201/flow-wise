export default function ProgressBar({ current, total, labels }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-muted">
          Block {current} of {total}
          {labels?.[current - 1] ? ` — ${labels[current - 1]}` : ''}
        </span>
        <span className="text-xs font-mono text-primary">{pct}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {labels && (
        <div className="flex mt-3 gap-1">
          {labels.map((label, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                i < current ? 'bg-primary' : i === current - 1 ? 'bg-primary' : 'bg-border'
              }`}
              title={label}
            />
          ))}
        </div>
      )}
    </div>
  )
}
