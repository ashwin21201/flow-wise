import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, SkipForward, Layers } from 'lucide-react'
import { api } from '../api/client'
import useStore from '../store/useStore'
import ProgressBar from './shared/ProgressBar'
import LoadingSpinner from './shared/LoadingSpinner'

const BLOCK_LABELS = [
  'App Identity',
  'Architecture',
  'Network',
  'Scale',
  'Availability',
  'Security',
  'Budget',
]

export default function GuidedModeScreen() {
  const {
    userInput, scopeResult,
    currentBlock, setCurrentBlock,
    guidedQuestions, setGuidedQuestions,
    guidedAnswers, setBlockAnswers,
    setSolution, setScreen, setLoading, setError, loading,
  } = useStore()

  const [blockData, setBlockData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [fetchingBlock, setFetchingBlock] = useState(false)

  useEffect(() => {
    const cached = guidedQuestions[currentBlock]
    if (cached) {
      setBlockData(cached)
      setAnswers(guidedAnswers[`block_${currentBlock}`] || {})
    } else {
      loadBlock(currentBlock)
    }
  }, [currentBlock])

  const loadBlock = async (block) => {
    setFetchingBlock(true)
    setError(null)
    try {
      const flat = {}
      Object.values(guidedAnswers).forEach((ba) => ba && Object.assign(flat, ba))
      const data = await api.guidedQuestions(block, userInput, scopeResult, flat)
      setGuidedQuestions(block, data)
      setBlockData(data)
      setAnswers(guidedAnswers[`block_${block}`] || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setFetchingBlock(false)
    }
  }

  const setAnswer = (qId, value) => setAnswers((prev) => ({ ...prev, [qId]: value }))

  const handleNext = () => {
    setBlockAnswers(currentBlock, answers)
    if (currentBlock < 7) {
      setCurrentBlock(currentBlock + 1)
    } else {
      handleGenerate()
    }
  }

  const handleSkip = () => {
    setBlockAnswers(currentBlock, answers)
    if (currentBlock < 7) {
      setCurrentBlock(currentBlock + 1)
    } else {
      handleGenerate()
    }
  }

  const handleGenerate = async () => {
    const allAnswers = { ...guidedAnswers, [`block_${currentBlock}`]: answers }
    setBlockAnswers(currentBlock, answers)
    setLoading(true)
    setError(null)
    try {
      const solution = await api.guidedComplete(userInput, scopeResult, allAnswers)
      setSolution(solution)
      setScreen('solution')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center pt-16">
        <LoadingSpinner message="Building your tailored architecture…" size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => currentBlock > 1 ? setCurrentBlock(currentBlock - 1) : setScreen('mode-selection')}
          className="flex items-center gap-1 text-muted hover:text-slate-300 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentBlock > 1 ? `Block ${currentBlock - 1}` : 'Back'}
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-accent">
          <Layers className="w-4 h-4" />
          <span className="text-sm font-medium">Guided Mode</span>
        </div>
      </div>

      <ProgressBar current={currentBlock} total={7} labels={BLOCK_LABELS} />

      {fetchingBlock ? (
        <LoadingSpinner message={`Loading Block ${currentBlock} questions…`} />
      ) : blockData ? (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              Block {currentBlock} of 7
            </div>
            <h2 className="text-xl font-bold text-slate-100">{blockData.title}</h2>
            <p className="text-subtle text-sm mt-1">{blockData.description}</p>
          </div>

          <div className="space-y-5">
            {blockData.questions?.map((q) => (
              <QuestionField key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-subtle hover:text-slate-300 hover:border-border-light text-sm transition-all"
            >
              <SkipForward className="w-4 h-4" />
              Skip Block
            </button>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all"
            >
              {currentBlock === 7 ? 'Generate Architecture' : `Next: ${BLOCK_LABELS[currentBlock]}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function QuestionField({ q, value, onChange }) {
  return (
    <div className="space-y-2 p-4 rounded-xl bg-card border border-border">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-200">{q.text}</label>
        <p className="text-xs text-muted flex items-start gap-1">
          <span className="text-primary font-semibold mt-0.5">Why:</span>
          {q.why}
        </p>
      </div>

      {q.type === 'text' || q.type === 'number' ? (
        <input
          type={q.type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
        />
      ) : q.type === 'select' ? (
        <div className="flex flex-wrap gap-2">
          {q.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                value === opt
                  ? 'bg-primary/20 border-primary/60 text-primary-light font-medium'
                  : 'bg-surface border-border text-subtle hover:border-border-light hover:text-slate-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : q.type === 'multiselect' ? (
        <div className="flex flex-wrap gap-2">
          {q.options?.map((opt) => {
            const selected = Array.isArray(value) ? value.includes(opt) : false
            return (
              <button
                key={opt}
                onClick={() => {
                  const arr = Array.isArray(value) ? [...value] : []
                  onChange(selected ? arr.filter((x) => x !== opt) : [...arr, opt])
                }}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  selected
                    ? 'bg-primary/20 border-primary/60 text-primary-light font-medium'
                    : 'bg-surface border-border text-subtle hover:border-border-light hover:text-slate-300'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      ) : q.type === 'boolean' ? (
        <div className="flex gap-2">
          {['Yes', 'No'].map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt === 'Yes')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                (opt === 'Yes' ? value === true : value === false)
                  ? 'bg-primary/20 border-primary/60 text-primary-light'
                  : 'bg-surface border-border text-subtle hover:border-border-light hover:text-slate-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
