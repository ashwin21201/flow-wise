import { useEffect, useRef } from 'react'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'

cytoscape.use(dagre)

const NODE_STYLES = {
  external: { bg: '#475569', border: '#64748b' },
  networking: { bg: '#d97706', border: '#f59e0b' },
  compute: { bg: '#4f46e5', border: '#6366f1' },
  database: { bg: '#059669', border: '#10b981' },
  cache: { bg: '#7c3aed', border: '#8b5cf6' },
  queue: { bg: '#db2777', border: '#ec4899' },
  storage: { bg: '#0891b2', border: '#06b6d4' },
  security: { bg: '#dc2626', border: '#ef4444' },
  subnet: { bg: 'rgba(30,35,60,0.6)', border: '#252a45' },
  vpc: { bg: 'rgba(20,23,40,0.4)', border: '#2e3558' },
  default: { bg: '#334155', border: '#475569' },
}

function buildStylesheet() {
  const nodeStyles = Object.entries(NODE_STYLES).map(([type, colors]) => ({
    selector: `node[type="${type}"]`,
    style: {
      'background-color': colors.bg,
      'border-color': colors.border,
    },
  }))

  return [
    {
      selector: 'node',
      style: {
        'background-color': NODE_STYLES.default.bg,
        'border-color': NODE_STYLES.default.border,
        'border-width': 2,
        label: 'data(label)',
        color: '#e2e8f0',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 6,
        'font-size': '11px',
        'font-family': 'Inter, system-ui, sans-serif',
        'text-wrap': 'wrap',
        'text-max-width': '80px',
        width: 52,
        height: 52,
        shape: 'round-rectangle',
        'text-background-color': '#0d0f1a',
        'text-background-opacity': 0.7,
        'text-background-padding': '2px',
        'text-background-shape': 'round-rectangle',
      },
    },
    ...nodeStyles,
    {
      selector: 'node[type="subnet"], node[type="vpc"]',
      style: {
        shape: 'round-rectangle',
        'text-valign': 'top',
        'text-halign': 'center',
        'text-margin-y': -8,
        'font-size': '10px',
        'font-weight': '600',
        color: '#64748b',
        'border-style': 'dashed',
        'border-width': 1.5,
        padding: '20px',
      },
    },
    {
      selector: 'node[type="external"]',
      style: {
        shape: 'ellipse',
        'background-color': '#334155',
        'border-color': '#475569',
        width: 46,
        height: 46,
      },
    },
    {
      selector: 'edge',
      style: {
        width: 1.5,
        'line-color': '#2e3558',
        'target-arrow-color': '#3d4468',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': '9px',
        color: '#64748b',
        'text-background-color': '#0d0f1a',
        'text-background-opacity': 0.8,
        'text-background-padding': '2px',
      },
    },
    {
      selector: 'edge:hover',
      style: { 'line-color': '#6366f1', 'target-arrow-color': '#6366f1', width: 2 },
    },
    {
      selector: 'node:selected',
      style: { 'border-color': '#818cf8', 'border-width': 3 },
    },
  ]
}

export default function CytoscapeGraph({ elements }) {
  const containerRef = useRef(null)
  const cyRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (!elements?.nodes?.length) return

    const cyElements = [
      ...elements.nodes.map((n) => ({ data: n.data, classes: n.classes || '' })),
      ...elements.edges.map((e) => ({ data: e.data, classes: e.classes || '' })),
    ]

    if (cyRef.current) {
      cyRef.current.destroy()
    }

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: cyElements,
      style: buildStylesheet(),
      layout: {
        name: 'dagre',
        rankDir: 'TB',
        rankSep: 80,
        nodeSep: 40,
        edgeSep: 20,
        padding: 30,
        animate: true,
        animationDuration: 500,
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    })

    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target
      if (!['vpc', 'subnet'].includes(node.data('type'))) {
        node.flashClass('selected', 600)
      }
    })

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [elements])

  const handleFit = () => cyRef.current?.fit(undefined, 30)
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.3)
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() / 1.3)

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        {[
          { label: '⊞', title: 'Fit', action: handleFit },
          { label: '+', title: 'Zoom In', action: handleZoomIn },
          { label: '−', title: 'Zoom Out', action: handleZoomOut },
        ].map(({ label, title, action }) => (
          <button
            key={title}
            onClick={action}
            title={title}
            className="w-8 h-8 rounded-lg bg-card/80 border border-border text-subtle hover:text-slate-200 text-sm transition-colors backdrop-blur-sm flex items-center justify-center"
          >
            {label}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="cy-container" />
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
        {Object.entries({
          Networking: '#f59e0b',
          Compute: '#6366f1',
          Database: '#10b981',
          Cache: '#8b5cf6',
          Queue: '#ec4899',
          Storage: '#06b6d4',
        }).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] text-muted">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
