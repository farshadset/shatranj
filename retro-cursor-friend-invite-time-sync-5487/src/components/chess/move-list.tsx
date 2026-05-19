'use client'

import { MoveHistoryEntry } from '@/lib/chess/types'

const PIECE_IMAGES: Record<string, string> = {
  wp: '/chess/pieces/cburnett/wP.svg',
  wn: '/chess/pieces/cburnett/wN.svg',
  wb: '/chess/pieces/cburnett/wB.svg',
  wr: '/chess/pieces/cburnett/wR.svg',
  wq: '/chess/pieces/cburnett/wQ.svg',
  wk: '/chess/pieces/cburnett/wK.svg',
  bp: '/chess/pieces/cburnett/bP.svg',
  bn: '/chess/pieces/cburnett/bN.svg',
  bb: '/chess/pieces/cburnett/bB.svg',
  br: '/chess/pieces/cburnett/bR.svg',
  bq: '/chess/pieces/cburnett/bQ.svg',
  bk: '/chess/pieces/cburnett/bK.svg',
}

function formatTimer(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(minutes)}:${pad(seconds)}`
}

interface MoveListProps {
  moves: MoveHistoryEntry[]
}

export function MoveList({ moves }: MoveListProps) {
  if (moves.length === 0) {
    return (
      <div className="w-full rounded-xl border border-[#3a3734] bg-[#262421] p-3">
        <p className="text-center text-sm text-[#9f9a93]">هنوز حرکتی انجام نشده.</p>
      </div>
    )
  }

  // Pair up moves: even indices are white, odd indices are black
  const pairs: { number: number; white: MoveHistoryEntry; black?: MoveHistoryEntry }[] = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    })
  }

  return (
    <div className="w-full rounded-xl border border-[#3a3734] bg-[#262421]">
      <div className="max-h-60 overflow-y-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#3a3734] text-[#9f9a93]">
              <th className="w-8 px-2 py-2 text-center font-medium">#</th>
              <th className="px-2 py-2 text-right font-medium">سفید</th>
              <th className="px-2 py-2 text-right font-medium">سیاه</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={pair.number} className="border-b border-[#2a2826] last:border-b-0 hover:bg-[#302c28]">
                <td className="px-2 py-2 text-center text-[#6b655c]">{pair.number}.</td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={PIECE_IMAGES[pair.white.piece]}
                      alt=""
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0"
                      style={
                        pair.white.piece.startsWith('b')
                          ? {
                              filter:
                                'drop-shadow(-0.5px -0.5px 0 white) drop-shadow(0.5px -0.5px 0 white) drop-shadow(-0.5px 0.5px 0 white) drop-shadow(0.5px 0.5px 0 white)',
                            }
                          : undefined
                      }
                    />
                    <span className="font-semibold text-[#f3efe8]">{pair.white.to}</span>
                    <span className="font-mono text-[10px] text-[#6b655c]">
                      {formatTimer(pair.white.whiteTimeMs)}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2">
                  {pair.black ? (
                    <div className="flex items-center gap-1.5">
                      <img
                        src={PIECE_IMAGES[pair.black.piece]}
                        alt=""
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0"
                        style={
                          pair.black.piece.startsWith('b')
                            ? {
                                filter:
                                  'drop-shadow(-0.5px -0.5px 0 white) drop-shadow(0.5px -0.5px 0 white) drop-shadow(-0.5px 0.5px 0 white) drop-shadow(0.5px 0.5px 0 white)',
                              }
                            : undefined
                        }
                      />
                      <span className="font-semibold text-[#f3efe8]">{pair.black.to}</span>
                      <span className="font-mono text-[10px] text-[#6b655c]">
                        {formatTimer(pair.black.blackTimeMs)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#4a4640]">...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
