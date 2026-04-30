const CLEARBIT_API_KEY = process.env.CLEARBIT_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

async function suggestDomain(companyName) {
  try {
    const res = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

async function enrichCompany(domain) {
  if (!CLEARBIT_API_KEY) return null;
  try {
    const res = await fetch(
      `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(domain)}`,
      { headers: { Authorization: `Bearer ${CLEARBIT_API_KEY}` } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchHackerNews(companyName) {
  try {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(companyName)}&tags=story&numericFilters=created_at_i>${thirtyDaysAgo}&hitsPerPage=8`
    );
    if (!res.ok) return [];
    let data = await res.json();
    let hits = data.hits || [];

    if (hits.length === 0) {
      const ninetyDaysAgo = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);
      const fallback = await fetch(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(companyName)}&tags=story&numericFilters=created_at_i>${ninetyDaysAgo}&hitsPerPage=8`
      );
      if (fallback.ok) {
        data = await fallback.json();
        hits = data.hits || [];
      }
    }

    return hits.map(h => ({
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      date: h.created_at,
      points: h.points,
      comments: h.num_comments,
      source: 'Hacker News',
    }));
  } catch {
    return [];
  }
}

async function fetchNews(companyName) {
  if (!NEWS_API_KEY) return [];
  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName + ' engineering OR technology')}&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map(a => ({ title: a.title, url: a.url, date: a.publishedAt, source: a.source?.name }));
  } catch {
    return [];
  }
}

async function gatherCompanyData(companyName) {
  const suggestion = await suggestDomain(companyName);
  const domain = suggestion?.domain || `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
  const logo = suggestion?.logo || null;

  const [clearbitData, hnNews, newsArticles] = await Promise.all([
    enrichCompany(domain),
    fetchHackerNews(companyName),
    fetchNews(companyName)
  ]);

  const isTech = clearbitData?.category?.sector === 'Technology' ||
    clearbitData?.tech?.length > 0 ||
    (clearbitData?.category?.industry || '').toLowerCase().includes('software');

  const employees = clearbitData?.metrics?.employees || null;
  const engMultiplier = isTech ? 0.25 : 0.15;
  const engHeadcount = employees ? Math.round(employees * engMultiplier) : null;

  return {
    name: clearbitData?.name || suggestion?.name || companyName,
    domain,
    logo_url: clearbitData?.logo || logo,
    description: clearbitData?.description || suggestion?.description || '',
    industry: clearbitData?.category?.industry || '',
    sector: clearbitData?.category?.sector || '',
    employees,
    eng_headcount: engHeadcount,
    location: clearbitData?.geo?.city
      ? `${clearbitData.geo.city}, ${clearbitData.geo.state || ''} ${clearbitData.geo.country || ''}`
      : '',
    founded: clearbitData?.foundedYear || '',
    funding: clearbitData?.metrics?.raised
      ? `$${(clearbitData.metrics.raised / 1000000).toFixed(0)}M`
      : '',
    tech_stack: (clearbitData?.tech || []).slice(0, 10).join(', '),
    social: {
      twitter: clearbitData?.twitter?.handle || '',
      linkedin: clearbitData?.linkedin?.handle || '',
      facebook: clearbitData?.facebook?.handle || ''
    },
    news_headlines: [...hnNews, ...newsArticles].map(n => n.title).slice(0, 10),
    hn_stories: hnNews,
    news_articles: newsArticles,
    clearbit_available: !!clearbitData
  };
}

module.exports = { gatherCompanyData, fetchHackerNews };
