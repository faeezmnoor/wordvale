import { useMemo, useState } from 'react'
import { MAX_WORDS, MIN_WORDS, precheck, type GenResult } from '../../engine'
import { useApp } from '../../state/store'
import { useGenerate } from '../useGenerate'
import { TopBar } from '../components/TopBar'
import {
  CameraSprite,
  GiftSprite,
  HourglassSprite,
  MicSprite,
  PencilSprite,
  SproutSweatSprite,
} from '../components/Sprites'

type Tab = 'words' | 'surprise'

const REASON_LABEL: Record<string, string> = {
  tooShort: 'too short',
  tooLong: 'too long',
  charset: 'A–Z only, no spaces',
  duplicate: 'duplicate',
}

export default function Create() {
  const { createText, setCreateText, setDraft, go } = useApp()
  const [tab, setTab] = useState<Tab>('words')
  const [failure, setFailure] = useState<GenResult | null>(null)
  const [seed] = useState(() => (Date.now() % 100000) + 1)

  const pre = useMemo(() => precheck(createText.split(/[\n,]+/)), [createText])
  const canGenerate = pre.countError === null && pre.valid.length >= MIN_WORDS

  const { request, pending } = useGenerate((result) => {
    if (result.status === 'complete') {
      setDraft({ words: pre.valid, result, title: pre.valid.slice(0, 2).join(' · ').toLowerCase() }, pre)
      setFailure(null)
      go('review')
    } else {
      setFailure(result)
    }
  })

  const generate = () => {
    setFailure(null)
    request(pre.valid, seed + pre.valid.join('').length)
  }

  const acceptPartial = () => {
    if (!failure) return
    const kept = pre.valid.filter((w) => !failure.unplaced.includes(w))
    setDraft({ words: kept, result: failure, title: kept.slice(0, 2).join(' · ').toLowerCase() }, pre)
    go('review')
  }

  return (
    <div className="page">
      <TopBar title="New puzzle" back />

      <div className="tabs">
        <button className={`tab ${tab === 'words' ? 'active' : ''}`} onClick={() => setTab('words')}>
          <PencilSprite /> My words
        </button>
        <button className={`tab ${tab === 'surprise' ? 'active' : ''}`} onClick={() => setTab('surprise')}>
          <GiftSprite /> Surprise me
        </button>
        <button className="tab soon" disabled title="Screenshots — coming in a later update">
          <CameraSprite /> <span className="soonlabel">soon</span>
        </button>
        <button className="tab soon" disabled title="Voice — coming in a later update">
          <MicSprite /> <span className="soonlabel">soon</span>
        </button>
      </div>

      {tab === 'words' && (
        <section className="panel" style={{ padding: 20 }}>
          <textarea
            className="wordinput"
            placeholder={'One word per line (or commas)…\nharvest\napple\nvine'}
            value={createText}
            onChange={(e) => {
              setCreateText(e.target.value)
              setFailure(null)
            }}
            rows={7}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '12px 0', minHeight: 8 }}>
            {pre.valid.map((w) => (
              <span key={w} className="chip">
                {w}
              </span>
            ))}
            {pre.isolates.map((w) => (
              <span key={w} className="chip warn">
                {w} <i className="why">no shared letters</i>
              </span>
            ))}
            {pre.rejected.map((r, i) => (
              <span key={`${r.input}-${i}`} className="chip bad">
                {r.normalized || r.input} <i className="why">{REASON_LABEL[r.reason]}</i>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-grid)', fontSize: '.8rem', color: 'var(--ink-soft)' }}>
              WORDS: {pre.valid.length}/{MAX_WORDS}
              {pre.countError === 'tooFew' && ` — need at least ${MIN_WORDS} that share letters`}
              {pre.countError === 'tooMany' && ` — that's too many`}
            </span>
            <button className="btn" disabled={!canGenerate || pending} onClick={generate}>
              {pending ? 'Weaving…' : 'Generate ➜'}
            </button>
          </div>
        </section>
      )}

      {tab === 'surprise' && (
        <section className="panel" style={{ padding: 20 }}>
          <p style={{ color: 'var(--ink-soft)', margin: 0 }}>
            Themed packs arrive with the next slice — for now, bring your own words!
          </p>
        </section>
      )}

      {pending && (
        <section className="panel" style={{ padding: 20, marginTop: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="hourglass">
            <HourglassSprite />
          </span>
          <p style={{ margin: 0, color: 'var(--ink-soft)' }}>Weaving your words together…</p>
        </section>
      )}

      {failure && !pending && (
        <section className="panel failure" style={{ padding: 20, marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <SproutSweatSprite />
            <div style={{ flex: 1, minWidth: 240 }}>
              {failure.status === 'partial' ? (
                <>
                  <h2 style={{ fontSize: '1.2rem' }}>
                    We fit {failure.placements.length} of {pre.valid.length} words
                  </h2>
                  <p style={{ color: 'var(--ink-soft)', margin: '6px 0 10px' }}>
                    These don't share enough letters with the rest:
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {failure.unplaced.map((w) => (
                      <span key={w} className="chip bad">
                        {w}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn" onClick={acceptPartial}>
                      Drop &amp; play
                    </button>
                    <button className="btn secondary" onClick={generate}>
                      Try again
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.2rem' }}>These words really don't want to hold hands</h2>
                  <p style={{ color: 'var(--ink-soft)', margin: '6px 0 10px' }}>
                    Add a few longer words that share letters, then try again.
                  </p>
                  <button className="btn secondary" onClick={generate}>
                    Try again
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
