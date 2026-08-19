import { useState } from 'react'

const FEEDBACK_EMAIL = 'tommy.m.meaney@gmail.com'

export default function FlagModal({ item, type, onClose }) {
  const [feedback, setFeedback] = useState('')

  function submit() {
    const label = type === 'card' ? item.front : item.question
    const subject = encodeURIComponent(`NCE Study Flag [${item.id}]: ${label.slice(0, 60)}`)
    const body = encodeURIComponent(
      `Item ID: ${item.id}\nType: ${type}\nContent: ${label}\n\nIssue:\n${feedback || '(no details provided)'}`
    )
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Flag this {type}</h3>
        <p className="modal-item-preview">{type === 'card' ? item.front : item.question}</p>
        <textarea
          className="modal-textarea"
          placeholder="What seems wrong? (optional)"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={4}
        />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={submit}>Send Report</button>
        </div>
      </div>
    </div>
  )
}
