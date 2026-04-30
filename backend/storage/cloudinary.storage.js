/**
 * Cloudinary Storage Adapter
 * 
 * Para usar Cloudinary:
 * 1. npm install cloudinary
 * 2. Agregar credenciales en .env:
 *    - CLOUDINARY_CLOUD_NAME=tu_cloud_name
 *    - CLOUDINARY_API_KEY=tu_api_key
 *    - CLOUDINARY_API_SECRET=tu_api_secret
 * 3. Cambiar STORAGE_PROVIDER=cloudinary en .env
 * 
 * const cloudinary = require('cloudinary').v2;
 * 
 * // Configurar en config/supabase.js o crear config/cloudinary.js
 * cloudinary.config({
 *   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 *   api_key: process.env.CLOUDINARY_API_KEY,
 *   api_secret: process.env.CLOUDINARY_API_SECRET
 * });
 * 
 * module.exports = {
 *   async upload(buffer, fileName, contentType) {
 *     // Cloudinary requiere upload desde ruta temporal o base64
 *     // Este es un ejemplo básico - ajustar según necesidades
 *     const result = await cloudinary.uploader.upload(`data:${contentType};base64,${buffer.toString('base64')}`, {
 *       public_id: fileName.replace(/\.[^/.]+$/, ''),
 *       folder: 'animales',
 *       resource_type: 'image'
 *     });
 *     
 *     return { url: result.secure_url };
 *   },
 * 
 *   async delete(publicId) {
 *     await cloudinary.uploader.destroy(publicId);
 *     return { success: true };
 *   },
 * 
 *   getProviderName() {
 *     return 'cloudinary';
 *   }
 * };
 */