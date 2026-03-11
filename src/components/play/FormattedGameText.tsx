/**
 * FormattedGameText — renders game-rule description text with visual hierarchy.
 *
 * Long walls of text are broken into scannable chunks:
 * - Keywords like "Effect:", "Trigger:", "Spend:", etc. are bolded & highlighted
 * - Bullet-like patterns (• or - at line start) become styled list items
 * - Very long single-paragraph text gets sentence-level line breaks
 */

import React from 'react';

/** Patterns that should be styled as inline labels */
const KEYWORD_PATTERNS = [
  'Effect:',
  'Trigger:',
  'Special:',
  'Spend:',
  'Cost:',
  'Distance:',
  'Range:',
  'Target:',
  'Duration:',
  'Requirement:',
  'Resistance:',
  'Power Roll:',
  'Keywords:',
  'Forced Movement:',
  'Area:',
  'Persistent:',
];

const KEYWORD_REGEX = new RegExp(
  `(${KEYWORD_PATTERNS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'g',
);

/** Tier result patterns like "≤11:", "12-16:", "12+:", "17+:" */
const TIER_REGEX = /(\u226411:?|11-?:?|12[-–]16:?|12\+:?|17\+:?)/g;

interface Props {
  text: string;
  className?: string;
}

export function FormattedGameText({ text, className = '' }: Props) {
  if (!text) return null;

  // If text has explicit newlines, split on them
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);

  // Multi-line text: render each line, detecting bullets and keywords
  if (lines.length > 1) {
    return (
      <div className={className}>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          // Bullet line
          if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
            const content = trimmed.replace(/^[•\-]\s*/, '');
            return (
              <div key={i} className="pl-2.5 border-l-2 border-gold/10 py-0.5">
                {renderInlineKeywords(content)}
              </div>
            );
          }
          return (
            <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
              {renderInlineKeywords(trimmed)}
            </p>
          );
        })}
      </div>
    );
  }

  // Single paragraph — check if it's long enough to benefit from structuring
  const singleText = lines[0] ?? text;

  // If it has keyword labels, split on them for visual hierarchy
  if (KEYWORD_REGEX.test(singleText) && singleText.length > 150) {
    KEYWORD_REGEX.lastIndex = 0;
    return (
      <div className={className}>
        {renderStructuredText(singleText)}
      </div>
    );
  }

  // Short text: just render with inline keyword highlighting
  return (
    <p className={className}>
      {renderInlineKeywords(singleText)}
    </p>
  );
}

/** Highlight keywords and tier markers inline */
function renderInlineKeywords(text: string): React.ReactNode[] {
  // First pass: split on keywords
  const parts = text.split(KEYWORD_REGEX);
  const result: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (KEYWORD_PATTERNS.includes(part)) {
      result.push(
        <span key={`kw-${i}`} className="font-heading font-semibold text-gold-muted/90">
          {part}
        </span>,
      );
    } else {
      // Second pass: highlight tier markers within non-keyword text
      const tierParts = part.split(TIER_REGEX);
      for (let j = 0; j < tierParts.length; j++) {
        const tp = tierParts[j];
        if (!tp) continue;
        if (TIER_REGEX.test(tp)) {
          TIER_REGEX.lastIndex = 0;
          result.push(
            <span key={`t-${i}-${j}`} className="font-heading font-semibold text-gold-muted/70">
              {tp}
            </span>,
          );
        } else {
          result.push(<React.Fragment key={`f-${i}-${j}`}>{tp}</React.Fragment>);
        }
      }
    }
  }

  return result;
}

/** Split long text with multiple keyword sections into structured blocks */
function renderStructuredText(text: string): React.ReactNode[] {
  KEYWORD_REGEX.lastIndex = 0;
  const nodes: React.ReactNode[] = [];

  // Find all keyword positions
  const matches: { index: number; keyword: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = KEYWORD_REGEX.exec(text)) !== null) {
    matches.push({ index: match.index, keyword: match[1] });
  }

  if (matches.length === 0) {
    return [<React.Fragment key="0">{renderInlineKeywords(text)}</React.Fragment>];
  }

  // Text before first keyword
  if (matches[0].index > 0) {
    const before = text.substring(0, matches[0].index).trim();
    if (before) {
      nodes.push(
        <p key="pre" className="mb-1">
          {renderInlineKeywords(before)}
        </p>,
      );
    }
  }

  // Each keyword section
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const section = text.substring(start, end).trim();

    nodes.push(
      <div key={`s-${i}`} className={i > 0 || nodes.length > 0 ? 'mt-1' : ''}>
        {renderInlineKeywords(section)}
      </div>,
    );
  }

  return nodes;
}
