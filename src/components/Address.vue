<template>
<transition name="city-picker-transition">
  <div ref="addressPopup" class="city-picker-container" @click="handleWrapper" v-show="visible">
    <transition
      v-on:after-enter="afterEnterAnimation"
      v-on:before-leave="beforeLeaveAnimation"
      name="citypicker-slide">
      <div class="wrapper"
        :style="wrapperHeight"
        v-show="visible">
        <div class="head">
          所在地区
          <span class="close" @click="close">×</span>
        </div>
        <div class="con">
          <div class="tab">
            <span
              @click="handleTabs(1)"
              :class="curTabs === 1 ? 'tabCur' : ''">
              {{selected.province.name || '请选择'}}
            </span>
            <span
              @click="handleTabs(2)"
              v-show="level2"
              :class="curTabs === 2 ? 'tabCur' : ''">
              {{selected.city.name || '请选择'}}
            </span>
            <span
              @click="handleTabs(3)"
              v-show="level3"
              :class="curTabs === 3 ? 'tabCur' : ''">
              {{selected.area.name || '请选择'}}
            </span>
          </div>
          <div class="tab-con">
            <div class="province" v-show="curTabs === 1">
              <span
                v-for="(value, key) in Province"
                :key="value.id"
                @click="handleProvince(value)"
                :class="value.id == selected.province.id ? 'selected' : ''">
              {{value.name}}
              </span>
            </div>
            <div class="city" v-show="curTabs === 2">
              <span
                v-for="(value, key) in Citys"
                :key="value.id"
                @click="handleCity(value)"
                :class="value.id == selected.city.id ? 'selected' : ''">
              {{value.name}}
              </span>
            </div>
            <div class="area" v-show="curTabs === 3">
              <span
                v-for="(value, key) in Areas"
                :key="value.id"
                @click="handleArea(value)"
                :class="value.id == selected.area.id ? 'selected' : ''">
              {{value.name}}
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</transition>
</template>

<script>
export default {
  name: 'cityPicker',
  props: {
    areaList: {
      type: Array,
      default: []
    },
    value: {
      type: Boolean,
      default: false
    },
    defaultData: {
      type: Array,
      default: () => []
    },
    level: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      selected: {
        province: {
          id: '',
          name: ''
        },
        city: {
          id: '',
          name: '',
          // isMunicipality: false
        },
        area: {
          id: '',
          name: ''
        }
      },
      Province: {},
      Citys: {},
      Areas: {},
      curTabs: 1, // province/citys/area
      wrapperHeight: {}
    }
  },
  computed: {
    visible() {
      if (this.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
      return this.value
    },
    // 是否显示第二级
    level2() {
      return Object.keys(this.Citys).length > 0
    },
    level3() {
      return Object.keys(this.Areas).length > 0
    }
  },
  watch: {
    value(val) {
      this.Province = this.formatData(this.areaList)
      
      if (val && this.defaultData.length > 0) {
        // console.log(val, this.defaultData, this.Province)
        this.setDefaultData(this.defaultData)
      }
    }
  },
  mounted() {
    // 阻止modal滚动穿透
    // this.$refs.addressPopup.addEventListener('touchmove', function(e) {
    //   e.preventDefault();
    // }, false);
  },
  created() {
    // this.$http.get('/tyk/getAllArea')
    //   .then(data => {
    //     let list = data.datas.areaList || []
    //     this.list = list
    //     this.Province = this.formatData(list)
    //   })
  },
  methods: {
    /**
     * 直辖市id：1，2，3，4 
     */
    isMunicipality(id) {
      return [1, 2, 3, 4].indexOf(+id) > -1
    },
    /**
     * 数组转为以每项的 id 为 key 的键值对
     * [{id: 1, name: '北京', areaList: []}]
     * {"1": {id: 1, name: '北京', areaList:[]}}
     */
    formatData(list) {
      let obj = {}

      list.forEach(v => {
        obj[v.id] = v
      })

      return obj
    },
    getCitys(id) {
      return this.formatData(this.Province[id].areaList)
    },
    getAreas(id) {
      return this.formatData(this.Citys[id].areaList)
    },
    close() {
      this.Citys = {}
      this.Areas = {}
      this.selected = this.$options.data().selected
      this.curTabs = 1
      this.$emit('input', false)
    },
    handleWrapper(e) {
      // console.log(e.target)
      if (e.target.className === 'city-picker-container') {
        this.close()
      }
    },
    handleProvince(value) {
      let {id, name} = value
      let citys = {}

      let level = this.level
      // 二级且为直辖市时，只能选择一级
      if (this.isMunicipality(id) && this.level === 2) {
        level = 1
      }
      if (this.selected.province.id !== id && level > 1) {
        citys = this.getCitys(id)
        // 城市数据
        this.Citys = citys
      }
      // 重置市
      this.selected.city.id = ''
      this.selected.city.name = ''
      // 重置区
      this.selected.area.name = ''
      this.selected.area.id = ''
      this.Areas = []
      this.selected.province.id = id
      this.selected.province.name = name
      // 设置当前tab
      if (Object.keys(citys).length > 0) {
        this.curTabs = 2
      } else {
        this.finish()
      }
    },
    handleCity(value) {
      let { id, name } = value
      let areas = {}
      if (this.selected.city.id !== id && this.level > 2) {
        areas = this.getAreas(id)
        if (Object.keys(areas).length > 0) {
          this.Areas = areas
          this.selected.area.id = ''
          this.selected.area.name = ''
          this.curTabs = 3
        }
      }
      this.selected.city.id = id
      this.selected.city.name = name
      if (Object.keys(areas).length === 0) {
        this.finish()
      }
    },
    handleArea(value) {
      let { id, name } = value

      this.selected.area.id = id
      this.selected.area.name = name
      this.finish()
    },
    handleTabs(index) {
      this.curTabs = index
    },
    finish() {
      const temp = {}
      Object.keys(this.selected).forEach(key => {
        temp[key] = {}
        temp[key].id = this.selected[key].id
        temp[key].name = this.selected[key].name
      })
      this.close()
      this.$emit('on-finish', temp)
    },
    setDefaultData(data) {
      let curTabs = 1
      const temp = []
      data.forEach(item => {
        if (item !== '' && item !== undefined) {
          temp.push(item.toString())
        }
      })
      if (temp.length === 0) {
        return false
      }
      // 设置省份
      this.selected.province = {
        id: temp[0],
        name: this.Province[temp[0]].name
      }
      /**
       * 设置市
       * 指定level=2并且直辖市
       */
      if (this.isMunicipality(temp[0]) && this.level === 2) {
        this.curTabs = curTabs
        return
      }
      
      
      const citys = this.getCitys(temp[0])
      if (Object.keys(citys).length > 0) {
        // 没给默认取第一个
        this.Citys = citys
        
        if (this.isMunicipality(temp[0]) && !temp[1]) {
          this.curTabs = 2
          return
        }
        temp[1] = temp[1] || Object.keys(citys)[0]

        this.selected.city = {
          id: temp[1],
          name: citys[temp[1]].name
        }
        curTabs = 2
        
        // 设置地区
        if (this.level === 3) {
          // temp[2] = temp[2] || this.Citys[temp[1]].areaList[0].id 
          curTabs = 3          
          const areas = this.getAreas(temp[1])
          // debugger;
          if (Object.keys(areas).length > 0) {
            this.Areas = areas
            if (temp[2]) {
              this.selected.area = {
                id: temp[2],
                name: areas[temp[2]].name
              }
            }
          }
        }
      }
      console.log(curTabs)
      this.curTabs = curTabs
        
      return true
    },
    afterEnterAnimation() {
      this.wrapperHeight = {
        height: '70%'
      }
    },
    beforeLeaveAnimation() {
      this.wrapperHeight = {}
    }
  }
}
</script>

<style lang="less" scoped>
.city-picker-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  z-index: 999;
  .wrapper {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: 28px;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    .head {
      font-size: 30px;
      color: #232326;
      flex: 0 0 82px;
      height: 82px;
      line-height: 82px;
      text-align: center;
      .close {
        font-size: 46px;
        float: right;
        color: #ccc;
        padding: 0 20px;
      }
    }
    .con {
      // margin-top: 30px;
      flex: 1 1 100%;
      width: 100%;
      position: relative;
      .tab {
        width: 100%;
        // height: 31px;
        line-height: 62px;
        padding: 0 10px;
        border-bottom: 1PX solid #e3e3e3;
        position: relative;
        z-index: 10;
        // white-space: nowrap;
        // overflow-x: auto;
        // overflow-y: hidden;
        span {
          display: inline-block;
          padding: 0 10px;
          line-height: 60px;
          margin-right: 20px;
        }
        .tabCur {
          color: #ff3131;
          border-bottom: 4px solid #ff3131;
        }
      }
      .tab-con {
        position: absolute;
        width: 100%;
        height: 100%;
        // top: 0;
        // padding-top: 31px;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }
      .province,
      .city,
      .area {
        width: 100%;
        height: 100%;
        padding: 0 20px 90px 20px;
        box-sizing: border-box;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
        span {
          display: block;
          line-height: 60px;
        }
        .selected {
          color: #ff3131;
          // &:after {
          //   // font-family: 'iconfont';
          //   content: '';
          //   margin-left: 8px;
          //   font-size: 24px;
          //   display: inline-block;
          //   width: 16px;
          //   height: 28px;
          //   border-right: 1PX solid #ff3131;
          //   border-bottom: 1PX solid #ff3131;
          //   transform: rotate(45deg);
          //   // position: relative;
          //   // top: 1px;
          // }
        }
      }
    }
  }
}
</style>

<style class="less">
.city-picker-transition-enter-active,
.city-picker-transition-leave-active {
  transition: opacity 0.3s linear;
}
.city-picker-transition-enter,
.city-picker-transition-leave-to {
  opacity: 0;
}
.citypicker-slide-enter-active,
.citypicker-slide-leave-active {
  height: 70%;
  transition: all 0.3s linear;
}
.citypicker-slide-enter,
.citypicker-slide-leave-to {
  height: 0%;
}
</style>