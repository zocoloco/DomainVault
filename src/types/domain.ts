export type DomainStrategy = 'Keep' | 'Sell' | 'Drop';

export type MarketplaceName =
  | 'Afternic'
  | 'Sedo'
  | 'Dan'
  | 'GoDaddy'
  | 'Squadhelp'
  | 'Private Landing Page';

export interface MarketplaceListing {
  name: MarketplaceName;
  active: boolean;
  listingUrl?: string;
  commissionPercent: number;
}

export type OfferStatus = 'Pending' | 'Accepted' | 'Declined' | 'Countered';

export interface DomainOffer {
  id: string;
  amount: number;
  buyerName: string;
  platform: string;
  date: string;
  status: OfferStatus;
  notes?: string;
}

export interface DomainAppraisal {
  conservative: number;
  fairMarket: number;
  premium: number;
  qualityScore: number;
  memorability: 'High' | 'Medium' | 'Low';
  commercialIntent: 'Very High' | 'High' | 'Moderate';
  syllableCount: number;
  searchVolumeEstimate: string;
  comparables: Array<{
    domain: string;
    price: string;
    year: string;
  }>;
  strengths: string[];
  rationale: string;
  appraisedAt: string;
}

export interface DomainItem {
  id: string;
  name: string;
  tld: string;
  registrar: string;
  dnsProvider: string;
  expiryDate: string; // YYYY-MM-DD
  annualCost: number;
  strategy: DomainStrategy;
  binPrice?: number;
  minOffer?: number;
  marketplaces: MarketplaceListing[];
  offers: DomainOffer[];
  category?: string;
  tags: string[];
  notes?: string;
  appraisal?: DomainAppraisal;
  createdAt: string;
  trafficMonthly?: number;
}
