import 'dotenv/config';
import prismaPkg from '@prisma/client';

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

async function checkStoredData() {
  try {
    console.log('=== CHECKING STORED SCRAPED DATA ===\n');
    
    // Check ExternalListing table
    const externalListings = await prisma.externalListing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`Found ${externalListings.length} external listings:\n`);
    
    externalListings.forEach((listing, i) => {
      console.log(`${i + 1}. ${listing.source.toUpperCase()} - ${listing.title || 'No title'}`);
      console.log(`   URL: ${listing.url}`);
      console.log(`   Price: ${listing.price || 'No price'}`);
      console.log(`   Bedrooms: ${listing.bedrooms || 'N/A'}`);
      console.log(`   Bathrooms: ${listing.bathrooms || 'N/A'}`);
      console.log(`   Images: ${listing.images.length} found`);
      if (listing.images.length > 0) {
        console.log(`   Image URLs: ${listing.images.slice(0, 2).join(', ')}${listing.images.length > 2 ? '...' : ''}`);
      }
      console.log(`   Raw data keys: ${Object.keys(listing.raw || {}).join(', ')}`);
      console.log(`   Created: ${listing.createdAt}`);
      console.log(`   Imported: ${listing.imported ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Check Property table
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    
    console.log(`\n=== PROPERTY TABLE ===`);
    console.log(`Found ${properties.length} properties in main Property table:\n`);
    
    properties.forEach((property, i) => {
      console.log(`${i + 1}. ${property.title}`);
      console.log(`   Price: KSh ${property.price.toLocaleString()}`);
      console.log(`   Images: ${property.images.length} found`);
      if (property.images.length > 0) {
        console.log(`   Image URLs: ${property.images.slice(0, 2).join(', ')}${property.images.length > 2 ? '...' : ''}`);
      }
      console.log(`   Location: ${property.address}, ${property.city || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error checking data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStoredData();
