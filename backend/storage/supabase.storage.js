const supabase = require('../config/supabase');

const BUCKET_NAME = 'animales';

module.exports = {
  async upload(buffer, fileName, contentType = 'image/*') {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType,
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl };
  },

  async delete(fileName) {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
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