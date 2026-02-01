import React from 'react';
import { View, Text } from '@tarojs/components';
import AIAssistant from '@/components/AIAssistant';
import './index.scss';

interface AIAnalysisCardProps {
  question: string;
  result: any;
  isFromHistory?: boolean;
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ question, result, isFromHistory = false }) => {
  // 生成 AI 提示词的逻辑保留在此，供 AIAssistant 复用
  const generateAIPrompt = () => {
    if (!result) return '';
    const sections: string[] = [];
    sections.push('【六爻排盘基本信息】');
    sections.push(`此刻想法: ${question ||  '未填写'}`);
    sections.push(`记录时间: ${result.lunar?.date || ''} ${result.timeValue || ''}`);
    sections.push(`农历: ${result.lunar?.month || ''}月${result.lunar?.day || ''}日${result.lunar?.jieQi ? `（${result.lunar.jieQi}）` : ''}`);
    sections.push('');
    sections.push('【四柱干支】');
    if (result.timeGanZhi) {
      sections.push(`年柱: ${result.timeGanZhi.year?.stem || ''}${result.timeGanZhi.year?.branch || ''}`);
      sections.push(`月柱: ${result.timeGanZhi.month?.stem || ''}${result.timeGanZhi.month?.branch || ''}`);
      sections.push(`日柱: ${result.timeGanZhi.day?.stem || ''}${result.timeGanZhi.day?.branch || ''}`);
      sections.push(`时柱: ${result.timeGanZhi.hour?.stem || ''}${result.timeGanZhi.hour?.branch || ''}`);
    }
    sections.push('');
    if (result.shenShas && result.shenShas.length > 0) {
      sections.push('【神煞】');
      sections.push(result.shenShas.map((s: any) => `${s.name}(${s.branch})`).join('、'));
      sections.push('');
    }
    sections.push('【卦象信息】');
    sections.push(`本卦: ${result.hex?.name || ''}`);
    sections.push(`变卦: ${result.variant?.name || '无'}`);
    sections.push(`卦宫: ${result.hex?.palace || ''} (${result.hex?.palaceCategory || ''})`);
    sections.push(`世爻: ${result.hex?.shiIndex !== undefined ? ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'][result.hex.shiIndex] : ''}`);
    sections.push(`应爻: ${result.hex?.yingIndex !== undefined ? ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'][result.hex.yingIndex] : ''}`);
    sections.push('');
    sections.push('【六爻详细】');
    const yaoLabels = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'];
    if (result.yaos && Array.isArray(result.yaos)) {
      result.yaos.forEach((yao: any, index: number) => {
        const parts = [
          yaoLabels[index],
          yao.isMoving ? '(动爻)' : '(静爻)',
          yao.sixGod ? `${yao.sixGod}` : '',
          yao.relation ? `${yao.relation}` : '',
          yao.branch ? `${yao.branch}` : '',
          yao.stem ? `${yao.stem}` : '',
          yao.fiveElement ? `${yao.fiveElement}` : '',
          yao.seasonStrength ? `${yao.seasonStrength}` : '',
          yao.changsheng ? `${yao.changsheng}` : ''
        ];
        sections.push(parts.filter(p => p).join(' '));
        if (yao.fuShen && yao.fuShen.branch) {
          sections.push(`  伏神: ${yao.fuShen.relation || ''} ${yao.fuShen.branch || ''} ${yao.fuShen.stem || ''}`);
        }
      });
    }
    sections.push('');
    sections.push('【日支时支关系】');
    const dayBranch = result.timeGanZhi?.day?.branch;
    const hourBranch = result.timeGanZhi?.hour?.branch;
    if (dayBranch && result.yaos) {
      sections.push(`日支 ${dayBranch} 与卦爻:`);
      result.yaos.forEach((yao: any, index: number) => {
        if (yao.branch) {
          sections.push(`  ${yaoLabels[index]}(${yao.branch})`);
        }
      });
    }
    if (hourBranch && result.yaos) {
      sections.push(`时支 ${hourBranch} 与卦爻:`);
      result.yaos.forEach((yao: any, index: number) => {
        if (yao.branch) {
          sections.push(`  ${yaoLabels[index]}(${yao.branch})`);
        }
      });
    }
    sections.push('');
    sections.push('【爻位分析要点】');
    sections.push('- 世爻应爻关系');
    sections.push('- 用神取定与旺衰');
    sections.push('- 动爻对静爻的生克制化');
    sections.push('- 日月建对各爻的影响');
    sections.push('- 六神辅助判断吉凶');
    sections.push('');
    sections.push('【分析要求】');
    sections.push('请根据以上六爻排盘信息，结合传统六爻断卦原则，对求测事项进行详细分析。');
    sections.push('分析要点：');
    sections.push('1. 用神取定及旺衰判断');
    sections.push('2. 世应关系及动静分析');
    sections.push('3. 日月建的作用力');
    sections.push('4. 动爻对卦象的影响');
    sections.push('5. 综合判断吉凶及发展趋势');
    sections.push('');
    sections.push('请用中文回答，语言要通俗易懂，避免过于专业的术语，给出具体的建议和预测。');
    return sections.join('\n');
  };

  return (
    <View className="ai-analysis-card glass-card">
      <View className="card-header">
        <Text className="card-title">智能参谋</Text>
        <Text className="card-desc">汲取传统智慧，辅助生活决策</Text>
      </View>
      <View className="card-body">
        <Text className="label">此刻想法</Text>
        <Text className="content">{question || '暂无填写'}</Text>
        <Text className="label" style={{ marginTop: '12px' }}>解读概要:</Text>
        <Text className="content subtle">本卦：{result?.hex?.name ? `${result.hex.name}     变卦： ${result.variant?.name || '—'}` : '等待生成'}</Text>
        {/* 只保留全局 AIAssistant 组件 */}
        <AIAssistant question={question} result={result} generatePrompt={generateAIPrompt} isFromHistory={isFromHistory} />
      </View>
    </View>
  );
};

export default AIAnalysisCard;
