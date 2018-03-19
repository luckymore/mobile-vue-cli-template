import axios from 'axios'
import Mint from 'mint-ui'

axios.defaults.baseURL = 'http://m-eve.jd.com';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.withCredentials = true

axios.interceptors.request.use(function (config) {
  return config;
}, function (error) {
  return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
  let data = response.data
  if (data.state === 0) {
    let returnUrl = location.href       // "http://m-eve.jd.com/dxtyk/index?id=1&channel=pay"

    window.location.href = `https://plogin.m.jd.com/user/login.action?appid=461&returnurl=${encodeURIComponent(returnUrl)}`
    return
  }
  // if (!data.success) Mint.Toast(data.message || '请求失败')
  
  return data
}, function (error) {
  Mint.Toast('网络故障，请重试')
  return Promise.reject(error);
})

export default axios
