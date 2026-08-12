// 8×8 theme sprites for the pack picker (emoji banned in product UI).

const ART: Record<string, [number, number, number, number, string][]> = {
  fox: [
    [1, 1, 1, 2, '#c96a2a'], [6, 1, 1, 2, '#c96a2a'], [1, 3, 6, 3, '#c96a2a'],
    [2, 6, 4, 1, '#faf1dc'], [2, 4, 1, 1, '#3b2a1e'], [5, 4, 1, 1, '#3b2a1e'],
    [3, 5, 2, 2, '#faf1dc'],
  ],
  bowl: [
    [1, 3, 6, 3, '#8a5a38'], [2, 6, 4, 1, '#5b3a24'], [2, 2, 4, 1, '#e8b33c'],
    [1, 1, 2, 1, '#e8b33c'], [5, 1, 2, 1, '#e8b33c'],
  ],
  plane: [
    [3, 1, 2, 6, '#faf1dc'], [1, 3, 6, 2, '#5a9bd8'], [3, 0, 2, 1, '#c24b3f'],
    [2, 7, 4, 1, '#faf1dc'],
  ],
  palm: [
    [3, 4, 2, 3, '#8a5a38'], [1, 1, 2, 2, '#5fa344'], [5, 1, 2, 2, '#5fa344'],
    [3, 0, 2, 2, '#3f7a2e'], [1, 7, 6, 1, '#e8b33c'],
  ],
  clapper: [
    [1, 2, 6, 4, '#3b2a1e'], [1, 1, 6, 1, '#faf1dc'], [2, 2, 1, 1, '#faf1dc'],
    [4, 2, 1, 1, '#faf1dc'], [6, 2, 1, 1, '#faf1dc'],
  ],
  flask: [
    [3, 0, 2, 3, '#b9c7cf'], [2, 3, 4, 3, '#5fa344'], [1, 6, 6, 1, '#3f7a2e'],
    [2, 1, 1, 1, '#faf1dc'],
  ],
  ball: [
    [2, 0, 4, 1, '#faf1dc'], [1, 1, 6, 6, '#faf1dc'], [2, 7, 4, 1, '#faf1dc'],
    [3, 3, 2, 2, '#3b2a1e'], [1, 1, 1, 1, '#3b2a1e'], [6, 6, 1, 1, '#3b2a1e'],
    [6, 1, 1, 1, '#3b2a1e'], [1, 6, 1, 1, '#3b2a1e'],
  ],
  dragon: [
    [1, 2, 5, 4, '#3f7a2e'], [6, 3, 2, 2, '#3f7a2e'], [2, 3, 1, 1, '#e8b33c'],
    [1, 0, 1, 2, '#c24b3f'], [3, 0, 1, 2, '#c24b3f'], [2, 6, 1, 2, '#3f7a2e'],
    [4, 6, 1, 2, '#3f7a2e'],
  ],
}

export function ThemeSprite({ name, size = 32 }: { name: string; size?: number }) {
  const rects = ART[name] ?? ART.fox
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }} aria-hidden>
      {rects.map(([x, y, w, h, f], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={f} />
      ))}
    </svg>
  )
}
