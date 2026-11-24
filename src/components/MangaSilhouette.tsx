import type { GambleMotif } from '../types/gamble';

interface MangaSilhouetteProps {
  motif: GambleMotif;
  className?: string;
}

/**
 * High-contrast monochrome manga architectural & symbolic backdrops
 * inspired by Usogui full-page verdict spreads.
 */
export function MangaSilhouette({ motif, className = '' }: MangaSilhouetteProps) {
  switch (motif) {
    case 'building':
      return (
        <svg
          viewBox="0 0 420 460"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          {/* Looming perspective abandoned skyscraper silhouette matching Usogui plate */}
          <polygon points="62,92 358,76 410,460 12,460" fill="#121214" />
          <polygon
            points="62,92 358,76 352,96 68,110"
            fill="#232225"
            stroke="#3a393d"
            strokeWidth="1.5"
          />
          {/* Window grid rows receding upward */}
          {[0, 1, 2, 3, 4, 5, 6].map((row) => {
            const y = 128 + row * 44;
            const inset = 68 - row * 6;
            const width = 284 + row * 12;
            return (
              <g key={row} opacity={0.34 - row * 0.025}>
                {[0, 1, 2, 3, 4, 5].map((col) => {
                  const cellW = width / 6;
                  const x = inset + col * cellW + 5;
                  return (
                    <rect
                      key={col}
                      x={x}
                      y={y}
                      width={cellW - 12}
                      height={22}
                      fill={row === 1 && col === 3 ? '#d6d1c6' : '#2d2c30'}
                      stroke="#4b494e"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>
            );
          })}
          {/* Broken rooftop antenna */}
          <line x1="120" y1="88" x2="112" y2="26" stroke="#18181b" strokeWidth="4" />
          <line x1="296" y1="78" x2="306" y2="34" stroke="#18181b" strokeWidth="3" />
        </svg>
      );

    case 'hangman':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Gallows frame */}
          <rect x="46" y="42" width="24" height="418" fill="#121214" />
          <rect x="46" y="42" width="248" height="22" fill="#121214" />
          <polygon points="70,130 148,64 170,64 70,152" fill="#18181b" />
          {/* Rope & noose */}
          <line x1="252" y1="64" x2="252" y2="210" stroke="#e4e0d5" strokeWidth="4" strokeDasharray="6 3" />
          <ellipse cx="252" cy="252" rx="34" ry="46" stroke="#d8d3c7" strokeWidth="5" fill="#0f0f11" />
          {/* Scattered tilted playing cards */}
          <g transform="rotate(-14 148 340)">
            <rect x="108" y="276" width="84" height="122" rx="4" fill="#161618" stroke="#c8c3b8" strokeWidth="2" />
            <text x="122" y="308" fill="#d8d3c7" fontSize="22" fontWeight="900">J</text>
            <path d="M150 326 L166 346 L150 366 L134 346 Z" fill="#c8c3b8" opacity="0.55" />
          </g>
          <g transform="rotate(11 312 355)">
            <rect x="272" y="294" width="84" height="122" rx="4" fill="#161618" stroke="#9e998f" strokeWidth="2" />
            <text x="284" y="324" fill="#9e998f" fontSize="18" fontWeight="900">JOKER</text>
          </g>
        </svg>
      );

    case 'maze':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Isometric 6x6 Labyrinth Grid */}
          <rect x="42" y="88" width="336" height="336" fill="#111113" stroke="#525055" strokeWidth="3" />
          {[1, 2, 3, 4, 5].map((i) => (
            <g key={i} stroke="#2c2b2f" strokeWidth="1.5">
              <line x1={42 + i * 56} y1="88" x2={42 + i * 56} y2="424" />
              <line x1="42" y1={88 + i * 56} x2="378" y2={88 + i * 56} />
            </g>
          ))}
          {/* Thick hidden labyrinth walls */}
          <g stroke="#d6d1c6" strokeWidth="6" strokeLinecap="square" opacity="0.42">
            <line x1="98" y1="88" x2="98" y2="256" />
            <line x1="98" y1="200" x2="266" y2="200" />
            <line x1="210" y1="144" x2="322" y2="144" />
            <line x1="266" y1="200" x2="266" y2="368" />
            <line x1="154" y1="256" x2="154" y2="424" />
            <line x1="154" y1="312" x2="322" y2="312" />
          </g>
          <text x="192" y="286" fill="#f4f1ea" opacity="0.16" fontSize="136" fontWeight="900" fontFamily="serif">
            0
          </text>
        </svg>
      );

    case 'tower':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Towering broadcast spire */}
          <polygon points="210,18 232,120 264,280 318,460 102,460 156,280 188,120" fill="#121215" stroke="#3c3a40" strokeWidth="2" />
          <rect x="148" y="168" width="124" height="36" fill="#1b1a1e" stroke="#6c6970" strokeWidth="2" />
          <rect x="122" y="276" width="176" height="34" fill="#1b1a1e" stroke="#6c6970" strokeWidth="2" />
          {/* Cross steel trusses */}
          <g stroke="#4f4d52" strokeWidth="2" opacity="0.55">
            <line x1="168" y1="204" x2="262" y2="276" />
            <line x1="252" y1="204" x2="158" y2="276" />
            <line x1="140" y1="310" x2="294" y2="450" />
            <line x1="280" y1="310" x2="126" y2="450" />
          </g>
          {/* Floating beads / Dotty orbs */}
          <circle cx="118" cy="144" r="14" fill="#2a292d" stroke="#d8d3c7" strokeWidth="2" opacity="0.65" />
          <circle cx="304" cy="128" r="11" fill="#2a292d" stroke="#d8d3c7" strokeWidth="2" opacity="0.55" />
          <circle cx="328" cy="222" r="16" fill="#2a292d" stroke="#d8d3c7" strokeWidth="2" opacity="0.45" />
        </svg>
      );

    case 'submarine':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Deep sea air chamber / BIOS capsules & rising bubbles */}
          <rect x="58" y="132" width="304" height="270" rx="18" fill="#121215" stroke="#57555b" strokeWidth="2.5" />
          <circle cx="210" cy="264" r="96" fill="#0d0d10" stroke="#c8c3b8" strokeWidth="3" strokeDasharray="10 6" opacity="0.45" />
          <circle cx="210" cy="264" r="68" fill="#16161a" stroke="#7d7a80" strokeWidth="2" />
          {/* Air BIOS bubbles */}
          {[
            [102, 108, 16],
            [134, 72, 10],
            [298, 92, 20],
            [334, 146, 12],
            [268, 54, 8],
          ].map(([cx, cy, r], idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={r}
              fill="#19191d"
              stroke="#dcd7cc"
              strokeWidth="2"
              opacity="0.55"
            />
          ))}
          {/* Spade symbol in center */}
          <path
            d="M210 222 C188 248 172 262 172 278 C172 292 184 300 196 296 C202 294 206 290 208 286 L202 308 L218 308 L212 286 C214 290 218 294 224 296 C236 300 248 292 248 278 C248 262 232 248 210 222 Z"
            fill="#d8d3c7"
            opacity="0.3"
          />
        </svg>
      );

    case 'handkerchief':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Giant stopwatch / 60-second dial behind floating handkerchief */}
          <circle cx="210" cy="242" r="158" fill="#121215" stroke="#6c6970" strokeWidth="3" />
          <circle cx="210" cy="242" r="142" stroke="#3c3a40" strokeWidth="1.5" strokeDasharray="4 8" />
          {/* Clock hands pointing at 60 / leap second */}
          <line x1="210" y1="242" x2="210" y2="112" stroke="#e4e0d5" strokeWidth="4" opacity="0.65" />
          <line x1="210" y1="242" x2="230" y2="116" stroke="#b91c1c" strokeWidth="2.5" opacity="0.85" />
          {/* Draping white handkerchief silhouette */}
          <path
            d="M112 232 C154 214 218 202 296 218 C288 280 302 332 324 374 C266 364 196 382 132 360 C128 318 122 276 112 232 Z"
            fill="#1f1e22"
            stroke="#e4e0d5"
            strokeWidth="2.5"
            opacity="0.72"
          />
        </svg>
      );

    case 'ballot':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Ballot box with YES / NO cards */}
          <polygon points="88,184 332,184 358,430 62,430" fill="#131316" stroke="#5b5860" strokeWidth="2.5" />
          <rect x="148" y="204" width="124" height="14" rx="2" fill="#09090b" stroke="#c8c3b8" strokeWidth="2" />
          <g transform="rotate(-8 210 154)">
            <rect x="164" y="72" width="92" height="132" fill="#1d1c20" stroke="#e4e0d5" strokeWidth="2.5" />
            <text x="180" y="132" fill="#e4e0d5" fontSize="26" fontWeight="900" opacity="0.65">YES</text>
            <line x1="176" y1="150" x2="244" y2="150" stroke="#807c84" strokeWidth="2" />
            <text x="188" y="182" fill="#9a9690" fontSize="24" fontWeight="900" opacity="0.5">NO</text>
          </g>
        </svg>
      );

    case 'smuggle':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Contraband steel briefcase & border gate */}
          <rect x="64" y="164" width="292" height="214" rx="10" fill="#131316" stroke="#6c6970" strokeWidth="3" />
          <path d="M162 164 L162 126 C162 114 170 108 182 108 L238 108 C250 108 258 114 258 126 L258 164" stroke="#9d9990" strokeWidth="8" fill="none" />
          <line x1="64" y1="238" x2="356" y2="238" stroke="#4f4d52" strokeWidth="2" />
          <rect x="116" y="220" width="38" height="36" fill="#232226" stroke="#d8d3c7" strokeWidth="2" />
          <rect x="266" y="220" width="38" height="36" fill="#232226" stroke="#d8d3c7" strokeWidth="2" />
          <text x="162" y="330" fill="#f4f1ea" opacity="0.2" fontSize="56" fontWeight="900" fontFamily="monospace">
            ¥100M
          </text>
        </svg>
      );

    case 'cards17':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Fan of 5 high cards (A K Q J Joker) */}
          {[-26, -13, 0, 13, 26].map((angle, idx) => (
            <g key={angle} transform={`rotate(${angle} 210 380)`}>
              <rect
                x="154"
                y="112"
                width="112"
                height="182"
                rx="6"
                fill={idx === 2 ? '#1e1d22' : '#131316'}
                stroke={idx === 2 ? '#e4e0d5' : '#656268'}
                strokeWidth="2.5"
              />
              <text
                x="168"
                y="150"
                fill="#e4e0d5"
                opacity="0.55"
                fontSize="28"
                fontWeight="900"
                fontFamily="serif"
              >
                {['J', 'Q', '★', 'K', 'A'][idx]}
              </text>
            </g>
          ))}
        </svg>
      );

    case 'chairs':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Lone numbered chair on island */}
          <rect x="136" y="96" width="148" height="162" fill="#131316" stroke="#7c7880" strokeWidth="3" />
          <line x1="172" y1="96" x2="172" y2="258" stroke="#3c3a40" strokeWidth="3" />
          <line x1="210" y1="96" x2="210" y2="258" stroke="#3c3a40" strokeWidth="3" />
          <line x1="248" y1="96" x2="248" y2="258" stroke="#3c3a40" strokeWidth="3" />
          <polygon points="122,258 298,258 320,296 100,296" fill="#1c1b1f" stroke="#d8d3c7" strokeWidth="2.5" />
          <rect x="116" y="296" width="18" height="136" fill="#121215" stroke="#5b5860" strokeWidth="2" />
          <rect x="286" y="296" width="18" height="136" fill="#121215" stroke="#5b5860" strokeWidth="2" />
          <text x="176" y="198" fill="#f4f1ea" opacity="0.22" fontSize="64" fontWeight="900" fontFamily="monospace">
            15
          </text>
        </svg>
      );

    case 'rps':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Espoir ship bow + 3 survival stars */}
          <polygon points="28,314 392,314 344,432 76,432" fill="#131316" stroke="#6c6970" strokeWidth="2.5" />
          <rect x="108" y="242" width="204" height="72" fill="#19181d" stroke="#525056" strokeWidth="2" />
          {[132, 210, 288].map((cx) => (
            <polygon
              key={cx}
              points={`${cx},118 ${cx + 10},146 ${cx + 38},146 ${cx + 16},164 ${cx + 24},192 ${cx},176 ${cx - 24},192 ${cx - 16},164 ${cx - 38},146 ${cx - 10},146`}
              fill="#1c1b1f"
              stroke="#e4e0d5"
              strokeWidth="2.2"
              opacity="0.6"
            />
          ))}
        </svg>
      );

    case 'ecard':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Emperor vs Slave cards colliding */}
          <g transform="rotate(-12 146 250)">
            <rect x="82" y="132" width="132" height="218" rx="6" fill="#141417" stroke="#d8d3c7" strokeWidth="3" />
            <text x="108" y="256" fill="#e4e0d5" opacity="0.45" fontSize="58" fontWeight="900" fontFamily="serif">
              皇
            </text>
          </g>
          <g transform="rotate(14 276 266)">
            <rect x="208" y="150" width="132" height="218" rx="6" fill="#1b1a1f" stroke="#a6a198" strokeWidth="3" />
            <text x="236" y="274" fill="#d8d3c7" opacity="0.45" fontSize="58" fontWeight="900" fontFamily="serif">
              奴
            </text>
          </g>
        </svg>
      );

    case 'bog':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* 3-tier Kruun spinning plates of The Bog */}
          <ellipse cx="210" cy="148" rx="116" ry="38" fill="#141417" stroke="#7a767e" strokeWidth="2.5" />
          <ellipse cx="210" cy="242" rx="134" ry="44" fill="#141417" stroke="#96928b" strokeWidth="2.5" />
          <ellipse cx="210" cy="348" rx="154" ry="52" fill="#18171b" stroke="#dcd7cc" strokeWidth="3" />
          {/* 5 holes on bottom plate with 1 glowing target hole */}
          {[
            [116, 348, false],
            [162, 372, false],
            [210, 380, true],
            [258, 372, false],
            [304, 348, false],
          ].map(([cx, cy, isJackpot], idx) => (
            <ellipse
              key={idx}
              cx={cx as number}
              cy={cy as number}
              rx="18"
              ry="10"
              fill={isJackpot ? '#7f1d1d' : '#09090b'}
              stroke={isJackpot ? '#f4f1ea' : '#5b5860'}
              strokeWidth="2"
            />
          ))}
        </svg>
      );

    case 'mahjong':
      return (
        <svg viewBox="0 0 420 460" fill="none" aria-hidden="true" className={className}>
          {/* Wall of 17-step mahjong tiles */}
          <g transform="rotate(-7 210 250)">
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${66 + i * 58}, 148)`}>
                <rect width="50" height="76" rx="4" fill="#161619" stroke="#c8c3b8" strokeWidth="2" />
                <text x="12" y="50" fill="#d8d3c7" opacity="0.48" fontSize="28" fontWeight="900" fontFamily="serif">
                  {['發', '中', '白', '東', '九'][i]}
                </text>
              </g>
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${66 + i * 58}, 244)`}>
                <rect width="50" height="76" rx="4" fill="#121215" stroke="#6c6970" strokeWidth="2" />
                <circle cx="25" cy="38" r="12" stroke="#8a868d" strokeWidth="2" opacity="0.45" />
              </g>
            ))}
          </g>
        </svg>
      );
  }
}
