import 'dotenv/config';
import prismaPkg from '@prisma/client';

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

function parseKesToInt(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Math.round(value);
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  return Math.round(Number(cleaned));
}

function normalize(ex) {
  return {
    title: ex.title ?? 'Property',
    price: parseKesToInt(ex.price) ?? 0,
    description: ex.raw?.description || ex.address || '',
    pricePerSqft: 0,
    bedrooms: ex.bedrooms ?? 0,
    bathrooms: ex.bathrooms ?? 0,
    area: ex.area ?? 0,
    address: ex.address ?? '',
    city: ex.city ?? null,
    state: 'Kenya',
    zipCode: null,
    latitude: ex.latitude ?? 0,
    longitude: ex.longitude ?? 0,
    images: ex.images ?? [],
    listing_type: ex.listingType ?? 'For Sale',
    property_type: ex.propertyType ?? null,
    days_on_market: 0,
    agent: {
      name: ex.raw?.agentName || 'Unknown',
      phone: ex.raw?.agentPhone || '',
      email: ex.raw?.agentEmail || '',
      avatar: '',
      rating: 0,
      reviews: 0,
      experience: ''
    },
    features: [],
    schools: [],
    similar_properties: [],
    price_history: [],
  };
}

async function importBatch(limit = 100) {
  const staged = await prisma.externalListing.findMany({
    where: { imported: false },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
  let importedCount = 0;
  for (const ex of staged) {
    try {
      const data = normalize(ex);
      await prisma.property.upsert({
        where: { id: ex.id }, // tie to external id to avoid duplicates; can switch to a dedicated mapping
        update: data,
        create: data
      });
      await prisma.externalListing.update({
        where: { id: ex.id },
        data: { imported: true, normalized: true }
      });
      importedCount++;
    } catch (e) {
      console.error('Failed to import listing', ex.url, e.message);
    }
  }
  console.log(`Imported ${importedCount}/${staged.length} listings`);
}

async function run() {
  const batch = Number(process.env.IMPORT_BATCH || 100);
  await importBatch(batch);
}

run()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });


