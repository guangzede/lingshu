import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss'

// 导入所有组件
import AIAnalysisCard from '@/components/AIAnalysisCard';
import BottomButtons from '../Liuyao/result/components/BottomButtons';
import BranchRelation from '../Liuyao/result/components/BranchRelation';
import CountInput from '../Liuyao/divination/components/CountInput';
import HumanQACard from '../../components/HumanQACard';
import InfoGrid from '../Liuyao/result/components/InfoGrid';
import ModeSelector from '../Liuyao/divination/components/ModeSelector';
import QuestionCard from '../Liuyao/divination/components/QuestionCard';
import ShakeCoins from '../Liuyao/components/ShakeCoins';
import TimeInput from '../Liuyao/divination/components/TimeInput';
import YaoAnalysis from '../Liuyao/result/components/YaoAnalysis';
import YaoMatrix from '../Liuyao/divination/components/YaoMatrix';

// 导入mock数据
import { mockData, componentMap } from './mockData';

const TestPage: React.FC = () => {
  // 使用React状态来存储组件ID
  const [componentId, setComponentId] = React.useState('');

  // 在组件挂载时获取路由参数
  React.useEffect(() => {
    // 使用Taro的getCurrentInstance获取路由参数
    const instance = Taro.getCurrentInstance();
    if (instance.router && instance.router.params) {
      const id = instance.router.params.id as string;
      setComponentId(id);
    }
  }, []);

  // 根据组件ID获取组件名称
  const componentName = componentMap[componentId as unknown as keyof typeof componentMap];

  // 渲染对应组件
  const renderComponent = () => {
    switch (componentName) {
      case 'AIAnalysisCard':
        return <AIAnalysisCard {...mockData.aiAnalysisCard} />;
      case 'BottomButtons':
        return <BottomButtons {...mockData.bottomButtons} />;
      case 'BranchRelation':
        return <BranchRelation {...mockData.branchRelation} />;
      case 'CountInput':
        return <CountInput {...mockData.countInput} />;
      case 'HumanQACard':
        return <HumanQACard {...mockData.humanQACard} />;
      case 'InfoGrid':
        return <InfoGrid {...mockData.infoGrid} />;
      case 'ModeSelector':
        return <ModeSelector {...mockData.modeSelector} />;
      case 'QuestionCard':
        return <QuestionCard {...mockData.questionCard} />;
      case 'ShakeCoins':
        return <ShakeCoins {...mockData.shakeCoins} />;
      case 'TimeInput':
        return <TimeInput {...mockData.timeInput} />;
      case 'YaoAnalysis':
        return <YaoAnalysis {...mockData.yaoAnalysis} />;
      case 'YaoMatrix':
        return <YaoMatrix {...mockData.yaoMatrix} />;
      default:
        return (
          <View className="default-message">
            <Text>请输入正确的组件ID，例如：/test/1</Text>
            <Text>组件ID对应关系：</Text>
            <Text>1: AIAnalysisCard</Text>
            <Text>2: BottomButtons</Text>
            <Text>3: BranchRelation</Text>
            <Text>4: CountInput</Text>
            <Text>5: HumanQACard</Text>
            <Text>6: InfoGrid</Text>
            <Text>7: ModeSelector</Text>
            <Text>8: QuestionCard</Text>
            <Text>9: ShakeCoins</Text>
            <Text>10: TimeInput</Text>
            <Text>11: YaoAnalysis</Text>
            <Text>12: YaoMatrix</Text>
          </View>
        );
    }
  };

  return (
    <View className="test-page">
      <View className="page-header">
        <Text className="page-title">组件测试页面</Text>
        <Text className="component-info">
          当前测试组件：{componentName || '未知组件'}
        </Text>
      </View>
      <View className="component-container">
        {renderComponent()}
      </View>
    </View>
  );
};

export default TestPage;
