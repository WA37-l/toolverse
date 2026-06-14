const fs = require('fs');
const path = require('path');

try {
    // 1. 读取文章列表
    const articles = JSON.parse(fs.readFileSync('articles.json', 'utf8'));
    
    // 2. 读取 HTML 模板
    let htmlTemplate = fs.readFileSync('index.html', 'utf8');
    
    // 3. 确保 article 文件夹存在
    const articleDir = 'article';
    if (!fs.existsSync(articleDir)) {
        fs.mkdirSync(articleDir);
    }

    // 4. 循环生成文章页面
    articles.forEach(article => {
        // 替换占位符
        let newHtml = htmlTemplate.replace('<div id="root"></div>', `
            <div id="root">
                <div style="max-width: 800px; margin: 40px auto; padding: 20px; font-family: sans-serif;">
                    <h1 style="font-size: 28px; margin-bottom: 10px;">${article.title}</h1>
                    <p style="color: #999; font-size: 14px; margin-bottom: 20px;">发布于 ${article.date}
                    <div style="line-height: 1.8; color: #333;">
                        ${article.content}
                    </div>
                </div>
            </div>
        `);

        // 写入文件
        fs.writeFileSync(path.join(articleDir, `${article.id}.html`), newHtml);
    });

    console.log(`✅ 成功生成 ${articles.length} 篇文章！`);

    // 5. 生成 sitemap.xml (可选，但推荐)
    const DOMAIN = 'https://tverse.online'; // 注意：这里改成你的真实域名
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
    console.error(err); // 这会打印出具体的错误位置
    process.exit(1); // 告诉 Actions 任务失败
}