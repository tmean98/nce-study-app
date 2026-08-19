const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' }

const icons = {
  ch03: ( // Human Growth & Development — seedling
    <svg {...props}>
      <path d="M12 22v-9"/>
      <path d="M12 13c0 0-5-2-5-7a5 5 0 0 1 10 0c0 5-5 7-5 7z"/>
      <path d="M12 17c-2 0-4-1-5-3"/>
    </svg>
  ),
  ch04: ( // Social & Cultural Diversity — globe
    <svg {...props}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M3.6 9h16.8M3.6 15h16.8"/>
      <path d="M12 3c-2.5 3-3.5 6-3.5 9s1 6 3.5 9"/>
      <path d="M12 3c2.5 3 3.5 6 3.5 9s-1 6-3.5 9"/>
    </svg>
  ),
  ch05: ( // Helping Relationships — two hands
    <svg {...props}>
      <path d="M18 11V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3"/>
      <path d="M14 10V7a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3"/>
      <path d="M10 10.5V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6c0 3.3 2.7 6 6 6h.5a5.5 5.5 0 0 0 5.5-5.5V11a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2"/>
    </svg>
  ),
  ch06: ( // Group Work — three people
    <svg {...props}>
      <circle cx="9" cy="7" r="3"/>
      <circle cx="15" cy="7" r="3"/>
      <path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6"/>
    </svg>
  ),
  ch07: ( // Career Development — trending up
    <svg {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  ch08: ( // Assessment & Testing — clipboard with check
    <svg {...props}>
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  ch09: ( // Research & Program Evaluation — magnifying glass
    <svg {...props}>
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  ch10: ( // Professional Orientation & Ethics — scales
    <svg {...props}>
      <path d="M12 3v18"/>
      <path d="M8 21h8"/>
      <path d="M4 10h16"/>
      <path d="M4 10l-2 6h4l-2-6z"/>
      <path d="M20 10l-2 6h4l-2-6z"/>
    </svg>
  ),
  ch11: ( // Family Therapy — house
    <svg {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  ch12: ( // Neuro, CBT, DBT — brainwave
    <svg {...props}>
      <path d="M2 12c1.5-4 3-4 4.5 0s3 4 4.5 0 3-4 4.5 0 3 4 4.5 0"/>
      <path d="M9 6c0-2 1-3 3-3s3 1 3 3"/>
      <path d="M9 18c0 2 1 3 3 3s3-1 3-3"/>
    </svg>
  ),
}

export default function ChapterIcon({ chapterId }) {
  return (
    <span className="chapter-card-icon">
      {icons[chapterId] ?? null}
    </span>
  )
}
