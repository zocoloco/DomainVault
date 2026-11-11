import { DomainAppraisal } from '../types/domain';

export function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export function generateHeuristicAppraisal(domainName: string): DomainAppraisal {
  const parts = domainName.toLowerCase().trim().split('.');
  const sld = parts[0] || 'domain';
  const tld = '.' + (parts.slice(1).join('.') || 'com');

  const length = sld.length;
  const syllables = countSyllables(sld);

  // TLD multipliers
  let tldMultiplier = 1.0;
  let tldTier = 'Standard';
  if (tld === '.com') {
    tldMultiplier = 2.4;
    tldTier = 'Tier 1 Global Authority';
  } else if (tld === '.ai') {
    tldMultiplier = 2.2;
    tldTier = 'Top Tech High Demand';
  } else if (tld === '.io') {
    tldMultiplier = 1.4;
    tldTier = 'Developer / SaaS Favorite';
  } else if (tld === '.co') {
    tldMultiplier = 1.1;
    tldTier = 'Short Alternative';
  } else if (tld === '.app' || tld === '.dev') {
    tldMultiplier = 0.9;
    tldTier = 'Specialized Google Registry';
  } else if (tld === '.org' || tld === '.net') {
    tldMultiplier = 0.7;
    tldTier = 'Legacy Extension';
  } else {
    tldMultiplier = 0.4;
    tldTier = 'Niche TLD';
  }

  // Length factor
  let baseValue = 4000;
  if (length <= 4) {
    baseValue = 18000;
  } else if (length <= 6) {
    baseValue = 12000;
  } else if (length <= 9) {
    baseValue = 7000;
  } else if (length <= 13) {
    baseValue = 3500;
  } else {
    baseValue = 1200;
  }

  // Syllable & Hyphen adjustments
  if (sld.includes('-')) baseValue *= 0.35;
  if (/\d/.test(sld)) baseValue *= 0.45;
  if (syllables <= 2) baseValue *= 1.35;
  if (syllables >= 5) baseValue *= 0.7;

  // Keyword commercial boost
  const highValueKeywords = [
    'cloud', 'nexus', 'flow', 'pay', 'fintech', 'ai', 'data', 'health', 'pulse',
    'core', 'crypto', 'vault', 'meta', 'quantum', 'vector', 'logic', 'stack',
    'hyper', 'orbit', 'bot', 'chain', 'sync', 'mind', 'scale', 'stream', 'agent',
    'zenith', 'apex', 'node', 'prime', 'shield', 'shift', 'grid', 'byte', 'lab'
  ];

  let keywordHits = 0;
  for (const kw of highValueKeywords) {
    if (sld.includes(kw)) {
      keywordHits++;
    }
  }

  if (keywordHits >= 2) {
    baseValue *= 1.7;
  } else if (keywordHits === 1) {
    baseValue *= 1.3;
  }

  const rawFair = Math.round((baseValue * tldMultiplier) / 100) * 100;
  const fairMarket = Math.max(1200, rawFair);
  const conservative = Math.round((fairMarket * 0.48) / 100) * 100;
  const premium = Math.round((fairMarket * 1.55) / 100) * 100;

  // Quality score (0-100)
  let score = 70;
  if (tld === '.com' || tld === '.ai') score += 12;
  if (length <= 10) score += 8;
  if (!sld.includes('-') && !/\d/.test(sld)) score += 5;
  if (syllables <= 3) score += 5;
  score = Math.min(98, Math.max(45, score));

  // Memorability & Commercial Intent
  const memorability = syllables <= 3 && length <= 11 ? 'High' : length <= 14 ? 'Medium' : 'Low';
  const commercialIntent = keywordHits >= 1 || tld === '.com' || tld === '.ai' ? 'Very High' : 'Moderate';

  // Realistic comparables based on domain characteristics
  const comparables = [
    {
      domain: `${sld.slice(0, Math.min(5, sld.length))}base${tld}`,
      price: `$${(Math.round((fairMarket * 0.9) / 500) * 500).toLocaleString()}`,
      year: '2024',
    },
    {
      domain: `${sld}hq.com`,
      price: `$${(Math.round((fairMarket * 0.75) / 500) * 500).toLocaleString()}`,
      year: '2025',
    },
    {
      domain: `get${sld}.com`,
      price: `$${(Math.round((fairMarket * 1.2) / 500) * 500).toLocaleString()}`,
      year: '2023',
    },
  ];

  const strengths = [
    `${tldTier} with strong brand perception`,
    `${length} characters, ${syllables} syllable${syllables > 1 ? 's' : ''} — effortless phonetics and radio-test compliance`,
    keywordHits > 0
      ? `Contains high-conversion commercial keyword(s) favored by venture-backed startups`
      : `Clean clean branding canvas suited for emerging SaaS or modern consumer products`,
    `No hyphens or non-standard characters, minimizing typo leakage`,
  ];

  const rationale = `Valuation reflects the scarcity of ${length}-character names in ${tld}. With a high recall score and clear corporate positioning, end-users in venture-backed sectors often pay significant premiums over wholesale investor liquidate prices to secure exact-brand equity.`;

  return {
    conservative,
    fairMarket,
    premium,
    qualityScore: score,
    memorability,
    commercialIntent,
    syllableCount: syllables,
    searchVolumeEstimate: keywordHits > 0 ? 'High (Commercial Intent)' : 'Moderate (Brandable)',
    comparables,
    strengths,
    rationale,
    appraisedAt: new Date().toISOString().split('T')[0],
  };
}

export function generateOutreachPitch(params: {
  domain: string;
  industry?: string;
  tone?: string;
  targetBuyer?: string;
  binPrice?: number;
}): {
  subject: string;
  pitch: string;
  keySellingPoints: string[];
  callToAction: string;
} {
  const { domain, industry = 'Technology & SaaS', tone = 'Direct & Professional', targetBuyer = 'Founder / CMO', binPrice } = params;
  const parts = domain.split('.');
  const brandName = (parts[0] || 'Brand').toUpperCase();
  const priceDisplay = binPrice ? `$${binPrice.toLocaleString()}` : 'competitive market rate';

  let subject = `Acquisition opportunity: ${domain}`;
  if (tone.includes('Executive')) {
    subject = `Confidential: Strategic acquisition inquiry for ${domain}`;
  } else if (tone.includes('Friendly')) {
    subject = `Domain inquiry for ${brandName} — quick question for ${targetBuyer}`;
  }

  const pitch = `Hi ${targetBuyer},\n\nI am reaching out regarding ${domain}. Given your team's footprint in ${industry}, owning this pristine digital asset would instantly consolidate your authority, protect against competitor brand confusion, and elevate your customer acquisition trust from day one.\n\nWe are currently preparing this domain for placement through top tier marketplaces, but are extending direct outreach to category leaders first. We are open to discussing an outright buyout at ${priceDisplay} or a structured escrow transfer via Escrow.com or Dan.com to ensure seamless closing.`;

  return {
    subject,
    pitch,
    keySellingPoints: [
      `Exact category recall for ${industry}`,
      'Instant brand equity and heightened enterprise buyer trust',
      'Zero typo confusion, direct organic and type-in traffic capture',
      'Secure transaction via licensed escrow (Escrow.com / Dan)',
    ],
    callToAction: `Are you available for a brief 5-minute call this week, or should I connect directly with your legal/M&A counsel?`,
  };
}
