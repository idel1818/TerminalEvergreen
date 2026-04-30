const Anthropic = require('@anthropic-ai/sdk');
const db = require('../database');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a GTM intelligence engine. Given company data, generate a complete sales terminal configuration for that company's sales team. You understand enterprise software sales, competitive dynamics, and GTM strategy deeply. Return ONLY valid JSON matching the schema provided. No preamble, no explanation, no markdown. Just the JSON object.`;

function buildUserPrompt(data) {
  return `Generate a complete GTM Terminal configuration for this company:

COMPANY DATA:
Name: ${data.name}
Domain: ${data.domain}
Description: ${data.description}
Industry: ${data.industry}
Employees: ${data.employees || 'Unknown'}
Engineering headcount estimate: ${data.eng_headcount || 'Unknown'}
Location: ${data.location || 'Unknown'}
Tech stack: ${data.tech_stack || 'Unknown'}
Recent funding: ${data.funding || 'Unknown'}
Recent news headlines: ${(data.news_headlines || []).join('; ') || 'None available'}

Generate the following in JSON format matching this exact schema:
{
  "company": {
    "name": string,
    "domain": string,
    "logo_url": string,
    "description": string,
    "industry": string,
    "employees": number,
    "eng_headcount": number,
    "founded": string,
    "location": string,
    "funding": string,
    "tagline": string,
    "value_proposition": string
  },
  "products": [{ "name": string, "description": string }],
  "competitors": [
    {
      "name": string,
      "valuation": string,
      "arr": string,
      "status": "winning" | "losing",
      "status_label": string,
      "differentiator": string,
      "our_advantage": string,
      "battlecard": {
        "their_strength": string,
        "their_weakness": string,
        "one_line_response": string
      }
    }
  ],
  "selling_points": [
    {
      "title": string,
      "persona": string,
      "one_liner": string,
      "proof": string,
      "next_step": string
    }
  ],
  "objections": [
    {
      "objection": string,
      "response": string,
      "proof": string,
      "ask_next": string
    }
  ],
  "icp": {
    "description": string,
    "min_employees": number,
    "industries": [string],
    "territories": [string],
    "pain_points": [string]
  },
  "target_accounts": [
    {
      "name": string,
      "industry": string,
      "territory": string,
      "eng_headcount": number,
      "icp_score": number,
      "pain_point": string,
      "use_case": string,
      "opening_line": string,
      "lat": number,
      "lng": number
    }
  ],
  "email_templates": [
    {
      "vertical": string,
      "subject": string,
      "body": string
    }
  ],
  "roi_model": {
    "default_headcount": number,
    "default_salary": number,
    "default_maintenance_pct": number,
    "lanes": [
      { "name": string, "default_share": number, "speedup": number, "benchmark": string }
    ]
  },
  "trigger_events": [
    {
      "title": string,
      "date": string,
      "type": string,
      "description": string,
      "urgency": number,
      "action_prompt": string
    }
  ],
  "ticker_messages": [string],
  "battle_map": {
    "hq_locations": [{ "name": string, "lat": number, "lng": number }],
    "deployed_accounts": [string]
  }
}

Generate 6 realistic competitors, 6 selling points across different buyer personas, 5 objections with responses, 20 target accounts with coordinates, 4 email templates for different verticals, 5 trigger events relevant to this company's market, and 3 ticker messages. Make everything specific to this company - not generic. Use your knowledge of the industry to generate accurate competitor names, realistic ICP criteria, and relevant proof points.`;
}

async function generateConfig(companyData) {
  const userPrompt = buildUserPrompt(companyData);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const text = message.content[0].text;
  const inputTokens = message.usage.input_tokens;
  const outputTokens = message.usage.output_tokens;
  const costUsd = (inputTokens * 3 / 1000000) + (outputTokens * 15 / 1000000);

  let config;
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    config = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Failed to parse Claude response as JSON: ' + e.message);
  }

  if (companyData.logo_url) {
    config.company = config.company || {};
    config.company.logo_url = companyData.logo_url;
  }

  config._usage = { inputTokens, outputTokens, costUsd };
  return config;
}

async function composeOutreach(workspaceConfig, accountName, persona, channel) {
  const prompt = `You are a sales copywriter. Using the following company context, write a ${channel || 'email'} for the persona "${persona || 'VP Engineering'}" at "${accountName}".

Company: ${workspaceConfig.company?.name}
Value Proposition: ${workspaceConfig.company?.value_proposition}
Selling Points: ${JSON.stringify(workspaceConfig.selling_points?.slice(0, 3))}
Proof Points: ${workspaceConfig.selling_points?.map(s => s.proof).join('; ')}

Write a compelling, personalized message. Return JSON: { "subject": string, "body": string }`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = message.content[0].text;
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

async function researchAccount(workspaceConfig, accountName) {
  const prompt = `Research the company "${accountName}" and provide sales intelligence for a sales rep at ${workspaceConfig.company?.name}. Return JSON: { "summary": string, "key_people": [{ "name": string, "title": string }], "recent_news": [string], "pain_points": [string], "recommended_approach": string }`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = message.content[0].text;
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

async function extractDocument(content) {
  const prompt = `Extract sales-relevant information from this document. Return JSON with: { "selling_points": [{ "title": string, "persona": string, "one_liner": string, "proof": string, "next_step": string }], "competitors": [{ "name": string, "differentiator": string, "our_advantage": string }], "proof_points": [string], "objections": [{ "objection": string, "response": string }] }. Match the GTM Terminal schema.

Document content:
${content.substring(0, 10000)}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = message.content[0].text;
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { generateConfig, composeOutreach, researchAccount, extractDocument };
