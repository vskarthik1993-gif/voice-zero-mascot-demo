import React from 'react'

export function DockTab({ title, side, onClick }) {
  return (
    <button
      type="button"
      className={`voice-demo__dock-tab voice-demo__dock-tab--${side}`}
      onClick={onClick}
      title={`Expand ${title}`}>
      <span className="voice-demo__dock-tab-label">{title}</span>
    </button>
  )
}

export default function DockPanel({ title, subtitle, onMinimize, className = '', children, actions }) {
  return (
    <aside className={`voice-demo__dock-panel ${className}`.trim()}>
      <div className="voice-demo__dock-head">
        <div className="voice-demo__dock-head-copy">
          <h2 className="voice-demo__dock-title">{title}</h2>
          {subtitle ? <p className="voice-demo__dock-sub">{subtitle}</p> : null}
        </div>
        <div className="voice-demo__dock-head-actions">
          {actions}
          <button
            type="button"
            className="voice-demo__dock-minimize"
            onClick={onMinimize}
            aria-label={`Minimise ${title}`}
            title="Minimise">
            −
          </button>
        </div>
      </div>
      <div className="voice-demo__dock-body">{children}</div>
    </aside>
  )
}
