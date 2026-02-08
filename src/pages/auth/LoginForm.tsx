import { useEffect, useState } from 'react';
import { View, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { login, getToken } from '../../services/auth';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (token) {
      Taro.redirectTo({ url: '/pages/profile/index' });
    }
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!username || !password) {
      setError('用户名和密码必填');
      return;
    }
    try {
      const res = await login(username, password);
      if (res?.token) {
        Taro.showToast({ title: '登录成功', icon: 'success' });
        Taro.redirectTo({ url: '/pages/profile/index' });
      } else {
        setError(res?.message || '登录失败');
      }
    } catch (e: any) {
      setError(e?.message || '登录异常');
    }
  };

  return (
    <View className="auth-form">
      <Input
        className="auth-input"
        placeholder="用户名"
        value={username}
        onInput={e => setUsername(e.detail.value)}
      />
      <Input
        className="auth-input"
        placeholder="密码"
        type="password"
        value={password}
        onInput={e => setPassword(e.detail.value)}
      />
      {error && <View className="auth-error">{error}</View>}
      <Button className="auth-btn" onClick={handleLogin}>登录</Button>
    </View>
  );
}
