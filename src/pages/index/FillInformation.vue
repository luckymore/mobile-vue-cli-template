<template>
  <div class="page-fill-information">
    <ChoosePackage @on-choose="handleChoosePackage"></ChoosePackage>
    <FormInfo v-model="formData"></FormInfo>
    <div :class="['submit-btn', nonValid && 'submit-active']" @click="submit">立即领卡</div>
  </div>
</template>

<script>
import ChoosePackage from '@/components/ChoosePackage'
import FormInfo from '@/components/FormInfo'
import { Toast } from 'mint-ui'
import bus from './bus.js'
import { encrypt } from '@/utils.js'

export default {
  name: 'FillInformation',
  components: {
    ChoosePackage,
    FormInfo
  },
  data () {
    return {
      result: 'success',
      formData: {},
      nonValid: false,
      pkg: {}
    }
  },
  watch: {
    formData: {
      deep: true,
      handler() {
        this.nonValid = this.nonValidate(false)
      }
    }
  },
  created() {
    bus.$on('pkg-change', pkg => this.pkg = pkg)
  },
  methods: {
    /**
     * 切换资费 - 请求该资费下的手机号
     * @param id 资费套餐id
     */
    handleChoosePackage(id) {

    },
    toast(text, name="exclamation", duration=1500) {
      return Toast({
        message: text,
        iconClass: `iconfont icon-${name}`,
        duration: duration
      })
    },
    /**
     * 校验 - 非空
     */
    nonValidate(msg) {
      let form = this.formData || {}

      if (Object.keys(form.homeLocation || {}).length < 1) {
        console.log('请选择归属地')
        return false
      }

      if (!form.phone) {
        console.log('请选择号码')
        return false
      }

      if (!form.username) {
        console.log('请填写机主姓名')
        return false
      }

      if (!form.idCard) {
        console.log('请填写身份证号码')
        return false
      }

      if (!form.contact) {
        console.log('请填写联系电话')
        return false
      }

      if (Object.keys(form.address || {}).length === 0) {
        console.log('请选择你的配送区/县')
        return false
      }

      if (!form.addressDesc) {
        console.log('请填写详细地址')
        return false
      }

      if (!form.checked) {
        console.log('请勾选《入网协议》')
        return false
      }

      return true
    },
    /**
     * 校验 - 数据合法
     * @param msg false 不显示toast
     */
    validate(msg = true) {
      const regName = /^([a-zA-Z0-9\u4e00-\u9fa5\·]{1,10})$/
      const regCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/
      const regNumber = /^1[3|4|5|7|8]\d{9}$/

      let form = this.formData || {}

      // if (!regName.test(form.username)) {
      //   msg && this.toast('请填写合法的机主姓名')
      //   return false
      // }

      if (!regCard.test(form.idCard)) {
        msg && this.toast('身份证号码格式错误')
        return false
      }

      if (!regNumber.test(form.contact)) {
        msg && this.toast('联系电话格式错误')
        return false
      }

      if (Object.keys(form.address || {}).length < 3) {
        msg && this.toast('请选择你的配送区/县')
        return false
      }

      if (!form.address.area.name) {
        msg && this.toast('请选择你的配送区/县')
        return false
      }

      return true
    },
    getParams() {
      let { homeLocation, phone, username, idCard, contact, address, addressDesc } = this.formData
      let { activeId, id, } = this.pkg
      let { province, city, area } = address
      let { province: homeProvince, city: homeCity } = homeLocation

      if (!homeCity || !homeCity.id) {
        homeCity = homeProvince
      }

      let params = {
        activeId,          // 活动id：
        packageId: id,     // 资费id

        phonenum: phone,   // 选择号码：

        realName: username,         // 真实姓名：
        cardId: encrypt(idCard),    // 身份证号：
        phone: contact,             // 收货人联系电话：        
        
        // 号码归属地
        provinceId: homeProvince.id,       // 省份：
        provinceName: homeProvince.name,   // 省份名称：
        cityId: homeCity.id,               // 地市：
        cityName: homeCity.name,           // 城市名称：

        // 配送地址
        addressProvinceId: province.id,         // 配送省份
        addressCityId: city.id,                 // 配送地市
        addressCountyId: area.id,               // 配送县区
        addressProvinceName: province.name,     // 配送省份名称
        addressCityName: city.name,             // 配送城市名称
        addressCountyName: area.name,           // 配送区县名称
        address: addressDesc,                   // 配送地址：
        
        channel: urlParams.channel,            // 渠道：从链接参数里取值
        orderId: urlParams.orderId
        // postalCode: '10001',        // 收货人邮编：
        // addName: '张宁宁',          // 收货人姓名：
      }
      return params
    },
    submit() {
      if (!this.nonValid) return
      
      if (this.validate()) {
        let params = this.getParams()
        let toast = this.toast("正在校验领取资格...", "clock")

        this.$http.get('/tyk/order', {
            params
          })
          .then(resp => {
            toast.close()
            this.$nextTick(() => {
              this.$router.push({ name: 'Result', params: resp })
            }, 200)
          })
      }
    },
  }
}
</script>

<style lang="less">
  html, body {
    min-height: 100%;
    background: #F3F5F6; 
  }
  .jd-footer {
    padding-bottom: 103px;
  }
  .page-fill-information {
    position: relative;
    // padding-bottom: 103px;
    .submit-btn {
      position: fixed;
      z-index: 99;
      bottom: 0;
      width: 100%;
      height: 103px;
      line-height: 103px;
      text-align: center;
      color: #ccc;
      font-size: 36px;
      background-color: #eee;
    }
    .submit-active {
      color: #fff;
      background-color: #de443b;
    }
  }
</style>
