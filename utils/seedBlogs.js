// The six articles that were hard-coded in the website before the blog became
// editable. Added once, the first time the blogs collection is empty.
import Blog from '../models/Blog.js'

const SEED = [
  {
    "id": "b-seed-1",
    "slug": "moti-nagar-metro-station-on-delhi-metro-blue-line",
    "title": "Moti Nagar Metro Station on Delhi Metro Blue Line",
    "category": "Real Estate News",
    "excerpt": "Explore connectivity, location advantages and the role of the Blue Line in West Delhi real estate.",
    "image": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=90",
    "content": [
      {
        "heading": "Moti Nagar Metro Station and Connectivity",
        "text": "Moti Nagar Metro Station is an important connectivity point on Delhi Metro’s Blue Line. Its location provides convenient access to several residential and commercial areas across West Delhi."
      },
      {
        "heading": "Why Connectivity Matters for Real Estate",
        "text": "Metro connectivity is one of the major factors considered by homebuyers and property investors. Areas with convenient access to public transportation can provide easier daily commuting and better accessibility to important parts of the city."
      },
      {
        "heading": "Real Estate Around Moti Nagar",
        "text": "The Moti Nagar area has a mix of residential and commercial developments. Its proximity to established markets, offices, educational institutions and transportation infrastructure makes the locality an important part of West Delhi’s real estate landscape."
      },
      {
        "heading": "Blue Line Advantage",
        "text": "The Delhi Metro Blue Line connects several important parts of Delhi NCR. For residents, this connectivity can reduce dependence on private transportation and make regular travel more convenient."
      }
    ],
    "author": "HomWisor Insights",
    "status": "published",
    "featured": true,
    "publishedAt": "2026-07-30T06:00:00.000Z"
  },
  {
    "id": "b-seed-2",
    "slug": "bptp-downtown-66-phase-2-is-here",
    "title": "BPTP Downtown 66 Phase 2 Is Here",
    "category": "Gurgaon",
    "excerpt": "A closer look at the new phase and what buyers should know about the Gurgaon development.",
    "image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=90",
    "content": [
      {
        "heading": "BPTP Downtown 66 Phase 2",
        "text": "BPTP Downtown 66 Phase 2 introduces another residential development opportunity in Gurgaon. The project is positioned for buyers looking at residential options in the growing Gurgaon market."
      },
      {
        "heading": "Location and Connectivity",
        "text": "Location and connectivity remain important considerations for anyone evaluating a property in Gurgaon. Access to major roads, commercial districts and everyday amenities can influence the convenience of a residential development."
      },
      {
        "heading": "What Buyers Should Consider",
        "text": "Before making a property decision, buyers should evaluate the project location, available amenities, developer information, pricing, approvals and future infrastructure around the development."
      }
    ],
    "author": "HomWisor Insights",
    "status": "published",
    "featured": false,
    "publishedAt": "2026-07-29T06:00:00.000Z"
  },
  {
    "id": "b-seed-3",
    "slug": "sector-49-gurgaon-real-estate-prices-metro-expansion",
    "title": "Sector 49 Gurgaon: Real Estate Prices & Metro Expansion",
    "category": "Delhi NCR",
    "excerpt": "Understand locality, connectivity and the changing real estate landscape of Sector 49 Gurgaon.",
    "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=90",
    "content": [
      {
        "heading": "Sector 49 Gurgaon",
        "text": "Sector 49 is an established residential locality in Gurgaon with access to residential communities, commercial spaces and daily conveniences."
      },
      {
        "heading": "Connectivity and Infrastructure",
        "text": "Connectivity is an important factor when evaluating Sector 49. Road infrastructure and access to major parts of Gurgaon can influence both end-user convenience and property demand."
      },
      {
        "heading": "Property Buying Considerations",
        "text": "Homebuyers should compare property types, location, amenities, developer background, pricing and connectivity before selecting a property in the area."
      }
    ],
    "author": "HomWisor Insights",
    "status": "published",
    "featured": false,
    "publishedAt": "2026-07-28T06:00:00.000Z"
  },
  {
    "id": "b-seed-4",
    "slug": "how-to-choose-the-right-property-investment-in-ncr",
    "title": "How to Choose the Right Property Investment in NCR",
    "category": "Investment",
    "excerpt": "Key factors to consider before investing in residential or commercial property across NCR.",
    "image": "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?auto=format&fit=crop&w=1600&q=90",
    "content": [
      {
        "heading": "Start With Your Investment Objective",
        "text": "The first step in selecting a property investment is understanding your objective. Different buyers may prioritize rental income, long-term appreciation, personal use or portfolio diversification."
      },
      {
        "heading": "Location Is Important",
        "text": "Location can influence accessibility, demand and the surrounding development environment. Buyers should consider connectivity, employment hubs, social infrastructure and upcoming infrastructure."
      },
      {
        "heading": "Evaluate the Property Carefully",
        "text": "Before investing, review the property configuration, developer information, approvals, pricing, maintenance costs and surrounding infrastructure."
      },
      {
        "heading": "Compare Multiple Options",
        "text": "Comparing multiple properties on location, price, specifications and future development can help buyers understand the differences between available investment opportunities."
      }
    ],
    "author": "HomWisor Insights",
    "status": "published",
    "featured": false,
    "publishedAt": "2026-07-26T06:00:00.000Z"
  },
  {
    "id": "b-seed-5",
    "slug": "5-things-to-check-before-buying-a-property",
    "title": "5 Things to Check Before Buying a Property",
    "category": "Property Guide",
    "excerpt": "A practical checklist covering location, approvals, developer background, pricing and future connectivity.",
    "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=90",
    "content": [
      {
        "heading": "1. Location",
        "text": "Check the property's location and its accessibility to roads, public transportation, schools, hospitals, offices and everyday amenities."
      },
      {
        "heading": "2. Approvals and Documentation",
        "text": "Review the relevant property documentation and approvals before making a purchase decision."
      },
      {
        "heading": "3. Developer Background",
        "text": "Research the developer, previous projects and available project information to understand the development history."
      },
      {
        "heading": "4. Pricing",
        "text": "Compare the property's price with similar properties in the surrounding area. Also consider additional costs associated with purchasing and maintaining the property."
      },
      {
        "heading": "5. Future Connectivity",
        "text": "Consider planned infrastructure and connectivity improvements around the property and understand how they may affect accessibility."
      }
    ],
    "author": "HomWisor Insights",
    "status": "published",
    "featured": false,
    "publishedAt": "2026-07-24T06:00:00.000Z"
  },
  {
    "id": "b-seed-6",
    "slug": "why-new-gurgaon-continues-to-attract-homebuyers",
    "title": "Why New Gurgaon Continues to Attract Homebuyers",
    "category": "Gurgaon",
    "excerpt": "Explore infrastructure, connectivity and residential development shaping New Gurgaon.",
    "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=90",
    "content": [
      {
        "heading": "Growth of New Gurgaon",
        "text": "New Gurgaon has developed into an important residential growth area with expanding residential communities and supporting infrastructure."
      },
      {
        "heading": "Infrastructure and Connectivity",
        "text": "Connectivity to major roads, employment areas and other parts of Gurgaon is an important factor for homebuyers evaluating properties in New Gurgaon."
      },
      {
        "heading": "Residential Development",
        "text": "The area offers different residential options and continues to see development of housing communities and supporting facilities."
      },
      {
        "heading": "Things Homebuyers Should Check",
        "text": "Homebuyers should evaluate the exact location, connectivity, developer details, project specifications, amenities, pricing and surrounding infrastructure before selecting a property."
      }
    ],
    "author": "HomWisor Insights",
    "status": "published",
    "featured": false,
    "publishedAt": "2026-07-22T06:00:00.000Z"
  }
]

export async function seedBlogs() {
  if (await Blog.estimatedDocumentCount()) return
  await Blog.insertMany(SEED.map(b => ({ ...b, publishedAt: new Date(b.publishedAt) })))
  console.log(`📰 Added ${SEED.length} starter blog articles`)
}
