/**
 * HomesKE blog posts — default / fallback content when Firestore is empty or offline.
 * Admins can manage live posts in Admin → Blog (collection `blogPosts`).
 * Firestore posts override entries here when the slug matches.
 *
 * Each post needs:
 * - slug: URL segment (lowercase, hyphens). Must be unique. Example: "my-new-post"
 * - title: Headline on listing + article page
 * - excerpt: Short summary (SEO + listing card)
 * - category: Label for filters/display (any string, e.g. "Buyers", "News")
 * - date: ISO date string YYYY-MM-DD
 * - readTime: Display only, e.g. "5 min read"
 * - body: Array of paragraph strings (each becomes a <p>)
 *
 * URL: /desktop/blog/<slug>
 *
 * After editing: save, run `npm run build` (or dev server reloads), deploy if production.
 */
export const blogPosts = [
  {
    slug: 'nairobi-neighbourhood-guide-2026',
    title: 'Which Nairobi neighbourhoods are best for first-time buyers in 2026?',
    excerpt:
      'A practical look at commute times, schools, and price bands so you can shortlist areas before you tour.',
    category: 'Buyers',
    date: '2026-03-18',
    readTime: '6 min read',
    body: [
      'Start with how you actually live: work location, school runs, and weekend routines. Areas that look affordable on paper can cost more once you factor in fuel and time.',
      'Westlands and Kilimani remain popular for walkable amenities, while satellite towns appeal when budget is tight and you are comfortable with a longer commute.',
      'Always cross-check listing prices with recent comparable sales in the same estate—not just the same suburb name.',
    ],
  },
  {
    slug: 'rent-vs-buy-kenya',
    title: 'Rent vs buy in Kenya: how to decide without the hype',
    excerpt:
      'A simple framework using tenure, cash flow, and interest rates—so the decision fits your goals, not trends.',
    category: 'Finance',
    date: '2026-02-22',
    readTime: '5 min read',
    body: [
      'Buying builds equity but ties up capital and maintenance. Renting preserves flexibility if your job or family plans might change in the next two to three years.',
      'Model total monthly cost: mortgage or rent, service charges, insurance, and a maintenance reserve for owners.',
      'If mortgage rates move, stress-test +2% on your rate so you are not forced to sell in a downturn.',
    ],
  },
  {
    slug: 'staging-tips-sell-faster',
    title: 'Seven staging tips that help Kenyan homes sell faster',
    excerpt:
      'Small fixes that improve photos, viewings, and offers—without a full renovation budget.',
    category: 'Sellers',
    date: '2026-01-30',
    readTime: '4 min read',
    body: [
      'Declutter and depersonalise so buyers imagine themselves in the space. Neutral walls photograph better than busy patterns.',
      'Fix obvious leaks, peeling paint, and broken fittings first—they show up in photos and erode trust.',
      'Natural light sells: clean windows, open curtains for viewings, and replace dead bulbs with consistent warm white.',
    ],
  },
  {
    slug: 'title-deed-red-flags',
    title: 'Title deed checks: red flags every buyer should know',
    excerpt:
      'What to verify early so you do not waste time on properties that cannot close cleanly.',
    category: 'Legal',
    date: '2025-12-12',
    readTime: '7 min read',
    body: [
      'Confirm the seller matches the register, and that parcel boundaries and user class align with what you are being sold.',
      'Encumbrances, charges, and caveats are not always deal-breakers—but you need a clear plan to discharge them before settlement.',
      'Use a qualified advocate for the search and transfer; shortcuts here are expensive later.',
    ],
  },
];
