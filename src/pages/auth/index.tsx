import Taro from '@tarojs/taro';
import { Button, View } from '@tarojs/components';
import LoginRegisterForm from './LoginRegisterForm';
import { buildApiUrl } from '@/services/api';
import './index.scss';

export default function AuthPage() {
  const handleHealthCheck = async () => {
    try {
      const res = await Taro.request({
        url: buildApiUrl('/health'),
        method: 'GET'
      });
      const ok = res.statusCode === 200;
      Taro.showToast({
        title: ok ? 'health ok' : `health ${res.statusCode}`,
        icon: ok ? 'success' : 'none'
      });
    } catch (error) {
      Taro.showToast({
        title: 'health failed',
        icon: 'none'
      });
    }
  };

  return (
    <View className="auth-page">
      <View className="auth-bg">
        <View className="auth-orb orb-1" />
        <View className="auth-orb orb-2" />
        <View className="auth-grid" />
      </View>
      <View className="auth-shell">
        <View className="auth-hero">
          <View className="auth-badge">灵枢 · 六爻</View>
          <View className="auth-title">重启你的推演之门</View>
          <View className="auth-subtitle">AI 占筮 | 追踪 | 复盘，全链路护航</View>
        </View>
        <View className="auth-card">
          <LoginRegisterForm />
          <View className="auth-health">
            <Button className="auth-health-btn" onClick={handleHealthCheck}>
              测试健康接口
            </Button>
          </View>
        </View>
        <View className="auth-features">
          <View className="auth-feature">灵盘定位：实时观象</View>
          <View className="auth-feature">案库沉淀：回看推演轨迹</View>
          <View className="auth-feature">共振提醒：关键时点提示</View>
        </View>
      </View>
    </View>
  );
}
