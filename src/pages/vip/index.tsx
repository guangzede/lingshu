import { useEffect, useMemo, useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { exchangeVip, fetchUserInfo } from '../../services/auth';
import './index.scss';

type ExchangeType = 'weekly' | 'monthly' | 'ticket';

const EXCHANGE_OPTIONS: Array<{
  label: string;
  value: ExchangeType;
  cost: number;
  desc: string;
  tag: string;
}> = [
  { label: '周卡', value: 'weekly', cost: 3000, desc: '7 天会员权限', tag: '限时' },
  { label: '月卡', value: 'monthly', cost: 20000, desc: '30 天会员权限', tag: '超值' },
  { label: '单次券', value: 'ticket', cost: 50, desc: '增加 1 次推演次数', tag: '速用' },
];

const formatDate = (timestamp?: number) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function VipPage() {
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loadingType, setLoadingType] = useState<ExchangeType | null>(null);

  useEffect(() => {
    const init = async () => {
      const info = Taro.getStorageSync('userInfo');
      if (!info || !info.id) {
        Taro.redirectTo({ url: '/pages/auth/index' });
        return;
      }
      try {
        const latestStatus = await fetchUserInfo();
        const merged = { ...(info || {}), ...(latestStatus || {}) };
        setUser(merged);
        setStatus(latestStatus);
        Taro.setStorageSync('userInfo', merged);
      } catch {
        Taro.redirectTo({ url: '/pages/auth/index' });
      }
    };
    init();
  }, []);

  const isVip = useMemo(() => {
    const expireAt = user?.memberExpireAt || status?.memberExpireAt || 0;
    const level = user?.memberLevel ?? status?.memberLevel ?? 0;
    return level === 1 && expireAt > Date.now();
  }, [user, status]);

  const balance = user?.lingshi ?? status?.lingshi ?? 0;
  const memberExpireAt = user?.memberExpireAt ?? status?.memberExpireAt;

  const handleExchange = async (type: ExchangeType, cost: number) => {
    if (!user || loadingType) return;
    if ((balance ?? 0) < cost) {
      Taro.showToast({ title: '灵石不足', icon: 'none' });
      return;
    }

    const modal = await Taro.showModal({
      title: '确认兑换',
      content: `确定使用 ${cost} 灵石兑换${
        type === 'ticket' ? '单次使用券' : type === 'weekly' ? '周会员' : '月会员'
      }？`,
      confirmText: '确认',
      cancelText: '取消'
    });

    if (!modal.confirm) return;

    setLoadingType(type);
    try {
      const res = await exchangeVip(type);
      if (res?.code === 200) {
        Taro.showToast({ title: '兑换成功', icon: 'success' });
        const latestStatus = await fetchUserInfo();
        const merged = { ...(Taro.getStorageSync('userInfo') || {}), ...(latestStatus || {}) };
        setUser(merged);
        setStatus(latestStatus);
        Taro.setStorageSync('userInfo', merged);
      } else {
        Taro.showToast({ title: res?.message || '兑换失败', icon: 'none' });
      }
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '兑换异常', icon: 'none' });
    } finally {
      setLoadingType(null);
    }
  };

  if (!user) return null;

  return (
    <View className="vip-page">
      <View className="vip-hero">
        <View className="vip-hero__glow" />
        <Text className="vip-hero__title">会员中心</Text>
        <Text className="vip-hero__subtitle">解锁更深层的卦象指引</Text>
        <View className="vip-hero__card">
          <View className="vip-hero__card-left">
            <Text className="vip-hero__label">当前状态</Text>
            <Text className="vip-hero__value">{isVip ? '已开通' : '未开通'}</Text>
            <Text className="vip-hero__hint">到期时间：{formatDate(memberExpireAt)}</Text>
          </View>
          <View className="vip-hero__card-right">
            <Text className="vip-hero__label">灵石余额</Text>
            <Text className="vip-hero__value">{balance}</Text>
            <Text className="vip-hero__hint">可用于兑换会员与券</Text>
          </View>
        </View>
      </View>

      <View className="vip-section">
        <Text className="vip-section__title">会员权益</Text>
        <View className="vip-benefits">
          <View className="vip-benefit">
            <Text className="vip-benefit__title">高级断语</Text>
            <Text className="vip-benefit__desc">更深层卦象解读与趋势提示</Text>
          </View>
          <View className="vip-benefit">
            <Text className="vip-benefit__title">专属配额</Text>
            <Text className="vip-benefit__desc">会员免扣费，次数不受限</Text>
          </View>
          <View className="vip-benefit">
            <Text className="vip-benefit__title">优先体验</Text>
            <Text className="vip-benefit__desc">新功能先行开放测试</Text>
          </View>
        </View>
      </View>

      <View className="vip-section">
        <Text className="vip-section__title">当前配额</Text>
        <View className="vip-quota">
          <View className="vip-quota__item">
            <Text className="vip-quota__label">每日免费</Text>
            <Text className="vip-quota__value">{status?.dailyFreeQuota ?? 0}</Text>
          </View>
          <View className="vip-quota__item">
            <Text className="vip-quota__label">赠送次数</Text>
            <Text className="vip-quota__value">{status?.bonusQuota ?? 0}</Text>
          </View>
          <View className="vip-quota__item">
            <Text className="vip-quota__label">是否可用</Text>
            <Text className="vip-quota__value">{status?.canDivine ? '可排盘' : '不可排盘'}</Text>
          </View>
          <View className="vip-quota__item vip-quota__full">
            <Text className="vip-quota__label">提示</Text>
            <Text className="vip-quota__value">{status?.reason || '—'}</Text>
          </View>
        </View>
      </View>

      <View className="vip-section">
        <Text className="vip-section__title">灵石兑换</Text>
        <View className="vip-exchange">
          {EXCHANGE_OPTIONS.map((opt) => {
            const disabled = loadingType !== null || (balance ?? 0) < opt.cost;
            return (
              <View key={opt.value} className="vip-exchange__card">
                <View className="vip-exchange__tag">{opt.tag}</View>
                <Text className="vip-exchange__title">{opt.label}</Text>
                <Text className="vip-exchange__desc">{opt.desc}</Text>
                <View className="vip-exchange__price">
                  <Text className="vip-exchange__price-num">{opt.cost}</Text>
                  <Text className="vip-exchange__price-unit">灵石</Text>
                </View>
                <Button
                  className={disabled ? 'vip-exchange__btn vip-exchange__btn--disabled' : 'vip-exchange__btn'}
                  disabled={disabled}
                  onClick={() => handleExchange(opt.value, opt.cost)}
                >
                  {loadingType === opt.value ? '兑换中...' : '立即兑换'}
                </Button>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
