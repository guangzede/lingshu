import Taro from '@tarojs/taro';
import { buildApiUrl } from './api';

function getToken() {
  return Taro.getStorageSync('token') || '';
}

function setToken(token: string) {
  Taro.setStorageSync('token', token);
}

function setUserInfo(user: any) {
  Taro.setStorageSync('userInfo', user);
}

function clearAuth() {
  Taro.removeStorageSync('token');
  Taro.removeStorageSync('userInfo');
}

function getStoredUserInfo() {
  return Taro.getStorageSync('userInfo');
}

function unwrapResponse(res: any) {
  if (!res) return null;
  if (res.code === 200) return res.data;
  throw new Error(res.message || '请求失败');
}

// 通用请求，自动带token
async function requestWithAuth(options: Taro.request.Option): Promise<any> {
  const token = getToken();
  if (!token) {
    clearAuth();
    throw new Error('未授权：请先登录');
  }
  const headers = { ...options.header, Authorization: `Bearer ${token}` };
  try {
    const res = await Taro.request({ ...options, header: headers });
    if (res.statusCode === 401) {
      clearAuth();
      throw new Error(res.data?.message || '未授权：请先登录');
    }
    return res.data;
  } catch (e) {
    throw e;
  }
}

// 登录
export async function login(username: string, password: string) {
  const res = await Taro.request({
    url: buildApiUrl('/auth/login'),
    method: 'POST',
    data: { username, password },
  });
  const data = unwrapResponse(res.data);
  if (data?.token) setToken(data.token);
  if (data?.user) setUserInfo(data.user);
  return data;
}

// 注册
export async function register(username: string, password: string, phone: string, inviteCode?: string) {
  const res = await Taro.request({
    url: buildApiUrl('/auth/register'),
    method: 'POST',
    data: { username, password, phone, inviteCode },
  });
  const data = unwrapResponse(res.data);
  if (data?.token) setToken(data.token);
  if (data?.user) setUserInfo(data.user);
  return data;
}

// 获取用户信息
export async function fetchUserInfo() {
  const res = await requestWithAuth({
    url: buildApiUrl('/member/status'),
    method: 'GET',
  });
  return unwrapResponse(res);
}

// 更新用户信息
export async function updateUserInfo(data: any) {
  const res = await requestWithAuth({
    url: buildApiUrl('/member/profile'),
    method: 'POST',
    data: {
      phone: data?.phone,
      nickname: data?.nickname,
      gender: data?.gender,
      birthday: data?.birthday,
    },
  });
  return unwrapResponse(res);
}


// 会员兑换
export async function exchangeVip(type: 'weekly' | 'monthly' | 'ticket') {
  return requestWithAuth({
    url: buildApiUrl('/member/exchange'),
    method: 'POST',
    data: { type },
  });
}

// 获取用户信息（同步本地）
export async function getUserInfo() {
  const res = await fetchUserInfo();
  if (res?.user) {
    const merged = { ...(getStoredUserInfo() || {}), ...res.user };
    setUserInfo(merged);
    return merged;
  }
  if (res) {
    const merged = { ...(getStoredUserInfo() || {}), ...res };
    setUserInfo(merged);
    return merged;
  }
  return getStoredUserInfo();
}

export { getToken, setToken, getStoredUserInfo, setUserInfo, requestWithAuth, clearAuth };
