const supabase = require('../config/supabase');

const DEFAULT_BUCKET = 'animales';

module.exports = {
  async upload(buffer, fileName, contentType = 'image/*', bucketName = DEFAULT_BUCKET) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType,
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl };
  },

  async delete(fileName, bucketName = DEFAULT_BUCKET) {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }

    return { success: true };
  },

  getProviderName() {
    return 'supabase';
  }
};