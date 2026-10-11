export interface SpeakerArt {
  me: string
  friend: string
}

/** Speech bubbles for a short exchange between the child (나) and a friend (친구). */
export function DialogueLines({
  lines,
  art,
}: {
  lines: { speaker: 'me' | 'friend'; text: string }[]
  art: SpeakerArt
}) {
  return (
    <ol className="garden-dialogue" aria-label="대화">
      {lines.map((line, index) => (
        <li key={index} className="garden-dialogue__line" data-speaker={line.speaker}>
          <img src={line.speaker === 'me' ? art.me : art.friend} alt="" />
          <p>
            <span className="sr-only">{line.speaker === 'me' ? '나: ' : '친구: '}</span>
            {line.text}
          </p>
        </li>
      ))}
    </ol>
  )
}
