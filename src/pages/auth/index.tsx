import { View } from '@tarojs/components';
import LoginRegisterForm from './LoginRegisterForm';
import './index.scss';

export default function AuthPage() {
  return (
    <View className="auth-page">
      <LoginRegisterForm />
    </View>
  );
}
