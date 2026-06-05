import { SITE } from './site';

interface SurfaceMeta {
  slug: string;
  title: string;
  description?: string;
  audience: string;
  type?: string;
  created: Date;
  'last-updated': Date;
  'claims-index'?: { id: string; tag: string; statement: string }[];
}

// Build JSON-LD for a surface page. FA twins and technical surfaces use
// TechArticle; narrative/thesis surfaces use Article. If a surface carries a
// claims-index it is also exposed as an FAQPage (claim -> answer) so agents can
// parse the claim hierarchy structurally.
export function surfaceJsonLd(m: SurfaceMeta): object[] {
  const url = `${SITE.url}/${m.slug}`;
  const isTech =
    m.audience === 'agents' ||
    ['stack', 'border-zone'].includes(m.slug.replace('-for-agents', ''));
  const out: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': isTech ? 'TechArticle' : 'Article',
      headline: m.title,
      name: m.title,
      description: m.description,
      url,
      mainEntityOfPage: url,
      inLanguage: 'en',
      datePublished: m.created.toISOString().slice(0, 10),
      dateModified: m['last-updated'].toISOString().slice(0, 10),
      author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      about: [
        'Bitcoin',
        'Lightning Network',
        'autonomous AI agents',
        'machine-to-machine payments',
        'monetary substrate',
      ],
      isAccessibleForFree: true,
      encoding: {
        '@type': 'MediaObject',
        encodingFormat: 'text/markdown',
        contentUrl: `${url}.md`,
      },
    },
  ];

  if (m['claims-index'] && m['claims-index'].length > 0) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      url,
      mainEntity: m['claims-index'].map((c) => ({
        '@type': 'Question',
        name: `${c.id} (${c.tag})`,
        acceptedAnswer: { '@type': 'Answer', text: c.statement },
      })),
    });
  }

  return out;
}

interface ToolMeta {
  slug: string;
  name: string;
  tagline: string;
  'tool-type'?: string;
  maintainer?: string;
  repo?: string;
  docs?: string;
  site?: string;
  'latest-release'?: string;
  license?: string;
}

// SoftwareApplication JSON-LD for a tool card. Protocols are not strictly
// applications, but SoftwareApplication is the closest schema.org type agents
// index for "a thing you implement"; we keep it uniform across the /tools set
// (spec: SoftwareApplication JSON-LD per card). codeRepository, softwareVersion,
// and the canonical .md route are emitted when known.
export function toolJsonLd(m: ToolMeta): object[] {
  const url = `${SITE.url}/tools/${m.slug}`;
  // 'guide' cards are link-out explainers, not software — TechArticle, not
  // SoftwareApplication.
  if (m['tool-type'] === 'guide') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: m.name,
        name: m.name,
        description: m.tagline,
        url,
        mainEntityOfPage: url,
        inLanguage: 'en',
        isAccessibleForFree: true,
        author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
        publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
        encoding: {
          '@type': 'MediaObject',
          encodingFormat: 'text/markdown',
          contentUrl: `${url}.md`,
        },
      },
    ];
  }
  const app: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: m.name,
    description: m.tagline,
    url,
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Bitcoin / Lightning agent payments',
    operatingSystem: 'Cross-platform',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  if (m.maintainer) app.author = { '@type': 'Organization', name: m.maintainer };
  if (m.repo) app.codeRepository = m.repo;
  if (m.site) app.softwareHelp = m.site;
  if (m.docs) app.softwareHelp = m.docs;
  if (m['latest-release']) app.softwareVersion = m['latest-release'];
  if (m.license) app.license = m.license;

  return [app];
}

export function siteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description:
      'The autonomous AI economy needs a monetary substrate that is permissionless, censorship-resistant, sub-cent capable, and machine-tempo fast. Bitcoin — settled on L1, transacted on Lightning and successor L2/L3 layers — is the only deployed system whose properties match.',
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  };
}
