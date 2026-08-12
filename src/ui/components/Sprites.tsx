// Hand-built 8×8 pixel SVG sprites — emoji are banned in product UI (design spec §2).

function Px({ rects, size = 16, view = 8 }: { rects: [number, number, number, number, string][]; size?: number; view?: number }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${view} ${view}`} style={{ imageRendering: 'pixelated' }} aria-hidden>
      {rects.map(([x, y, w, h, f], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={f} />
      ))}
    </svg>
  )
}

export function CoinSprite({ size = 16 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [2, 0, 4, 1, '#e8b33c'],
        [1, 1, 6, 1, '#e8b33c'],
        [0, 2, 8, 4, '#e8b33c'],
        [1, 6, 6, 1, '#c9922a'],
        [2, 7, 4, 1, '#c9922a'],
        [2, 2, 1, 3, '#faf1dc'],
        [5, 3, 1, 2, '#c9922a'],
      ]}
    />
  )
}

export function ChevronSprite({ size = 14 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [4, 0, 2, 2, '#faf1dc'],
        [2, 2, 2, 2, '#faf1dc'],
        [0, 3, 2, 2, '#faf1dc'],
        [2, 4, 2, 2, '#faf1dc'],
        [4, 6, 2, 2, '#faf1dc'],
      ]}
    />
  )
}

export function PencilSprite({ size = 16 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [5, 0, 2, 2, '#c24b3f'],
        [4, 2, 2, 2, '#e8b33c'],
        [3, 3, 2, 2, '#e8b33c'],
        [2, 4, 2, 2, '#e8b33c'],
        [1, 6, 2, 1, '#6b5744'],
        [1, 5, 1, 2, '#6b5744'],
      ]}
    />
  )
}

export function GiftSprite({ size = 16 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [1, 3, 6, 4, '#c24b3f'],
        [3, 3, 2, 4, '#e8b33c'],
        [1, 2, 6, 1, '#8f3428'],
        [2, 0, 1, 2, '#3f7a2e'],
        [5, 0, 1, 2, '#3f7a2e'],
        [3, 1, 2, 2, '#e8b33c'],
      ]}
    />
  )
}

export function CameraSprite({ size = 16 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [1, 2, 6, 4, '#6b5744'],
        [3, 3, 2, 2, '#5a9bd8'],
        [2, 1, 2, 1, '#6b5744'],
        [6, 3, 1, 1, '#faf1dc'],
      ]}
    />
  )
}

export function MicSprite({ size = 16 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [3, 0, 2, 4, '#6b5744'],
        [2, 1, 1, 2, '#6b5744'],
        [5, 1, 1, 2, '#6b5744'],
        [3, 5, 2, 1, '#8a5a38'],
        [2, 6, 4, 1, '#8a5a38'],
      ]}
    />
  )
}

/** Sweating sprout — failure states. */
export function SproutSweatSprite({ size = 64 }: { size?: number }) {
  return (
    <Px
      size={size}
      view={16}
      rects={[
        [6, 10, 4, 4, '#8a5a38'],
        [5, 13, 6, 2, '#5b3a24'],
        [7, 7, 2, 3, '#3f7a2e'],
        [4, 5, 3, 3, '#5fa344'],
        [9, 5, 3, 3, '#5fa344'],
        [6, 3, 4, 3, '#5fa344'],
        [7, 11, 1, 1, '#3b2a1e'],
        [9, 11, 1, 1, '#3b2a1e'],
        [12, 6, 1, 2, '#5a9bd8'],
        [13, 8, 1, 1, '#5a9bd8'],
      ]}
    />
  )
}

/** Happy sprout — hero / success. */
export function SproutSprite({ size = 64 }: { size?: number }) {
  return (
    <Px
      size={size}
      view={16}
      rects={[
        [6, 10, 4, 4, '#8a5a38'],
        [5, 13, 6, 2, '#5b3a24'],
        [7, 7, 2, 3, '#3f7a2e'],
        [4, 5, 3, 3, '#5fa344'],
        [9, 5, 3, 3, '#5fa344'],
        [6, 3, 4, 3, '#5fa344'],
        [7, 11, 1, 1, '#3b2a1e'],
        [9, 11, 1, 1, '#3b2a1e'],
      ]}
    />
  )
}

/** Hourglass — generation pending (stepped flip via CSS elsewhere). */
export function HourglassSprite({ size = 32 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [1, 0, 6, 1, '#5b3a24'],
        [2, 1, 4, 2, '#e8b33c'],
        [3, 3, 2, 2, '#c9922a'],
        [2, 5, 4, 2, '#e8b33c'],
        [1, 7, 6, 1, '#5b3a24'],
      ]}
    />
  )
}

export function ArrowSprite({ size = 14 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [0, 3, 6, 2, '#faf1dc'],
        [4, 1, 2, 2, '#faf1dc'],
        [6, 2, 2, 4, '#faf1dc'],
        [4, 5, 2, 2, '#faf1dc'],
      ]}
    />
  )
}

export function PlaySprite({ size = 16 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [2, 1, 2, 6, '#faf1dc'],
        [4, 2, 2, 4, '#faf1dc'],
        [6, 3, 1, 2, '#faf1dc'],
      ]}
    />
  )
}

export function RefreshSprite({ size = 16 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [2, 1, 4, 1, '#faf1dc'],
        [1, 2, 1, 4, '#faf1dc'],
        [6, 2, 1, 4, '#faf1dc'],
        [2, 6, 4, 1, '#faf1dc'],
        [5, 0, 1, 3, '#faf1dc'],
        [6, 0, 2, 1, '#faf1dc'],
      ]}
    />
  )
}

export function CheckSprite({ size = 16 }: { size?: number }) {
  return (
    <Px
      size={size}
      rects={[
        [1, 4, 2, 2, '#faf1dc'],
        [3, 5, 2, 2, '#faf1dc'],
        [5, 2, 2, 3, '#faf1dc'],
        [6, 1, 2, 2, '#faf1dc'],
      ]}
    />
  )
}

export function SoundSprite({ on, size = 18 }: { on: boolean; size?: number }) {
  const speaker: [number, number, number, number, string][] = [
    [1, 3, 2, 2, '#faf1dc'],
    [3, 2, 2, 4, '#faf1dc'],
  ]
  const waves: [number, number, number, number, string][] = on
    ? [
        [6, 3, 1, 2, '#faf1dc'],
        [7, 2, 1, 4, '#faf1dc'],
      ]
    : [
        [6, 2, 1, 1, '#c24b3f'],
        [6, 5, 1, 1, '#c24b3f'],
        [5, 3, 1, 1, '#c24b3f'],
        [7, 3, 1, 1, '#c24b3f'],
        [5, 4, 1, 1, '#c24b3f'],
        [7, 4, 1, 1, '#c24b3f'],
      ]
  return <Px size={size} rects={[...speaker, ...waves]} />
}
