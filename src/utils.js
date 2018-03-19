import JSEncrypt from 'jsencrypt'

/**
 * jQuery.is
 * 匹配 - element是否有某属性
 */
export function matches(el, selector) {
  return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
}

/**
 * 
 * @param {String} parameterName 参数名称
 */
export function getParameters(parameterName) {
  var result = {},
      tmp = [];
  location.search
      .substr(1)
      .split("&")
      .map(function (item) {
        tmp = item.split("=");
        return result[tmp[0]] = decodeURIComponent(tmp[1])
      });
  return result
}

/**
 * 优化事件处理
 * 把触发非常频繁的事件，合并成一次执行
 * @return {object} 
 */
export function debounce(callback, wait, context = this) {
  let timeout = null 
  let callbackArgs = null
  
  const later = () => callback.apply(context, callbackArgs)
  console.log(context)
  return function() {
    callbackArgs = arguments
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 加密
 * @param {要加密的数据} data 
 */
export function encrypt(data) {
  var encrypt;
  var publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDAIpI7ZPsdqlNNCJ5qZChqNis6tiKWdKv8J2G3pd/+GiKRKqFrTnyY7Ux4sk/G890ZcUeKzKkgAYiF2xoY+So0ZFaunvslszjn2B+XTLiZrIoF1KL2kVeHWoxsScyZndNbGf6RWiuon6bu9B9T1GdEkLNV4Z/MJ+xQ+UyI4cva2wIDAQAB";

  encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey)
  
  return encrypt.encrypt(data)
}
