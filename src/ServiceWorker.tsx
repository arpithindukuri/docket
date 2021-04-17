import axios from 'axios';

const setToken = (token: string) => {
  const AuthToken = `Bearer ${token}`;
  localStorage.setItem('AuthToken', AuthToken);
  axios.defaults.headers.common.Authorization = AuthToken;
};

const clearToken = () => {
  localStorage.removeItem('AuthToken');
  delete axios.defaults.headers.common.Authorization;
};

export { setToken, clearToken };
