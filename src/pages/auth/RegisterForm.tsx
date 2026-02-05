import { useState, useEffect } from 'react';
import { View, Input, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { register } from '../../services/auth';
import MarkdownRenderer from '../../components/MarkdownRenderer';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const agreementMarkdown = `# 用户协议与隐私政策

欢迎使用灵枢！在注册前请仔细阅读以下条款：

## 1. 账户与安全
- 请妥善保管账号密码。
- 不得将账号用于违法用途。

## 2. 数据与隐私
- 我们会保存必要的账号信息以提供服务。
- 不会向第三方出售您的个人信息。

## 3. 免责声明
- 本产品内容仅供参考。
- 请理性使用相关服务。

点击“同意”代表您已阅读并接受以上条款。`;

  // 自动识别url中的邀请码
  useEffect(() => {
    const params = Taro.getCurrentInstance()?.router?.params;
    if (params && params.inviteCode) {
      setInviteCode(params.inviteCode);
    }
  }, []);

  const handleRegister = async () => {
    setError('');
    if (!username || !password) {
      setError('用户名和密码必填');
      return;
    }
    if (!phone) {
      setError('手机号必填');
      return;
    }
    if (!agreed) {
      setError('请先勾选并同意相关协议');
      return;
    }
    try {
      const res = await register(username, password, phone, inviteCode);
      if (res?.token) {
        Taro.showToast({ title: '注册成功', icon: 'success' });
        Taro.redirectTo({ url: '/pages/profile/index' });
      } else {
        setError(res?.message || '注册失败');
      }
    } catch (e: any) {
      setError(e?.message || '注册异常');
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
        type={"password" as 'text' | 'number' | 'idcard' | 'digit' | 'password'}
        value={password}
        onInput={e => setPassword(e.detail.value)}
      />
      <Input
        className="auth-input"
        placeholder="手机号"
        value={phone}
        onInput={e => setPhone(e.detail.value)}
      />
      <Input
        className="auth-input"
        placeholder="邀请码（选填）"
        value={inviteCode}
        onInput={e => setInviteCode(e.detail.value)}
      />
      <View className="auth-agreement">
        <View className={`auth-checkbox ${agreed ? 'checked' : ''}`} onClick={() => setAgreed(!agreed)} />
        <Text className="auth-agreement-text">我已阅读并同意</Text>
        <Text className="auth-agreement-link" onClick={() => setShowAgreement(true)}>《用户协议与隐私政策》</Text>
      </View>
      {/* 预留可编辑项 */}
      {error && <View className="auth-error">{error}</View>}
      <Button className="auth-btn" onClick={handleRegister}>注册</Button>
      {showAgreement && (
        <View className="auth-modal-mask" onClick={() => setShowAgreement(false)}>
          <View className="auth-modal" onClick={e => e.stopPropagation()}>
            <View className="auth-modal-title">协议预览</View>
            <View className="auth-modal-content">
              <MarkdownRenderer content={agreementMarkdown} />
            </View>
            <Button className="auth-modal-btn" onClick={() => setShowAgreement(false)}>关闭</Button>
          </View>
        </View>
      )}
    </View>
  );
}
