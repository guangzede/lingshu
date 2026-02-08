import Taro from '@tarojs/taro';

const runtimeEnv = typeof process !== 'undefined' ? process.env : {};
const BASE_URL = (runtimeEnv as any).TARO_APP_API_BASE || 'http://localhost:8787';

function getToken() {
  return Taro.getStorageSync('token') || '';
}

function setToken(token: string) {
  Taro.setStorageSync('token', token);
}

function setUserInfo(user: any) {
  Taro.setStorageSync('userInfo', user);
}

function getStoredUserInfo() {
  return Taro.getStorageSync('userInfo');
}

function unwrapResponse(res: any) {
  if (!res) return null;
  if (res.code === 200) return res.data;
  throw new Error(res.message || '请求失败');
}

// 通用请求，自动带token，处理token过期自动续期
async function requestWithAuth(options: Taro.request.Option & { retry?: boolean }): Promise<any> {
  const token = getToken();
  const headers = { ...options.header, Authorization: `Bearer ${token}` };
  try {
    const res = await Taro.request({ ...options, header: headers });
    if (res.statusCode === 401 && !options.retry) {
      // token过期，尝试自动续期
      const newToken = await refreshToken();
      if (newToken) {
        setToken(newToken);
        return requestWithAuth({ ...options, retry: true });
      }
    }
    return res.data;
  } catch (e) {
    throw e;
  }
}

// 登录
export async function login(username: string, password: string) {
  const res = await Taro.request({
    url: `${BASE_URL}/api/auth/login`,
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
    url: `${BASE_URL}/api/auth/register`,
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
    url: `${BASE_URL}/api/member/status`,
    method: 'GET',
  });
  return unwrapResponse(res);
}

// 更新用户信息
export async function updateUserInfo(data: any) {
  const res = await requestWithAuth({
    url: `${BASE_URL}/api/member/update`,
    method: 'POST',
    data,
  });
  return unwrapResponse(res);
}

// token续期（假设有 /api/auth/refresh-token 接口）
async function refreshToken(): Promise<string | null> {
  const user = getStoredUserInfo();
  if (!user) return null;
  try {
    const res = await Taro.request({
      url: `${BASE_URL}/api/auth/refresh-token`,
      method: 'POST',
      data: { username: user.username },
    });
    const data = res.data?.data;
    if (data?.token) {
      setToken(data.token);
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

// 会员兑换
export async function exchangeVip(type: 'weekly' | 'monthly' | 'ticket') {
  return requestWithAuth({
    url: `${BASE_URL}/api/member/exchange`,
    method: 'POST',
    data: { type },
  });
}

// 获取用户信息（同步本地）
export async function getUserInfo() {
  const res = await fetchUserInfo();
  if (res) {
    const merged = { ...(getStoredUserInfo() || {}), ...res };
    setUserInfo(merged);
    return merged;
  }
  return getStoredUserInfo();
}

export { getToken, setToken, getStoredUserInfo as getLocalUserInfo, setUserInfo, requestWithAuth };
