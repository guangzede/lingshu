import { useEffect, useState } from 'react';
import { View, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { updateUserInfo, fetchUserInfo, setUserInfo } from '../../services/auth';
  const [inviteCode, setInviteCode] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  // 拉取邀请码（假设邀请码字段为 user.inviteCode）
  useEffect(() => {
    if (user && user.inviteCode) {
      setInviteCode(user.inviteCode);
      setShareUrl(`${window.location.origin}/#/pages/auth/index?inviteCode=${user.inviteCode}`);
    }
  }, [user]);
import './index.scss';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const userInfo = Taro.getStorageSync('userInfo');
    setUser(userInfo);
    setForm(userInfo);
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    try {
      await updateUserInfo(form);
      const latest = await fetchUserInfo();
      setUser(latest?.user || form);
      setEdit(false);
      setUserInfo(latest?.user || form);
      Taro.showToast({ title: '保存成功', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '保存失败', icon: 'none' });
    }
  };

  if (!user) return <View>未登录</View>;

  return (
    <View className="profile-page">
      <View className="profile-row">
        <View className="profile-label">用户名</View>
        <View className="profile-value">{user.username}</View>
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
        <View className="profile-value">{inviteCode || '-'}</View>
      </View>
      <View className="profile-row">
        <Button className="profile-btn" onClick={() => {
          if (shareUrl) {
            Taro.setClipboardData({ data: shareUrl });
            Taro.showToast({ title: '邀请链接已复制', icon: 'success' });
          }
        }}>分享邀请</Button>
      </View>
      {/* 预留可编辑项 */}
      <View className="profile-actions">
        {edit ? (
          <Button className="profile-btn" onClick={handleSave}>保存</Button>
        ) : (
          <Button className="profile-btn" onClick={() => setEdit(true)}>编辑</Button>
        )}
      </View>
    </View>
  );
}
