import { X, AlertCircle } from 'lucide-react'

export default function ErrorBanner({ message, onClose }) {
  return (
    <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-950/60 border border-red-800/50 text-red-300">
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="shrink-0 hover:text-red-100 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
