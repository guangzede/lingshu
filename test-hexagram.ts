import getHexagramTexts, { getYaoObjectsReversed, reportHexagramsMissingYongMarkers } from './src/utils/hexagramYao'

function showReversed(hexName: string) {
  const t = getHexagramTexts(hexName)
  console.log('—— 卦名:', t.name)
  console.log('彖曰:', t.tuan)
  console.log('象曰:', t.xiang)
  console.log('爻辞（逆序，上爻优先）：')
  const yaos = getYaoObjectsReversed(hexName)
  yaos.forEach((y, i) => {
    const idx = i + 1
    const marker = y.marker ? ` [${y.marker}]` : ''
    console.log(`  ${idx}. ${y.text}${marker}`)
  })
  console.log('\n')
}

showReversed('乾为天')
showReversed('坤为地')
showReversed('风地观')
showReversed('震为雷')

// 输出缺少 用九/用六 标记的卦，便于人工补充
console.log('=== 以下卦缺少用九/用六 标记（需要补充） ===')
const missing = reportHexagramsMissingYongMarkers()
missing.forEach((n) => console.log(' -', n))
