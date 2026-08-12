import animals from './packs/animals.json'
import fantasy from './packs/fantasy.json'
import food from './packs/food.json'
import malaysia from './packs/malaysia.json'
import movies from './packs/movies.json'
import science from './packs/science.json'
import sports from './packs/sports.json'
import travel from './packs/travel.json'

export interface Pack {
  slug: string
  name: string
  sprite: string
  lists: string[][]
}

export const PACKS: Pack[] = [animals, food, travel, malaysia, movies, science, sports, fantasy]

/** words per list, for the size tag on theme cards */
export function packSizeLabel(pack: Pack): string {
  const sizes = pack.lists.map((l) => l.length)
  const min = Math.min(...sizes)
  const max = Math.max(...sizes)
  return min === max ? `${min} WORDS` : `${min}–${max} WORDS`
}
