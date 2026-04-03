const { chromium } = require('playwright');

(async () => {
  console.log('🎨 灵枢项目 - 视觉检测开始');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  // 测试关键页面
  const pages = [
    { name: '首页', url: 'http://localhost:8080' },
    { name: '八字排盘', url: 'http://localhost:8080/pages/bazi/index' },
    { name: '六爻排盘', url: 'http://localhost:8080/pages/Liuyao/index' },
    { name: 'VIP', url: 'http://localhost:8080/pages/vip/index' }
  ];
  
  console.log('📸 开始截图...');
  
  for (const p of pages) {
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.screenshot({ 
        path: `visual-tests/${p.name}.png`,
        fullPage: true 
      });
      console.log(`✅ ${p.name} - 截图成功`);
    } catch (e) {
      console.log(`❌ ${p.name} - 失败: ${e.message}`);
    }
  }
  
  await browser.close();
  console.log('\n✅ 视觉检测完成！');
})();
