import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { generateHeuristicAppraisal, generateOutreachPitch } from './src/utils/valuationEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// AI Domain Appraisal Endpoint
app.post('/api/ai/appraise', async (req: Request, res: Response) => {
  const { domain, tld, category, currentBin } = req.body;

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Domain name is required' });
  }

  // If Gemini API is available, query gemini-3.8-flash with structured appraisal schema
  if (ai) {
    try {
      const prompt = `You are a world-class domain broker and accredited valuation expert (like DNJournal, NameBio, and GoDaddy Appraisal).
Analyze the following domain name and return an in-depth, realistic commercial domain appraisal.

Domain Name: "${domain}"
TLD: "${tld || ''}"
Existing Category/Context: "${category || 'General'}"
Current Listed BIN (if any): ${currentBin ? `$${currentBin}` : 'None'}

Provide conservative (wholesale/liquidation), fair market (realistic investor retail), and premium end-user buy-it-now valuations in USD.
Include a quality score (0-100), memorability, commercial intent, syllable count, search volume estimate, 3 realistic comparable historical sales, key strengths, and an insightful valuation rationale.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior domain broker and valuation analyst. Be objective, realistic, and grounded in domain industry sales data (NameBio, Sedo, Dan, Afternic). Always respond in valid JSON matching the requested schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conservative: { type: Type.INTEGER, description: 'Wholesale / liquidation cash price in USD' },
              fairMarket: { type: Type.INTEGER, description: 'Fair market retail sales price in USD' },
              premium: { type: Type.INTEGER, description: 'Premium corporate end-user acquisition price in USD' },
              qualityScore: { type: Type.INTEGER, description: 'Brand quality score from 1 to 100' },
              memorability: { type: Type.STRING, description: 'High, Medium, or Low' },
              commercialIntent: { type: Type.STRING, description: 'Very High, High, or Moderate' },
              syllableCount: { type: Type.INTEGER, description: 'Approximate syllable count of SLD' },
              searchVolumeEstimate: { type: Type.STRING, description: 'Search volume intent summary' },
              comparables: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    domain: { type: Type.STRING },
                    price: { type: Type.STRING },
                    year: { type: Type.STRING },
                  },
                },
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 concise domain strengths and market advantages',
              },
              rationale: {
                type: Type.STRING,
                description: '2-3 sentence domain broker market rationale',
              },
            },
            required: [
              'conservative',
              'fairMarket',
              'premium',
              'qualityScore',
              'memorability',
              'commercialIntent',
              'syllableCount',
              'searchVolumeEstimate',
              'comparables',
              'strengths',
              'rationale',
            ],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          ...parsed,
          appraisedAt: new Date().toISOString().split('T')[0],
          isAiGenerated: true,
        });
      }
    } catch (err: unknown) {
      console.warn('Gemini API call failed, falling back to heuristic engine:', err);
      // Fallback below
    }
  }

  // Graceful fallback to rich algorithmic valuation
  const fallback = generateHeuristicAppraisal(domain);
  return res.json({
    ...fallback,
    isAiGenerated: false,
  });
});

// AI Sales Outreach Pitch Endpoint
app.post('/api/ai/pitch', async (req: Request, res: Response) => {
  const { domain, industry, tone, targetBuyer, binPrice } = req.body;

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Domain name is required' });
  }

  if (ai) {
    try {
      const prompt = `Generate a high-converting, professional B2B domain sales outreach pitch email to sell the domain "${domain}".
Industry Context: ${industry || 'Technology / SaaS'}
Tone Style: ${tone || 'Direct & Professional'}
Target Buyer: ${targetBuyer || 'Founder / CMO'}
Asking / Target Price: ${binPrice ? `$${binPrice.toLocaleString()}` : 'Market Competitive'}

The pitch should be 2 concise, compelling paragraphs. It must explain the strategic business value, immediate brand authority, and risk mitigation against competitors, and specify escrow closing (Escrow.com / Dan.com).
Return valid JSON with subject line, 2-paragraph pitch text, 4 bullet key selling points, and a frictionless call-to-action.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert tech M&A outbound sales copywriter specializing in premium domain asset transactions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING, description: 'Subject line for email' },
              pitch: { type: Type.STRING, description: 'Two paragraph outbound email pitch' },
              keySellingPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '4 bullet points summarizing commercial appeal',
              },
              callToAction: { type: Type.STRING, description: 'Polite, low-friction closing CTA' },
            },
            required: ['subject', 'pitch', 'keySellingPoints', 'callToAction'],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          ...parsed,
          isAiGenerated: true,
        });
      }
    } catch (err: unknown) {
      console.warn('Gemini pitch generation failed, falling back to template engine:', err);
    }
  }

  const fallbackPitch = generateOutreachPitch({
    domain,
    industry,
    tone,
    targetBuyer,
    binPrice,
  });

  return res.json({
    ...fallbackPitch,
    isAiGenerated: false,
  });
});

// ==========================================
// Cloudflare Integration Endpoints
// ==========================================

// Check Cloudflare connection configuration status
app.get('/api/integrations/cloudflare/status', (_req: Request, res: Response) => {
  const rawToken = process.env.CLOUDFLARE_API_TOKEN || '';
  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cfEmail = process.env.CLOUDFLARE_EMAIL;

  const isConfigured = !!rawToken && rawToken !== 'MY_CLOUDFLARE_API_TOKEN' && rawToken.trim().length > 0;
  const cleanToken = sanitizeToken(rawToken);
  const isAccountId = cleanToken.length === 32 && /^[0-9a-f]{32}$/i.test(cleanToken);
  const isGlobalKey = cleanToken.length === 37 && /^[0-9a-f]{37}$/i.test(cleanToken);
  const isApiToken = cleanToken.length === 40;

  res.json({
    configured: isConfigured,
    tokenLength: cleanToken.length,
    accountIdLength: (cfAccountId || '').length,
    tokenClassification: isAccountId ? 'account_id' : isGlobalKey ? 'global_key' : isApiToken ? 'api_token' : 'unknown',
    isAccountId,
    isGlobalKey,
    hasAccountId: !!cfAccountId && cfAccountId !== 'MY_CLOUDFLARE_ACCOUNT_ID',
    hasEmail: !!cfEmail && cfEmail !== 'MY_CLOUDFLARE_EMAIL',
    timestamp: new Date().toISOString(),
  });
});

// Helper function to sanitize tokens
function sanitizeToken(raw?: string | null): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^["'`]|["'`]$/g, '') // remove surrounding quotes
    .replace(/\s+/g, '')          // remove all internal/trailing spaces, newlines, and tabs
    .replace(/^bearer/i, '')      // remove accidental "Bearer" prefix
    .trim();
}

// Live Cloudflare Sync (pull zones & registrar domains)
app.post('/api/integrations/cloudflare/sync', async (req: Request, res: Response) => {
  const rawToken = req.body?.token || process.env.CLOUDFLARE_API_TOKEN || '';
  const rawEmail = req.body?.email || process.env.CLOUDFLARE_EMAIL || '';
  const rawAccountId = req.body?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || '';

  const cleanToken = sanitizeToken(rawToken);
  const cleanEmail = sanitizeToken(rawEmail);
  const cleanAccountId = sanitizeToken(rawAccountId);

  if (!cleanToken || cleanToken === 'MY_CLOUDFLARE_API_TOKEN') {
    return res.status(400).json({
      success: false,
      configured: false,
      error:
        'CLOUDFLARE_API_TOKEN is not configured. Please add CLOUDFLARE_API_TOKEN to your environment or Settings > Secrets panel.',
    });
  }

  // Check if user accidentally pasted an Account ID (32 hex characters) instead of an API Token
  if (cleanToken.length === 32 && /^[0-9a-f]{32}$/i.test(cleanToken)) {
    return res.status(400).json({
      success: false,
      isAccountIdMismatch: true,
      tokenLength: 32,
      error:
        'The value currently in CLOUDFLARE_API_TOKEN is your 32-character Cloudflare Account ID (or Zone ID), NOT an API Token. In Cloudflare, API Tokens are 40 characters long.',
      instructions: [
        '1. Open Cloudflare: https://dash.cloudflare.com/profile/api-tokens',
        '2. Click "Create Token" (do NOT copy the Account ID or Zone ID from the domain overview)',
        '3. Select the template "Read all zones"',
        '4. Click "Continue to summary" and then "Create Token"',
        '5. Copy the 40-character token and update CLOUDFLARE_API_TOKEN in Settings > Secrets',
      ],
    });
  }

  // Gather candidate emails for Global API Key auth
  const candidateEmails: string[] = Array.from(
    new Set(
      [
        rawEmail,
        req.body?.userEmail,
        process.env.CLOUDFLARE_EMAIL,
        'cedars.snipes.5w@icloud.com', // User's primary registered email
      ]
        .map((e) => (typeof e === 'string' ? e.trim().replace(/^["'`]|["'`]$/g, '') : ''))
        .filter((e) => e.length > 3 && e.includes('@'))
    )
  );

  const isHexGlobalKey = /^[0-9a-f]{32,45}$/i.test(cleanToken);
  const authStrategies: Array<{ type: string; headers: Record<string, string> }> = [];

  // If token looks like a Global API Key (37 hex characters), prioritize Global Key auth
  if (isHexGlobalKey) {
    for (const email of candidateEmails) {
      authStrategies.push({
        type: `Global API Key (${email})`,
        headers: {
          'X-Auth-Key': cleanToken,
          'X-Auth-Email': email,
          'Accept': 'application/json',
        },
      });
    }

    // Also try Bearer as secondary fallback
    authStrategies.push({
      type: 'Bearer API Token',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/json',
      },
    });
  } else {
    // If not standard hex, prioritize Bearer token first
    authStrategies.push({
      type: 'Bearer API Token',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/json',
      },
    });

    // Followed by Global Key with candidate emails
    for (const email of candidateEmails) {
      authStrategies.push({
        type: `Global API Key (${email})`,
        headers: {
          'X-Auth-Key': cleanToken,
          'X-Auth-Email': email,
          'Accept': 'application/json',
        },
      });
    }
  }

  let lastError = '';
  let successfulZones: any[] = [];
  let usedStrategy = '';
  const attemptDiagnostics: Array<{ strategy: string; status: number; error: string; headerKeys: string[] }> = [];

  console.log(`[Cloudflare Sync] Total candidate strategies: ${authStrategies.length}`);
  authStrategies.forEach((s, i) => {
    console.log(`  Strategy #${i + 1}: ${s.type}, headers:`, Object.keys(s.headers));
  });

  // Try authentication strategies
  for (const strategy of authStrategies) {
    try {
      const zonesUrl = 'https://api.cloudflare.com/client/v4/zones?per_page=50';
      const zonesRes = await fetch(zonesUrl, {
        headers: strategy.headers,
      });

      console.log(`[Cloudflare Sync] Tried "${strategy.type}": status = ${zonesRes.status}`);

      if (zonesRes.ok) {
        const zonesData = (await zonesRes.json()) as {
          result: Array<{
            id: string;
            name: string;
            status: string;
            name_servers?: string[];
            created_on?: string;
          }>;
        };
        successfulZones = zonesData.result || [];
        usedStrategy = strategy.type;
        console.log(`[Cloudflare Sync] SUCCESS with "${strategy.type}"! Found ${successfulZones.length} zones.`);
        break;
      } else {
        const errData = (await zonesRes.json().catch(() => ({}))) as {
          errors?: Array<{ code?: number; message?: string; error_chain?: Array<{ code?: number; message?: string }> }>;
        };

        const mainError = errData.errors?.[0];
        let errMsg = mainError?.message || zonesRes.statusText;
        if (mainError?.code) errMsg += ` (Code ${mainError.code})`;

        if (Array.isArray(mainError?.error_chain) && mainError.error_chain.length > 0) {
          const chainMsgs = mainError.error_chain.map((c) => c.message).filter(Boolean);
          if (chainMsgs.length > 0) {
            errMsg += `: ${chainMsgs.join('; ')}`;
          }
        }

        console.log(`[Cloudflare Sync] Failed "${strategy.type}":`, errMsg);

        attemptDiagnostics.push({
          strategy: strategy.type,
          status: zonesRes.status,
          error: errMsg,
          headerKeys: Object.keys(strategy.headers),
        });

        lastError = errMsg;
      }
    } catch (fetchErr: unknown) {
      const errMsg = fetchErr instanceof Error ? fetchErr.message : 'Network failure communicating with Cloudflare';
      console.log(`[Cloudflare Sync] Exception on "${strategy.type}":`, errMsg);
      attemptDiagnostics.push({
        strategy: strategy.type,
        status: 0,
        error: errMsg,
        headerKeys: Object.keys(strategy.headers),
      });
      lastError = errMsg;
    }
  }

  if (successfulZones.length === 0) {
    console.log('[Cloudflare Sync] All attempts failed. Diagnostics:', attemptDiagnostics);
    return res.status(400).json({
      success: false,
      error: `Cloudflare API error: ${lastError}`,
      diagnostics: attemptDiagnostics,
    });
  }

  try {
    const zones = successfulZones;

    // Optionally fetch registrar domains if Account ID is provided
    let registrarDomainsMap = new Map<string, { expires_at?: string; auto_renew?: boolean }>();
    if (cleanAccountId && cleanAccountId !== 'MY_CLOUDFLARE_ACCOUNT_ID') {
      try {
        const activeHeaders = authStrategies.find((s) => s.type === usedStrategy)?.headers || authStrategies[0].headers;
        const regRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cleanAccountId}/registrar/domains`,
          {
            headers: activeHeaders,
          }
        );
        if (regRes.ok) {
          const regData = (await regRes.json()) as {
            result: Array<{ name: string; expires_at?: string; auto_renew?: boolean }>;
          };
          (regData.result || []).forEach((rd) => {
            registrarDomainsMap.set(rd.name.toLowerCase(), rd);
          });
        }
      } catch (regErr) {
        console.warn('Could not query Cloudflare registrar endpoint:', regErr);
      }
    }

    // 3. Transform Cloudflare zones into DomainVault DomainItems
    const syncedDomains = zones.map((zone) => {
      const name = zone.name.toLowerCase();
      const dotIndex = name.lastIndexOf('.');
      const tld = dotIndex !== -1 ? name.substring(dotIndex) : '.com';
      const regInfo = registrarDomainsMap.get(name);

      // Default annual cost estimations for Cloudflare at-cost pricing
      let annualCost = 10.44;
      if (tld === '.ai') annualCost = 70.0;
      else if (tld === '.io') annualCost = 38.0;
      else if (tld === '.co') annualCost = 25.0;
      else if (tld === '.org') annualCost = 10.2;
      else if (tld === '.app') annualCost = 14.0;

      // Expiration date (from registrar or default 1 year out)
      let expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      if (regInfo?.expires_at) {
        expiryDate = regInfo.expires_at.split('T')[0];
      }

      return {
        id: `cf-${zone.id}`,
        name: zone.name,
        tld,
        registrar: regInfo ? 'Cloudflare' : 'Cloudflare / External',
        dnsProvider: 'Cloudflare',
        expiryDate,
        annualCost,
        strategy: 'Keep',
        category: 'Cloudflare Synced',
        tags: ['Cloudflare', zone.status],
        notes: `Imported via Cloudflare API. Cloudflare Zone ID: ${zone.id}. Status: ${zone.status}.`,
        createdAt: new Date().toISOString().split('T')[0],
      };
    });

    return res.json({
      success: true,
      count: syncedDomains.length,
      domains: syncedDomains,
      source: 'live',
    });
  } catch (err: unknown) {
    console.error('Failed to sync Cloudflare:', err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to communicate with Cloudflare API',
    });
  }
});

// Demo Cloudflare Pull endpoint (for immediate simulation & previewing without key)
app.post('/api/integrations/cloudflare/demo-sync', (_req: Request, res: Response) => {
  const demoCloudflareDomains = [
    {
      id: `cf-demo-1`,
      name: 'edgecompute.dev',
      tld: '.dev',
      registrar: 'Cloudflare',
      dnsProvider: 'Cloudflare',
      expiryDate: '2027-09-18',
      annualCost: 12.0,
      strategy: 'Sell',
      binPrice: 8500,
      minOffer: 4000,
      category: 'Cloudflare Workers / Edge',
      tags: ['Cloudflare', 'Serverless', 'DevTools'],
      notes: 'Imported from Cloudflare Zone: edgecompute.dev (Workers / Edge Computing).',
      createdAt: new Date().toISOString().split('T')[0],
    },
    {
      id: `cf-demo-2`,
      name: 'zerotrust-gateway.com',
      tld: '.com',
      registrar: 'Cloudflare',
      dnsProvider: 'Cloudflare',
      expiryDate: '2026-12-04',
      annualCost: 10.44,
      strategy: 'Keep',
      category: 'Cybersecurity / SASE',
      tags: ['Cloudflare', 'ZeroTrust', 'Security'],
      notes: 'Imported from Cloudflare Zone: zerotrust-gateway.com.',
      createdAt: new Date().toISOString().split('T')[0],
    },
    {
      id: `cf-demo-3`,
      name: 'streamrelay.io',
      tld: '.io',
      registrar: 'Cloudflare',
      dnsProvider: 'Cloudflare',
      expiryDate: '2027-07-22',
      annualCost: 38.0,
      strategy: 'Sell',
      binPrice: 6200,
      minOffer: 3200,
      category: 'Cloudflare Stream / Media',
      tags: ['Cloudflare', 'Video', 'Streaming'],
      notes: 'Imported from Cloudflare Zone: streamrelay.io (Cloudflare Stream live media ingest).',
      createdAt: new Date().toISOString().split('T')[0],
    },
    {
      id: `cf-demo-4`,
      name: 'vectorcache.ai',
      tld: '.ai',
      registrar: 'Cloudflare',
      dnsProvider: 'Cloudflare',
      expiryDate: '2027-11-15',
      annualCost: 70.0,
      strategy: 'Sell',
      binPrice: 19500,
      minOffer: 11000,
      category: 'Vectorize / AI',
      tags: ['Cloudflare', 'Vectorize', 'AI'],
      notes: 'Imported from Cloudflare Zone: vectorcache.ai.',
      createdAt: new Date().toISOString().split('T')[0],
    },
    {
      id: `cf-demo-5`,
      name: 'pagesdeploy.net',
      tld: '.net',
      registrar: 'Cloudflare',
      dnsProvider: 'Cloudflare',
      expiryDate: '2026-11-30',
      annualCost: 11.5,
      strategy: 'Drop',
      category: 'Cloudflare Pages / CI',
      tags: ['Cloudflare', 'Pages', 'Staging'],
      notes: 'Imported from Cloudflare Zone: pagesdeploy.net.',
      createdAt: new Date().toISOString().split('T')[0],
    },
  ];

  res.json({
    success: true,
    count: demoCloudflareDomains.length,
    domains: demoCloudflareDomains,
    source: 'demo',
  });
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`DomainVault server listening on port ${PORT}`);
  });
}

startServer();
