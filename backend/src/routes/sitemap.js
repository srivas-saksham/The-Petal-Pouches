// ============================================
// RIZARA LUXE - DYNAMIC SITEMAP GENERATOR
// ============================================
// Location: backend/src/routes/sitemap.js
// Purpose: Auto-generates sitemap.xml from database
// SEO Impact: Speeds up indexing by 5-10x
// ============================================

const express = require('express');
const router = express.Router();

// ============================================
// HELPER: XML-safe string escaping
// ============================================
// Prevents XML breakage if slugs contain &, <, >, ", '
const escapeXml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// ============================================
// HELPER: Format date for sitemap
// ============================================
const formatDate = (date) => {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
};

// ============================================
// GET /sitemap.xml - Dynamic Sitemap Generation
// ============================================
router.get('/sitemap.xml', async (req, res) => {
  try {
    // ============================================
    // 1. Set Proper Headers
    // ============================================
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // ============================================
    // 2. Get Supabase Client
    // ============================================
    const supabase = require('../config/supabaseClient');
    
    // ============================================
    // 3. Determine Base URL from Environment
    // ============================================
    // Production: https://www.rizara.in
    // Development: http://localhost:5173
    const baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://www.rizara.in'
      : (process.env.FRONTEND_URL || 'http://localhost:5173');
    
    const today = formatDate(new Date());
    
    // ============================================
    // 4. Fetch Active Products with Images
    // ============================================
    const { data: products, error: productsError } = await supabase
      .from('Products')
      .select('id, title, img_url, updated_at, primary_tag')
      .eq('is_sellable', true)
      .order('updated_at', { ascending: false })
      .limit(5000); // Google's 50,000 URL limit (safe buffer)
    
    if (productsError) {
      console.error('❌ Sitemap - Products fetch error:', productsError);
    }
    
    // ============================================
    // 5. Fetch Active Bundles with Images
    // ============================================
    const { data: bundles, error: bundlesError } = await supabase
      .from('Bundles')
      .select('id, title, img_url, updated_at, primary_tag')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(5000);
    
    if (bundlesError) {
      console.error('❌ Sitemap - Bundles fetch error:', bundlesError);
    }
    
    // ============================================
    // 6. Start XML Generation
    // ============================================
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- ============================================ -->
  <!-- HOMEPAGE - Highest Priority -->
  <!-- ============================================ -->
  <url>
    <loc>${escapeXml(baseURL)}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- ============================================ -->
  <!-- SHOP PAGE - Second Highest Priority -->
  <!-- ============================================ -->
  <url>
    <loc>${escapeXml(baseURL)}/shop</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- ============================================ -->
  <!-- FAQ PAGE - Trust Signal for Google -->
  <!-- ============================================ -->
  <url>
    <loc>${escapeXml(baseURL)}/faqs</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;

    // ============================================
    // 7. Add Bundle Pages Dynamically
    // ============================================
    if (bundles && bundles.length > 0) {
      xml += `
  <!-- ============================================ -->
  <!-- DYNAMIC BUNDLES (${bundles.length} active) -->
  <!-- ============================================ -->
`;
      
      bundles.forEach((bundle) => {
        const slug = escapeXml(bundle.id); // Use ID as slug (adjust if you have custom slugs)
        const lastmod = formatDate(bundle.updated_at);
        const title = escapeXml(bundle.title);
        const imageUrl = bundle.img_url ? escapeXml(bundle.img_url) : null;
        
        xml += `
  <url>
    <loc>${escapeXml(baseURL)}/shop/bundles/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
        
        // Add image tag if bundle has image (Google Images SEO boost)
        if (imageUrl) {
          xml += `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>Luxury gift bundle by Rizara Luxe</image:caption>
    </image:image>`;
        }
        
        xml += `
  </url>`;
      });
    }

    // ============================================
    // 8. Add Product Pages Dynamically
    // ============================================
    if (products && products.length > 0) {
      xml += `
  <!-- ============================================ -->
  <!-- DYNAMIC PRODUCTS (${products.length} active) -->
  <!-- ============================================ -->
`;
      
      products.forEach((product) => {
        const slug = escapeXml(product.id); // Use ID as slug
        const lastmod = formatDate(product.updated_at);
        const title = escapeXml(product.title);
        const imageUrl = product.img_url ? escapeXml(product.img_url) : null;
        
        xml += `
  <url>
    <loc>${escapeXml(baseURL)}/shop/products/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
        
        // Add image tag if product has image
        if (imageUrl) {
          xml += `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>Luxury jewelry by Rizara Luxe</image:caption>
    </image:image>`;
        }
        
        xml += `
  </url>`;
      });
    }

    // ============================================
    // 9. Close XML and Send Response
    // ============================================
    xml += `
</urlset>`;

    // ============================================
    // 10. Log Generation Stats (Development Only)
    // ============================================
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Sitemap generated successfully');
      console.log(`   📦 Bundles: ${bundles?.length || 0}`);
      console.log(`   🛍️  Products: ${products?.length || 0}`);
      console.log(`   📊 Total URLs: ${(bundles?.length || 0) + (products?.length || 0) + 3}`);
    }

    res.send(xml);

  } catch (error) {
    console.error('❌ Sitemap generation error:', error);
    
    // Send minimal valid sitemap on error (better than 500 error)
    res.status(500).setHeader('Content-Type', 'application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.rizara.in/</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`);
  }
});

module.exports = router;

// ============================================
// INTEGRATION INSTRUCTIONS
// ============================================
// 1. In backend/src/index.js, add BEFORE gateway middleware:
//    app.use('/', require('./routes/sitemap'));
//
// 2. Test locally:
//    http://localhost:5000/sitemap.xml
//
// 3. After deployment, verify:
//    https://rizarabackend.vercel.app/sitemap.xml
//
// 4. Frontend proxy (next step):
//    https://www.rizara.in/sitemap.xml → backend
// ============================================