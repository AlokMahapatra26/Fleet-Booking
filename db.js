/**
 * Database Layer for Fleet-Booking
 * 100% MongoDB Atlas Cloud Storage (No Local Disk Storage)
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

let mongoClient = null;
let db = null;
let clientsCollection = null;
let isConnected = false;

/**
 * Initialize connection to MongoDB Atlas
 */
async function initDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is missing in .env!');
    return false;
  }

  try {
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });

    await mongoClient.connect();
    db = mongoClient.db('fleet_booking');
    clientsCollection = db.collection('clients');
    isConnected = true;

    // Ensure unique index on slug
    await clientsCollection.createIndex({ slug: 1 }, { unique: true });

    console.log('🌿 [Storage] Connected to MongoDB Atlas (fleet_booking.clients). Pure Cloud Storage active.');
    return true;
  } catch (err) {
    console.error('❌ [MongoDB Atlas Connection Failed]:', err.message);
    isConnected = false;
    return false;
  }
}

/**
 * List all clients for /api/clients
 */
async function getAllClients() {
  if (!isConnected || !clientsCollection) {
    throw new Error('Database not connected to MongoDB Atlas');
  }

  const docs = await clientsCollection.find({}).sort({ updatedAt: -1 }).toArray();
  return docs.map(doc => {
    const content = doc.data || {};
    const slug = doc.slug;
    return {
      slug,
      name: content.brand?.name || slug,
      template: content.template || 'taxi',
      city: content.brand?.locationText || '',
      phone: content.contact?.displayPhone || content.contact?.primaryPhone || '',
      whatsapp: content.contact?.whatsappPhone || '',
      primaryColor: content.brand?.theme?.primary || '#FFD900',
      logoUrl: content.brand?.logoUrl || (content.template === 'travel' ? 'assets/logo-travel.svg' : 'assets/logo-taxi.svg'),
      url: `/?client=${slug}`,
      isDefault: !!doc.isDefault
    };
  });
}

/**
 * Get single client config object by slug
 */
async function getClientConfig(slug) {
  if (!isConnected || !clientsCollection) {
    return null;
  }

  const doc = await clientsCollection.findOne({ slug });
  if (doc && doc.data) {
    return doc.data;
  }
  return null;
}

/**
 * Get default client config (if marked default)
 */
async function getDefaultConfig() {
  if (!isConnected || !clientsCollection) {
    return null;
  }

  const doc = await clientsCollection.findOne({ isDefault: true });
  if (doc && doc.data) {
    return doc.data;
  }
  return null;
}

/**
 * Save client config directly to MongoDB Atlas
 */
async function saveClientConfig(slug, data, isDefault = false) {
  if (!isConnected || !clientsCollection) {
    throw new Error('Database not connected to MongoDB Atlas');
  }

  if (isDefault) {
    // Unset any previous default
    await clientsCollection.updateMany({ isDefault: true }, { $set: { isDefault: false } });
  }

  await clientsCollection.updateOne(
    { slug },
    {
      $set: {
        slug,
        data,
        isDefault: !!isDefault,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log(`🌿 [MongoDB] Successfully saved client config for "${slug}"`);
  return { success: true, slug };
}

/**
 * Delete client config from MongoDB Atlas
 */
async function deleteClientConfig(slug) {
  if (!isConnected || !clientsCollection) {
    throw new Error('Database not connected to MongoDB Atlas');
  }

  const result = await clientsCollection.deleteOne({ slug });
  console.log(`🌿 [MongoDB] Deleted client "${slug}" (count: ${result.deletedCount})`);
  return result.deletedCount > 0;
}

module.exports = {
  initDatabase,
  getAllClients,
  getClientConfig,
  getDefaultConfig,
  saveClientConfig,
  deleteClientConfig,
  isMongoConnected: () => isConnected
};
