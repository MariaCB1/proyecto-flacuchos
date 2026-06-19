require('dotenv').config();

const providerName = process.env.STORAGE_PROVIDER || 'supabase';

let storageAdapter;

switch (providerName) {
  case 'supabase':
    storageAdapter = require('../storage/supabase.storage');
    break;
  default:
    console.warn(`⚠️ Storage provider "${providerName}" no reconocido. Usando Supabase por defecto.`);
    storageAdapter = require('../storage/supabase.storage');
}

module.exports = {
  upload: async (buffer, fileName, contentType, bucketName) => {
    return storageAdapter.upload(buffer, fileName, contentType, bucketName);
  },

  delete: async (fileName, bucketName) => {
    return storageAdapter.delete(fileName, bucketName);
  },

  getProviderName: () => storageAdapter.getProviderName()
};