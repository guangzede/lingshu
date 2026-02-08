import { useEffect, useState } from 'react';
import { View, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { updateUserInfo, getUserInfo, getToken, setUserInfo, clearAuth } from '../../services/auth';
import './index.scss';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});
  const [inviteCode, setInviteCode] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();
      if (!token) {
        Taro.redirectTo({ url: '/pages/auth/index' });
        return;
      }

      try {
        const localUser = Taro.getStorageSync('userInfo');
        if (localUser) {
          setUser(localUser);
          setForm(localUser);
        }
        const latest = await getUserInfo();
        if (latest) {
          setUser(latest);
          setForm(latest);
        }
      } catch (e: any) {
        if (e?.message?.includes('未授权')) {
          clearAuth();
          Taro.redirectTo({ url: '/pages/auth/index' });
          return;
        }
        Taro.showToast({ title: e?.message || '获取用户信息失败', icon: 'none' });
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (user && user.inviteCode) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = origin
        ? `${origin}/#/pages/auth/index?inviteCode=${user.inviteCode}`
        : `/#/pages/auth/index?inviteCode=${user.inviteCode}`;
      setInviteCode(user.inviteCode);
      setShareUrl(url);
    }
  }, [user]);

  const handleShareInvite = async () => {
    if (!shareUrl) {
      Taro.showToast({ title: '暂无可分享的邀请码', icon: 'none' });
      return;
    }
    try {
      await Taro.setClipboardData({ data: shareUrl });
      Taro.showToast({ title: '邀请链接已复制', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '复制失败', icon: 'none' });
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    try {
      const result = await updateUserInfo(form);
      const latest = await getUserInfo();
      setUser(latest || form);
      setEdit(false);
      setUserInfo(latest || form);
      if (result?.bonusAwarded) {
        Taro.showToast({ title: `已奖励${result.bonusAwarded}灵石`, icon: 'success' });
      } else {
        Taro.showToast({ title: '保存成功', icon: 'success' });
      }
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '保存失败', icon: 'none' });
    }
  };

  const handleBackHome = () => {
    Taro.redirectTo({ url: '/pages/index/index' });
  };

  if (loading) return <View>加载中...</View>;
  if (!user) return <View>未登录</View>;

  return (
    <View className="profile-page">
      <View className="profile-hero">
        <View className="profile-avatar">灵</View>
        <View className="profile-hero-info">
          <View className="profile-name">{user.username}</View>
          <View className="profile-subtitle">
            {user.memberLevel === 1 && user.memberExpireAt > Date.now() ? '会员有效' : '普通用户'}
          </View>
        </View>
      </View>

      <View className="profile-card">
        <View className="profile-row">
          <View className="profile-label">称呼</View>
          {edit ? (
            <Input
              className="profile-input"
              value={form.nickname || ''}
              onInput={e => handleChange('nickname', e.detail.value)}
            />
          ) : (
            <View className="profile-value">{user.nickname || '-'}</View>
          )}
        </View>
        <View className="profile-row">
          <View className="profile-label">性别</View>
          {edit ? (
            <Input
              className="profile-input"
              placeholder="男/女/其他"
              value={form.gender || ''}
              onInput={e => handleChange('gender', e.detail.value)}
            />
          ) : (
            <View className="profile-value">{user.gender || '-'}</View>
          )}
        </View>
        <View className="profile-row">
          <View className="profile-label">生日</View>
          {edit ? (
            <Input
              className="profile-input"
              placeholder="YYYY-MM-DD"
              value={form.birthday || ''}
              onInput={e => handleChange('birthday', e.detail.value)}
            />
          ) : (
            <View className="profile-value">{user.birthday || '-'}</View>
          )}
        </View>
        <View className="profile-row">
          <View className="profile-label">手机号</View>
          {edit ? (
            <Input
              className="profile-input"
              value={form.phone || ''}
              onInput={e => handleChange('phone', e.detail.value)}
            />
          ) : (
            <View className="profile-value">{user.phone || '-'}</View>
          )}
        </View>
        <View className="profile-row">
          <View className="profile-label">邀请码</View>
          <View className="profile-value mono">{inviteCode || '-'}</View>
        </View>
        <View className="profile-row">
          <View className="profile-label">邀请链接</View>
          <View className="profile-value link">{shareUrl || '-'}</View>
        </View>
        <Button className="profile-btn ghost" onClick={handleShareInvite}>复制邀请链接</Button>
      </View>

      <View className="profile-card">
        <View className="profile-row">
          <View className="profile-label">购卡状态</View>
          <View className="profile-value">
            {user.memberLevel === 1 && user.memberExpireAt > Date.now() ? '已购卡' : '未购卡'}
          </View>
        </View>
        <View className="profile-row">
          <View className="profile-label">购买日期</View>
          <View className="profile-value">
            {user.memberPurchasedAt ? new Date(user.memberPurchasedAt).toLocaleDateString() : '-'}
          </View>
        </View>
        <View className="profile-row">
          <View className="profile-label">到期时间</View>
          <View className="profile-value">
            {user.memberExpireAt ? new Date(user.memberExpireAt).toLocaleDateString() : '-'}
          </View>
        </View>
      </View>

      <View className="profile-card grid">
        <View className="profile-metric">
          <View className="profile-metric-value">{user.lingshi ?? '-'}</View>
          <View className="profile-metric-label">灵石</View>
        </View>
        <View className="profile-metric">
          <View className="profile-metric-value">{user.dailyFreeQuota ?? '-'}</View>
          <View className="profile-metric-label">今日免费</View>
        </View>
        <View className="profile-metric">
          <View className="profile-metric-value">{user.bonusQuota ?? '-'}</View>
          <View className="profile-metric-label">赠送配额</View>
        </View>
        <View className="profile-metric">
          <View className="profile-metric-value">{user.invitedCount ?? 0}</View>
          <View className="profile-metric-label">已邀请</View>
        </View>
      </View>

      <View className="profile-actions">
        <Button className="profile-btn secondary" onClick={handleBackHome}>返回首页</Button>
        {edit ? (
          <Button className="profile-btn" onClick={handleSave}>保存</Button>
        ) : (
          <Button className="profile-btn" onClick={() => setEdit(true)}>编辑资料</Button>
        )}
      </View>
    </View>
  );
}
