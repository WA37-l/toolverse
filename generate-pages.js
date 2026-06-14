const fs = require('fs');
const path = require('path');

try {
    // 1. 读取数据
    const articles = JSON.parse(fs.readFileSync('articles.json', 'utf8'));
    let htmlTemplate = fs.readFileSync('index.html', 'utf8');

    // 2. 准备目录
    const articleDir = 'article';
    if (!fs.existsSync(articleDir)) {
        fs.mkdirSync(articleDir);
    }

    // 3. 生成文章
    articles.forEach(article => {
        // 简单的内容处理，防止 HTML 报错
        const safeContent = article.content || '';
        
        let newHtml = htmlTemplate.replace('<div id="root"></div>', `
            <div id="root">
                <div style="max-width: 800px; margin: 40px auto; padding: 20px; font-family: sans-serif; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h1 style="font-size: 28px; margin-bottom: 10px; color: #333;">${article.title}</h1>
                    <p style="color: #999; font-size: 14px; margin-bottom: 20px;">发布于 ${article.date}
                    <div style="line-height: 1.8; color: #444;">
                        ${safeContent}
                    </div>
                </div>
            </div>
        `);

        fs.writeFileSync(path.join(articleDir, `${article.id}.html`), newHtml);
    });

    console.log(`✅ 成功生成 ${articles.length} 篇文章！`);

    // 4. 生成 Sitemap
    const DOMAIN = 'https://tverse.online'; // 如果你的仓库名不是这个，记得改
    let urls = articles.map(a => `
        <url>
            <loc>${DOMAIN}/article/${a.id}.html</loc>
            <lastmod>${a.date}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
        </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${DOMAIN}/</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  ${urls}
</urlset>`;
    
    fs.writeFileSync('sitemap.xml', sitemap);
    console.log('✅ Sitemap 生成完毕！');

} catch (err) {
    console.error('❌ 发生严重错误：');
    console.error(err); // 打印错误详情
    process.exit(1); // 任务失败
}