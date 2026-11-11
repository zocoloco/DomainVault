import { DomainItem } from '../types/domain';
import { INITIAL_DOMAINS } from '../data/mockDomains';

const STORAGE_KEY = 'domainvault_portfolio_v1';

export function loadDomainsFromStorage(): DomainItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOMAINS));
      return INITIAL_DOMAINS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DOMAINS;
  } catch (err) {
    console.error('Failed to parse domain storage:', err);
    return INITIAL_DOMAINS;
  }
}

export function saveDomainsToStorage(domains: DomainItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
  } catch (err) {
    console.error('Failed to write domain storage:', err);
  }
}

export function resetDomainsStorage(): DomainItem[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOMAINS));
  } catch (err) {
    console.error('Failed to reset storage:', err);
  }
  return INITIAL_DOMAINS;
}

export function exportToJson(domains: DomainItem[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(domains, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `domainvault-portfolio-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToCsv(domains: DomainItem[]): void {
  const headers = [
    'Domain Name',
    'TLD',
    'Strategy',
    'Registrar',
    'DNS Provider',
    'Expiry Date',
    'Annual Renewal Cost ($)',
    'Target BIN ($)',
    'Min Offer ($)',
    'Active Marketplaces',
    'Offers Count',
    'Notes',
  ];

  const rows = domains.map((d) => {
    const activeMarketplaces = d.marketplaces
      .filter((m) => m.active)
      .map((m) => m.name)
      .join('; ');

    const cleanField = (val: unknown) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    return [
      cleanField(d.name),
      cleanField(d.tld),
      cleanField(d.strategy),
      cleanField(d.registrar),
      cleanField(d.dnsProvider),
      cleanField(d.expiryDate),
      cleanField(d.annualCost),
      cleanField(d.binPrice ?? ''),
      cleanField(d.minOffer ?? ''),
      cleanField(activeMarketplaces),
      cleanField(d.offers?.length || 0),
      cleanField(d.notes ?? ''),
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', `domainvault-portfolio-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
