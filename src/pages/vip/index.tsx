import { useEffect, useState } from 'react';
import { View, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { exchangeVip, getUserInfo, fetchUserInfo } from '../../services/auth';
import './index.scss';

const EXCHANGE_OPTIONS = [
  { label: '兑换周卡', value: 'weekly', cost: 3000 },
  { label: '兑换月卡', value: 'monthly', cost: 20000 },
  { label: '兑换单次使用券', value: 'ticket', cost: 50 },
];

export default function VipPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const info = Taro.getStorageSync('userInfo');
      if (!info || !info.id) {
        Taro.redirectTo({ url: '/pages/auth/index' });
        return;
      }
      try {
        const status = await fetchUserInfo();
        if (!status?.isMember) {
          Taro.redirectTo({ url: '/pages/auth/index' });
          return;
        }
        const merged = await getUserInfo();
        setUser(merged || info);
      } catch {
        Taro.redirectTo({ url: '/pages/auth/index' });
      }
    };
    init();
  }, []);

  const handleExchange = async (type: 'weekly' | 'monthly' | 'ticket', cost: number) => {
    if (!user) return;
    if ((user.lingshi ?? 0) < cost) {
      Taro.showToast({ title: '灵石不足', icon: 'none' });
      return;
    }
    setLoading(true);
    try {
      const res = await exchangeVip(type);
      if (res?.code === 200) {
        Taro.showToast({ title: '兑换成功', icon: 'success' });
        // 刷新用户信息
        const latest = await getUserInfo();
        setUser(latest);
        Taro.setStorageSync('userInfo', latest);
      } else {
        Taro.showToast({ title: res?.message || '兑换失败', icon: 'none' });
      }
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '兑换异常', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <View className="vip-page">
      <View className="vip-balance">当前灵石：{user.lingshi ?? 0}</View>
      {EXCHANGE_OPTIONS.map(opt => (
        <Button
          key={opt.value}
          className="vip-btn"
          disabled={loading}
          onClick={() => handleExchange(opt.value, opt.cost)}
        >
          {opt.label}（{opt.cost}灵石）
        </Button>
      ))}
    </View>
  );
}
