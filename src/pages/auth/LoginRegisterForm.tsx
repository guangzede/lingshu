import { useState } from 'react';
import { View } from '@tarojs/components';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function LoginRegisterForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  return (
    <View className="auth-panel">
      <View className="auth-panel-header">
        <View className="auth-panel-title">{mode === 'login' ? '欢迎回来' : '创建新账号'}</View>
        <View className="auth-panel-desc">
          {mode === 'login' ? '继续你的推演记录' : '加入灵枢开始推演'}
        </View>
      </View>
      <View className="auth-switch">
        <View className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>登录</View>
        <View className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>注册</View>
      </View>
      {mode === 'login' ? <LoginForm /> : <RegisterForm />}
    </View>
  );
}
