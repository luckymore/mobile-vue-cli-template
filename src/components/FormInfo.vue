<template>
  <div class="form-info">
    <p class="header">请选择号码</p>
    <div @click="showHomePopup" class="input-field arrow">
      <label>号码归属</label>
      <img src="@/assets/location.png" alt="">
      <span>{{form.homeLocation | toText}}</span>
    </div>
    <mt-field 
      @click.native="numberPickerVisible = true" 
      v-model="formatNumber"
      disableClear 
      class="arrow" label="选择号码" placeholder="点击开始选择号码" 
      readonly/>

    <p class="header">入网信息</p>
    <mt-field v-model="form.username" label="机主姓名" placeholder="请填写身份证件姓名"></mt-field>
    <mt-field v-model="form.idCard" label="身份证号" placeholder="请填写18位身份证号码"></mt-field>
    <mt-field v-model="form.contact" type="number" label="联系电话" placeholder="请输入联系电话"></mt-field>    

    <p class="header">
      配送地址
      <span v-if="scope == 1"><i class="iconfont icon-info"></i>支持全国配送</span>
      <span v-else-if="scope == 2 || scope == 3">仅支持号码归属地配送</span>
    </p>
    <div @click="showAddressPopup" class="input-field arrow">
      <label>所在地区</label>
      <span v-if="Object.keys(form.address).length > 0">{{form.address | toText}}</span>
      <span v-else style="color: #ccc;">请选择区/县</span>
    </div>
    <mt-field v-model="form.addressDesc" label="详细地址" placeholder="请填写街道/镇+村/小区+门牌号"></mt-field>   

    <div class="protocol">
      <i @click="form.checked = !form.checked" :class="['checkbox', form.checked && 'check-active']"></i>
      {{ liability }} <a v-if="protocolImg" @click="goProtocol">《入网协议》</a>
    </div>

    <!-- 归属地 -->
    <CityPicker
      v-model="popupVisible"
      :areaList="areaList"
      :defaultData="defaultData"
      :level="level"
      @on-finish="handleCityPickerChange"
    />

    <!-- 选择号码 -->
    <NumberPicker
      ref="numberPicker"
      :numberPickerVisible.sync="numberPickerVisible"
      @change="onNumberChange"
    />

    <!-- 无归属地范围时，提示用户返回选择活动 -->
    <mt-popup 
      v-model="modalVisible"
      position="center"
      class="diy-modal single-btn"
      style="top: 230px">
      <!-- <header>确定要发起吗？</header> -->
      <p class="modal-con">没有归属地，请返回重新选择</p>
      <!-- <div @click="handelNoneAreaList" class="ensure-btn">确定</div> -->
      <!-- <div class="btns-flexbox"><div class="btn-cancel">取消</div><div class="btn-ensure">确定</div></div> -->
      <div class="btns-flexbox"><div @click="handelNoneAreaList" class="btn-cancel">我知道了</div></div>
    </mt-popup>
  </div>
</template>

<script>
import CityPicker from '@/components/Address'
import NumberPicker from '@/components/NumberPicker'
import { Indicator, Toast } from 'mint-ui'

import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import bus from '@/pages/index/bus.js'

export default {
  name: 'FormInfo',
  components: {
    CityPicker,
    NumberPicker
  },
  filters: {
    toText(obj) {
      return Object.keys(obj).map(v => obj[v].name).join(' ')
    },
  },
  data () {
    return {
      useragent: '',
      protocolImg: '',
      liability: '',
      modalVisible: false,
      scope: 0,        // 1-全国 2-省 3-市
      homeArea: [],     // 归属地范围
      addressArea: [],    // 配送地址范围
      areaList: [],
      level: 2,
      numberPickerVisible: false,  // 选择号码
      popupVisible: false,        // 归属地
      currentInput: '',       // 归属地：home，配送地址：address
      defaultData: [],
      username: '',
      form: {
        homeLocation: {},     // 归属地
        phone: '',
        username: '',
        idCard: '',
        contact: '',           // 联系电话
        address: {},
        addressDesc: '',
        checked: false        // 勾选协议
      },
      position: {}
    }
  },
  computed: {
    formatNumber: {
      get(val) {
        let number = this.form.phone.toString()
        if (!number) return ''
        return [number.substr(0, 3), number.substr(3, 4), number.substr(7, 4)].join('-')
      },
      set(val) {}
    }
  },
  watch: {
    form: {
      deep: true,
      handler: function (newForm, oldForm) {
        this.emitForm(newForm)
      }
    }
  },
  created() {
    let { provinceId, activeId, areaCode } = urlParams
    this.fetchActiveInfo(activeId)
    // 若链接中有 provinceId，则直接请求归属地范围，并显示areaList中第一个省份
    if (provinceId || areaCode) {
      this.fetchHomeArea()
      return
    }

    // 否则，自动定位
    Indicator.open({
      text: '定位中...',
      spinnerType: 'double-bounce'
    });
    // 自动定位
    window.navigator.geolocation.getCurrentPosition(this.geolocation, this.deniedGeolocation)
  },
  mounted() {
  },
  methods: {
    // 无归属地范围时，提示用户返回选择活动
    handelNoneAreaList() {
      window.location.href = '//m-eve.jd.com/tyk/index'
      this.modalVisible = false
    },
    getCity(list, id) {
      let obj = {}
      list.forEach(v => {
        obj[v.id] = v
      })
      return id ? obj[id] : obj
    },
    goProtocol() {
      let imgUrl = this.protocolImg
      this.$router.push({ name: 'Protocol', params: { imgUrl } })
    },
    fetchActiveInfo(activeId) { 
      this.$http.get('/tyk/getActivityInfo', {
          params: {
            activeId,        // 活动id
          }
        })
        .then(resp => {
          let data = resp.datas
          this.scope = data.scope
          this.protocolImg = data.agreementUrl
          this.liability = data.liability
          bus.$emit('package-img', data.feeDetailUrl)
        })
        .catch(error => {
          console.log(error)
        })
    },
    setFirstAsDefault(list) {
      let firstPro = list[0]
      // let firstCity = firstPro.areaList[0]
      let Obj = this.getCity(firstPro.areaList)
      let firstCity = Obj[Object.keys(Obj)[0]]

      // 直辖市，只传省份id
      if ([1, 2, 3, 4].indexOf(+firstPro.id) > -1) {
        this.form.homeLocation = {
          province: { id: firstPro.id, name: firstPro.name }
        }
      } else {
        this.form.homeLocation = {
          province: { id: firstPro.id, name: firstPro.name },
          city: { id: firstCity.id, name: firstCity.name }
        }
      }
      this.fetchAddressArea(firstPro.id)
    },
    fetchHomeArea() {
      let { areaCode, cityId , activeId, provinceId } = urlParams

      this.$http.get('/tyk/getPhoneNumberArea', {
          params: {
            activityId: activeId,        // 活动id
            provinceId,        // 省份id（非必传）
            areaCode,
            cityId
          }
        })
        .then(resp => {
          let data = resp.datas
          if (resp.success) {
            this.homeArea = data.areaList || []
            if (this.homeArea.length === 0) {
              this.modalVisible = true
              return
            }
            if (areaCode) { // 回显urlParams中的 areaCode cityId
              // if (provinceId === '99') {
              //   this.setFirstAsDefault(this.homeArea)
              //   return
              // }
              let province = this.getCity(this.homeArea, areaCode)
              let city = this.getCity(province.areaList, cityId)
              
              this.form.homeLocation = {
                province: { id: province.id, name: province.name }
              } 
              if (city) {
                this.form.homeLocation.city = { id: city.id, name: city.name }
              }
              this.fetchAddressArea()
            } else {
              console.log('set first')
              this.setFirstAsDefault(this.homeArea)
            }
            // 号码归属变化
            bus.$emit('home-change', this.form.homeLocation)
          }
        })
    },
    // 地理定位、接口定位失败： 直接请求归属范围，均填充默认值
    deniedGeolocation(error) {
      let { provinceId, activeId } = urlParams
      let provinceName = ''

      // if (!provinceId) {
      //   provinceId = 1
      //   provinceName = '北京'
      // }

      // this.form.homeLocation = {
      //   province: { id: provinceId, name: provinceName }
      // }
      Indicator.close()

      if (this.homeArea.length === 0) {
        this.fetchHomeArea()
      }
      // 号码归属变化
      bus.$emit('home-change', this.form.homeLocation)
    },
    geolocation(location={}) {
      console.log('geolocation')
      let { latitude, longitude } = location.coords || {}
      let { provinceId, activeId, areaCode, cityId } = urlParams
      this.$http.get('/tyk/getPhoneNumberArea', {
          params: {
            lon: longitude,       // 经度(链接无省份id时传)
            lat: latitude,        // 维度(链接无省份id时传)
            activityId: activeId,        // 活动id
            provinceId: provinceId,        // 省份id（非必传）
            areaCode,
            cityId
          }
        })
        .then(resp => {
          let data = resp.datas
          if (resp.success) {
            let position = data.position
            this.homeArea = data.areaList || []

            if (this.homeArea.length === 0) {
              this.modalVisible = true
              return
            }
            // 定位成功，回显归属地
            if (position) {
              let { provinceId, cityId, provinceName, cityName } = position

              // 直辖市，只传省份id
              if ([1, 2, 3, 4].indexOf(+provinceId) > -1) {
                this.form.homeLocation = {
                  province: { id: provinceId, name: provinceName }
                }
              } else {
                this.form.homeLocation = {
                  province: { id: provinceId, name: provinceName },
                  city: { id: cityId, name: cityName }
                }
              }
              // 号码归属变化
              bus.$emit('home-change', this.form.homeLocation)
              this.fetchAddressArea()
            } else {
              this.deniedGeolocation()
            }
          }
          Indicator.close()
        })
        .catch(error => {
          console.log(error)
          Indicator.close()
        })
    },
    emitForm: debounce(function (newForm) {
      this.$emit('input', newForm)
    }, 500),
    /**
     * 选择 - 归属地
     * 只选择省市
     */
    showHomePopup() {
      if (this.homeArea.length === 0) {
        return Toast('无可切换地址')
      }
      let obj = this.form.homeLocation

      this.areaList = this.homeArea
      this.level = 2
      this.currentInput = 'home'
      this.defaultData = Object.keys(obj).map(v => obj[v].id)

      this.popupVisible = true
    },
    /**
     * 选择 - 配送地址：
     *  - 全国：默认带入归属地省市
     *  - 归属地：省市不可选
     */
    showAddressPopup() {
      if (this.addressArea.length === 0) {
        return Toast('无可切换地址')
      }
      let obj = this.form.address

      this.areaList = this.addressArea
      this.level = 3
      this.currentInput = 'address'
      this.defaultData = Object.keys(obj).map(v => obj[v].id)
      this.popupVisible = true
    },
    onNumberChange(value) {
      this.form.phone = value
    },
    /**
     * 改变 - 地址选择器
     */
    handleCityPickerChange(address) {
      let curr = this.currentInput

      if (curr === 'home') {
        this.form.homeLocation = address
        // 归属地变化，则配送范围变化，号码清空
        this.form.address = address
        this.fetchAddressArea()

        // 号码归属变化
        bus.$emit('home-change', this.form.homeLocation)       
      } else if (curr === 'address') {
        this.form.address = address
      }
      console.log(JSON.stringify(address))
    },
    /**
     * 获取 - 配型地址范围，随归属地改变
     */
    fetchAddressArea() {
      this.form.address = cloneDeep(this.form.homeLocation)
      let { activeId } = urlParams
      let provinceId = this.form.homeLocation.province.id
      let cityId = this.form.homeLocation.city && this.form.homeLocation.city.id

      this.$http.get('/tyk/getAddressArea', {
          params: {
            activityId: activeId,        // 活动id
            provinceId,        // 省份id（非必传）
            cityId: cityId
          }
        })
        .then(resp => {
          let data = resp.datas || []

          this.addressArea = data
        })
    }
  }
}
</script>

<style lang="less">
.form-info .mint-field .mint-cell-value input {
   line-height: normal!important;
   &[readonly="readonly"] {
    // user-select: none;
    pointer-events: none;
  }
}
.single-btn {
  .btn-cancel {
    color: #de443b;
  }
  .modal-con {
    margin-top: 30px;
  }
}
.diy-modal {
  width: 500px;
  // height: 350px;
  font-size: 30px;
  border-radius: 16px;
  overflow: hidden;
  text-align: center;
  header {
    font-weight: 500;
    margin: 30px 0 0;
  }
  .modal-con {
    // min-height: 80px;
    padding: 30px;
    font-size: 26px;
  }
  .btns-flexbox {
    display: flex;
    text-align: center;
    div {
      flex: 1;
      height: 90px;
      line-height: 90px;
    }
    .btn-cancel {
      border-top: 1px solid #ccc;
    }
    .btn-ensure {
      background: #de443b;
      color: #fff;
    }
  }
  .ensure-btn {
    width: 100%;
    height: 90px;
    text-align: center;
    line-height: 90px;
    color: #fff;
    background:#de443b;
  }
}
.form-info {
  padding-bottom: 130px;
  background: #F1F3F5;
  .header {
    height: 92px;
    line-height: 92px;
    font-size: 30px;
    font-weight: 500;
    color: #232326;
    padding-left: 30px;
    span {
      padding-left: 30px;
      color: #999;
      font-size: 26px;
      font-weight: normal;
      .iconfont {
        margin-right: 5px;
        font-size: 40px!important;
        vertical-align: sub;
      }
    }
  }
  .input-field {
    position: relative;
    // display: flex;
    // align-items: center;
    background-color: #fff;
    font-size: 30px;
    padding-left: 30px;
    height: 48PX;
    line-height: 48PX;

    label {
      display: inline-block;
      width: 2.2rem;
    }
    img {
      display: inline-block;
      width: 24px;
      height: 29px;
      margin-right: 14px;
    }
  }
  .protocol {
    padding: 18px 20px 0;
    font-size: 24px;
    color: #999;
    a {
      color: #489CF7;
    }
    .checkbox {
      display: inline-block;
      width: 22px;
      height: 22px;
      border: 2px solid #999;
      border-radius: 4px;
      vertical-align: sub;
      &::after {
        content: " ";
        border: 4px solid transparent;
        border-left: 0;
        border-top: 0;
        left: 6px;
        position: absolute;
        width: 7px;
        height: 14px;
        transform: rotate(45deg) scale(0);
        transition: transform .2s;
      }
    }
    .checkbox.check-active {
      border-color: #de443b;
      position: relative;
      &::after {
        border-color: #de443b;
        transform: rotate(45deg) scale(1);
      }
    }
  }

  .arrow::after {
    border: 4px solid #999;
    border-bottom-width: 0;
    border-left-width: 0;
    content: " ";
    top: 50%;
    right: 30px;
    position: absolute;
    width: 18px;
    height: 18px;
    transform: translateY(-50%) rotate(45deg);
  }

  .mint-cell-wrapper {
    padding: 0 0.4rem;
  }
  .mint-field .mint-cell-title {
    width: 2.2rem;
    .mint-cell-text {
      font-size: 0.4rem;
    }
  }
  .mint-field .mint-cell-value {
    input {
      font-size: 0.406rem;
      line-height: 0;
      margin-top: 3px;
    }
    ::placeholder {
      color: #ccc;
    }
  }
}
</style>
