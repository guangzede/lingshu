import { useState } from 'react';
import { View } from '@tarojs/components';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function LoginRegisterForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  return (
    <View>
      <View className="auth-switch">
        <View className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>登录</View>
        <View className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>注册</View>
      </View>
      {mode === 'login' ? <LoginForm /> : <RegisterForm />}
    </View>
  );
}
