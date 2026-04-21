export default function LoadingSpinner({ message = 'Processing...', size = 'md' }) {
  const sz = size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-5 h-5' : 'w-8 h-8'
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className={`${sz} relative`}>
        <div className={`${sz} rounded-full border-2 border-border`} />
        <div
          className={`${sz} rounded-full border-2 border-transparent border-t-primary absolute inset-0 animate-spin`}
        />
      </div>
      {message && <p className="text-sm text-muted animate-pulse">{message}</p>}
    </div>
  )
}
