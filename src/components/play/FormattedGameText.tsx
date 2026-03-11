/**
 * FormattedGameText — renders game-rule description text with visual hierarchy.
 *
 * Detects structured ability blocks from class-features.json and renders them
 * as clean, card-like displays. Also handles plain descriptive text with
 * keyword highlighting and bullet formatting.
 */

import React from 'react';

/** Patterns that should be styled as inline labels */
const KEYWORD_LABELS = [
  'Effect:',
  'Trigger:',
  'Special:',
  'Spend:',
  'Cost:',
  'Duration:',
  'Requirement:',
  'Resistance:',
  'Forced Movement:',
  'Persistent:',
];

interface Props {
  text: string;
  className?: string;
}

/** Check if a line is an ability keyword+action line like "[Magic, Ranged, Strike] Main action" */
function isKeywordLine(line: string): boolean {
  return /^\[.+\]\s+.+/.test(line.trim());
}

/** Check if a line is a distance/target line */
function isDistanceTargetLine(line: string): boolean {
  const t = line.trim();
  return (t.startsWith('Distance:') || t.includes('| Target:')) && t.includes('Distance:');
}

/** Check if a line is a power roll header */
function isPowerRollLine(line: string): boolean {
  return /^Power Roll\s*\+/.test(line.trim());
}

/** Check if a line is a tier result */
function isTierLine(line: string): boolean {
  return /^-?\s*(≤11|11-|12[-–]16|12\+|17\+)/.test(line.trim());
}

/** Check if a line starts with a keyword label like "Effect:" */
function startsWithKeyword(line: string): string | null {
  const trimmed = line.trim();
  for (const kw of KEYWORD_LABELS) {
    if (trimmed.startsWith(kw)) return kw;
  }
  return null;
}

/** Check if text contains structured ability blocks */
function hasAbilityStructure(text: string): boolean {
  return text.includes('[') && text.includes('] ') && text.includes('Distance:');
}

export function FormattedGameText({ text, className = '' }: Props) {
  if (!text) return null;

  const lines = text.split('\n').filter((l) => l.trim().length > 0);

  // If text contains structured ability blocks, use the ability renderer
  if (hasAbilityStructure(text) && lines.length > 3) {
    return <div className={className}>{renderAbilityBlocks(lines)}</div>;
  }

  // Multi-line text without ability structure
  if (lines.length > 1) {
    return (
      <div className={className}>
        {lines.map((line, i) => renderPlainLine(line.trim(), i))}
      </div>
    );
  }

  // Single line
  return <p className={className}>{highlightKeywords(lines[0] ?? text)}</p>;
}

/**
 * Parse lines into ability blocks and render them as structured cards.
 * Each ability block starts with a name line, followed by optional flavor,
 * keyword+action, distance+target, power roll, tiers, effect.
 */
function renderAbilityBlocks(lines: string[]): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let i = 0;

  // Collect any intro text before the first ability block
  const introLines: string[] = [];
  while (i < lines.length && !isAbilityNameLine(lines, i)) {
    introLines.push(lines[i].trim());
    i++;
  }
  if (introLines.length > 0) {
    nodes.push(
      <div key="intro" className="mb-2">
        {introLines.map((l, idx) => renderPlainLine(l, idx))}
      </div>,
    );
  }

  // Parse ability blocks
  while (i < lines.length) {
    const blockStart = i;
    const block = parseAbilityBlock(lines, i);
    i = block.nextIndex;

    nodes.push(
      <div
        key={`ability-${blockStart}`}
        className="mt-2 px-3 py-2.5 rounded-xl bg-surface-light/15 border border-gold/8"
      >
        {/* Ability Name */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading text-[0.7rem] text-gold-light font-semibold">
            {block.name}
          </span>
          {block.actionType && (
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[0.55rem] font-heading font-semibold tracking-wider uppercase bg-gold/12 text-gold">
              {block.actionType}
            </span>
          )}
        </div>

        {/* Flavor text */}
        {block.flavor && (
          <p className="font-body text-[0.6rem] text-cream-dark/35 italic mt-0.5">
            {block.flavor}
          </p>
        )}

        {/* Keywords */}
        {block.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {block.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[0.5rem] font-heading uppercase tracking-wider text-gold-muted/60 bg-gold/5 px-1.5 py-0.5 rounded"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Distance + Target */}
        {(block.distance || block.target) && (
          <div className="flex flex-wrap gap-x-3 mt-1.5 text-[0.65rem] font-body">
            {block.distance && (
              <span className="text-cream-dark/50">
                <span className="font-heading font-semibold text-gold-muted/80">Distance: </span>
                {block.distance}
              </span>
            )}
            {block.target && (
              <span className="text-cream-dark/50">
                <span className="font-heading font-semibold text-gold-muted/80">Target: </span>
                {block.target}
              </span>
            )}
          </div>
        )}

        {/* Power Roll */}
        {block.powerRoll && (
          <p className="font-heading text-[0.6rem] text-gold-muted mt-2">
            {block.powerRoll}
          </p>
        )}

        {/* Tier Results */}
        {block.tiers.length > 0 && (
          <div className="mt-1 flex flex-col gap-0.5">
            {block.tiers.map((tier, idx) => {
              const isCrit = tier.label.includes('17+');
              return (
                <div
                  key={idx}
                  className="flex gap-2 text-[0.65rem] font-body pl-2 border-l-2 border-gold/8"
                >
                  <span className={`font-heading font-semibold shrink-0 w-[3rem] ${isCrit ? 'text-gold-light/80' : 'text-gold-muted/60'}`}>
                    {tier.label}
                  </span>
                  <span className={isCrit ? 'text-cream-dark/60' : 'text-cream-dark/45'}>
                    {tier.result}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Effect / Trailing text */}
        {block.trailingLines.length > 0 && (
          <div className="mt-1.5">
            {block.trailingLines.map((line, idx) => {
              const kw = startsWithKeyword(line);
              if (kw) {
                const rest = line.substring(kw.length).trim();
                return (
                  <p key={idx} className="font-body text-[0.65rem] text-cream-dark/50 mt-1 leading-relaxed">
                    <span className="font-heading font-semibold text-gold-muted/80">{kw} </span>
                    {rest}
                  </p>
                );
              }
              return (
                <p key={idx} className="font-body text-[0.65rem] text-cream-dark/50 mt-0.5 leading-relaxed">
                  {highlightKeywords(line)}
                </p>
              );
            })}
          </div>
        )}
      </div>,
    );
  }

  return nodes;
}

interface ParsedAbilityBlock {
  name: string;
  flavor: string | null;
  keywords: string[];
  actionType: string | null;
  distance: string | null;
  target: string | null;
  powerRoll: string | null;
  tiers: { label: string; result: string }[];
  trailingLines: string[];
  nextIndex: number;
}

/**
 * Detect if line[i] is the start of an ability name.
 * An ability name is a line that isn't a keyword line, distance line, power roll, tier, or effect,
 * and is followed within 3 lines by a keyword+action line.
 */
function isAbilityNameLine(lines: string[], i: number): boolean {
  const line = lines[i]?.trim();
  if (!line) return false;
  if (isKeywordLine(line) || isDistanceTargetLine(line) || isPowerRollLine(line) || isTierLine(line)) return false;
  if (startsWithKeyword(line)) return false;
  // Must be followed by a keyword line within 3 lines (name, maybe flavor, then [Keywords] line)
  for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
    if (isKeywordLine(lines[j]?.trim())) return true;
  }
  return false;
}

function parseAbilityBlock(lines: string[], startIdx: number): ParsedAbilityBlock {
  let i = startIdx;
  const block: ParsedAbilityBlock = {
    name: lines[i].trim(),
    flavor: null,
    keywords: [],
    actionType: null,
    distance: null,
    target: null,
    powerRoll: null,
    tiers: [],
    trailingLines: [],
    nextIndex: startIdx + 1,
  };
  i++;

  // Next line could be flavor text (if it's not a keyword line)
  if (i < lines.length && !isKeywordLine(lines[i].trim())) {
    block.flavor = lines[i].trim();
    i++;
  }

  // Keyword + action type line: [Magic, Ranged, Strike] Main action
  if (i < lines.length && isKeywordLine(lines[i].trim())) {
    const match = lines[i].trim().match(/^\[(.+?)\]\s+(.+)$/);
    if (match) {
      block.keywords = match[1].split(',').map((k) => k.trim());
      block.actionType = match[2].trim();
    }
    i++;
  }

  // Distance + Target line
  if (i < lines.length && isDistanceTargetLine(lines[i].trim())) {
    const parts = lines[i].trim().split('|').map((p) => p.trim());
    for (const part of parts) {
      if (part.startsWith('Distance:')) block.distance = part.replace('Distance:', '').trim();
      if (part.startsWith('Target:')) block.target = part.replace('Target:', '').trim();
    }
    i++;
  }

  // Power roll line
  if (i < lines.length && isPowerRollLine(lines[i].trim())) {
    block.powerRoll = lines[i].trim().replace(/:$/, '');
    i++;
  }

  // Tier result lines
  while (i < lines.length && isTierLine(lines[i].trim())) {
    const tierText = lines[i].trim().replace(/^-\s*/, '');
    const tierMatch = tierText.match(/^(≤11|11-|12[-–]16|12\+|17\+):?\s*(.*)$/);
    if (tierMatch) {
      block.tiers.push({ label: tierMatch[1] + ':', result: tierMatch[2] });
    }
    i++;
  }

  // Trailing lines (Effect, etc.) — until we hit another ability name or end
  while (i < lines.length && !isAbilityNameLine(lines, i)) {
    block.trailingLines.push(lines[i].trim());
    i++;
  }

  block.nextIndex = i;
  return block;
}

/** Render a plain line with keyword highlighting and bullet detection */
function renderPlainLine(line: string, index: number): React.ReactNode {
  // Bullet line
  if (line.startsWith('•') || line.startsWith('- ')) {
    const content = line.replace(/^[•\-]\s*/, '');
    return (
      <div key={index} className="pl-2.5 border-l-2 border-gold/10 py-0.5">
        {highlightKeywords(content)}
      </div>
    );
  }

  // Keyword-starting line
  const kw = startsWithKeyword(line);
  if (kw) {
    const rest = line.substring(kw.length).trim();
    return (
      <p key={index} className={index > 0 ? 'mt-1' : ''}>
        <span className="font-heading font-semibold text-gold-muted/80">{kw} </span>
        {rest}
      </p>
    );
  }

  return (
    <p key={index} className={index > 0 ? 'mt-1' : ''}>
      {highlightKeywords(line)}
    </p>
  );
}

/** Simple keyword highlighting for inline text */
function highlightKeywords(text: string): React.ReactNode[] {
  const regex = new RegExp(
    `(${KEYWORD_LABELS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'g',
  );
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (KEYWORD_LABELS.includes(part)) {
      return (
        <span key={i} className="font-heading font-semibold text-gold-muted/80">
          {part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
