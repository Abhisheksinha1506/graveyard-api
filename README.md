# GraveyardAPI

GraveyardAPI provides structured data on failed startups and Web3 exploits—the half of the picture that causes survivorship bias. Query thousands of failures across sectors, chains, and decades through a single REST API.

## Features

- **Comprehensive Failure Data**: 15,000+ startup failure records spanning 25 years
- **Web3 Exploit Database**: 2,500+ documented DeFi exploits and protocol hacks
- **Structured Querying**: RESTful API with filters for sector, cause of death, funding, and more
- **Academic-Grade Sources**: Data from SEC EDGAR, Rekt.news, DeFiLlama, Failory, and more
- **Weekly Updates**: Fresh data added weekly with new failures and exploits

## API Endpoints

### Startups
- `GET /startups` - Query failed startup data with filters
- `GET /startups/:id` - Get complete startup profile with post-mortem details

### Web3 Hacks
- `GET /web3/hacks` - Query DeFi exploits with chain and loss filters
- `GET /web3/hacks/:id` - Get full exploit profile with transaction details

## Sample Response

```json
{
  "name": "Quibi",
  "founded": 2018,
  "died": 2020,
  "sector": "media",
  "funding_raised_usd": 1750000000,
  "cause_of_death": "market_timing",
  "country": "US",
  "employees_at_peak": 250,
  "post_mortem_url": "https://failory.com/case-studies/quibi",
  "similar_failures": ["Vine", "Meerkat"]
}
```

## Who Uses This

- **Academic Researchers**: Study failure patterns and build predictive models
- **Investigative Journalists**: Research fraud cases and protocol failures
- **VC Analysts**: Build risk models and due diligence frameworks
- **Quant Funds**: Integrate failure data into trading algorithms

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Components**: Radix UI / shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel (migrating to AWS)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server on port 3001:

```bash
npm run dev -- --port 3001
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Supabase Integration

This project is integrated with Supabase for:
- **Visitor Tracking**: Automatically logs page views to `graveyard_api_visitors`.
- **Waitlist Signups**: Captures researcher interest in `graveyard_api_signups`.
- **Analytics**: Pre-configured views for monitoring API interest.

To set up the environment, copy `.env.example` to `.env.local` and add your Supabase credentials.

## Data Sources

- **SEC EDGAR**: Bankruptcy filings and corporate failure records
- **Rekt.news**: Crowdsourced DeFi exploits and security incidents
- **DeFiLlama Hacks**: Comprehensive database of DeFi protocol hacks
- **Failory**: Post-mortems and case studies on failed startups
- **startup-graveyard (OSS)**: Open source archive of dead companies
- **Web3-Graveyard (OSS)**: Community-maintained database of Web3 failures

## FAQ

- **How fresh is the data?** Updated weekly with new failures and monthly for historical corrections
- **How many records?** 15,000+ startup failures and 2,500+ Web3 exploits (growing weekly)
- **Do I need an API key?** Yes, request one through our early access program
- **Is bulk export available?** CSV exports available for Pro tier users

## Contact

- **LinkedIn**: [Abhishek Sinha](https://www.linkedin.com/in/abhisheksinha1506/)
- **Email**: abhisheksinha1594@gmail.com

---

Currently in early access · Hosted on Vercel · Migrating to AWS for full launch
