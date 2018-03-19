<template>
  <mt-popup
    v-model="visible"
    ref="numberPopup"
    :closeOnClickModal="false"
    position="bottom"
    class="number-popup"
  >
  <!--  -->
  
    <header class="header">
      请选择号码<span @click="handleClose" class="close">×</span>
    </header>
    <section class="phone-wrap">
      <div class="search-box">
        <!-- <input ref="keyword" @input="handleKeywordInput" type="text" placeholder="请输入3~4位幸运号码">
        <i v-show="closeShow" class="clear" @click="handleClear"></i> -->
        <input 
          ref="keyword" 
          v-model="keyword" 
          @input="handleKeywordInput"
          @keyup.enter="search"
          tabIndex="999"
          type="tel" placeholder="请输入3~4位幸运号码"
        >
        <input style="display: none;" type="text">
        <i v-show="keyword" class="clear" @click="handleClear"></i>
        <a @click="search" class="search-btn">搜索</a>
      </div>

      <div v-if="list.length > 0" class="list-box">
        <div class="list">
          <div 
            v-for="number in list"
            :class="['item', number==currNumber && 'checked']" 
            @click="handleCheck(number)"
          >
            {{number | formatNumber}}
          </div>
        </div>
        <a @click="fetchNumbers" class="change-btn">换一批</a>
      </div>

      <div v-else-if="loading" class="loading-text">
        请稍等，正在搜索号码...
      </div>
      <div v-else-if="notFound" class="loading-text">
        您选择的号码被别人买走了，下手要快哦～
      </div>
    </section>
  </mt-popup>
</template>

<script>
import mock from "@/mock.js"
import bus from '@/pages/index/bus.js'
import { Toast } from 'mint-ui'

export default {
  filters: {
    formatNumber(val) {
      let number = val.toString()
      return [number.substr(0, 3), number.substr(3, 4), number.substr(7, 4)].join('-')
    }
  },
  props: ['numberPickerVisible'],
  data() {
    return {
      first: true,
      currNumber: '',
      // list: [1,2,3,4,5,6,7,8,9,10],
      list: [],
      keyword: '',
      pkg: {},        // 资费信息
      home: {},       // 归属地信息
      params: {},
      loading: false,
      notFound: false,
      closeShow: false,
    }
  },
  computed: {
    visible: {
      get() {
        // 没切换套餐时，打开号码选择器，不重新请求
        if (this.first && this.numberPickerVisible) {
          this.first = false
          this.fetchNumbers()
        }
        if (this.numberPickerVisible) {
          document.body.style.overflow = 'hidden'
          document.documentElement.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = ''
          document.documentElement.style.overflow = ''
        }
        return this.numberPickerVisible
      },
      set(val) {}
    }
  },
  
  created() {
    // 接收 - 资费变化
    bus.$on('pkg-change', pkg => {
      this.pkg = pkg
      this.$emit('change', '')
    })
    // 接收 - 归属地变化
    bus.$on('home-change', home => {
      this.home = home
      this.$emit('change', '')
    })
  },
  mounted() {

    // 若当前modal打开时，其他input被focus，则关闭modal
    let $inputs = document.querySelectorAll('input')

    $inputs.forEach(input => {
      if (input.tabIndex!==999) {
        input.tabIndex = -1
        console.log(input)
        input.onfocus = (evt) => {
          if (!this.numberPickerVisible) return
          this.handleClose()
        }
      }
    })

    /**
     *  hack - 安卓键盘弹起，地址栏遮住了部分fixed元素
     *  onresize 只在android下生效
     */
    window.onresize = (evt) => {
      console.log(evt)
      let h = window.innerHeight
      if (h < 360) {
        this.$refs.numberPopup.$el.style.top = '-60px'
      } else {
        this.$refs.numberPopup.$el.style.top = 'auto'
      }
    }
    
    // 阻止modal滚动穿透
    // this.$refs.numberPopup.$el.addEventListener('touchmove', function(e) {
    //   e.preventDefault();
    // }, false);
  },
  methods: {
    handleClear() {
      this.keyword = ''
      this.fetchNumbers()
    },
    // 限制输入长度为4位
    handleKeywordInput(evt) {
      this.keyword = evt.currentTarget.value
      let str = this.keyword
      if (str.length > 4) {
        this.keyword = str.substr(0, 4)
      }
    },
    // handleClear(evt) {
    //   evt.currentTarget.previousElementSibling.value = ''
    //   this.closeShow = false
    // },
    // handleKeywordInput(evt) {
    //   this.keyword = evt.currentTarget.value
    //   if (this.keyword.length > 0) this.closeShow = true
      
    //   if (this.keyword.length > 4) {
    //     evt.currentTarget.value = this.keyword.substr(0, 4)
    //   }
    // },
    search() {
      // let len = this.$refs.keyword.length
      let len = this.keyword.length

      if (len === 0) {
        this.toast('请输入要搜索的号段')
        return
      } else if (len < 3 || len > 4) {
        this.toast('请输入3~4位幸运号码')
        return
      }

      this.fetchNumbers()
    },
    toast(text, name="exclamation", duration=1000) {
      return Toast({
        message: text,
        iconClass: `iconfont icon-${name}`,
        duration: duration
      })
    },
    handleCheck(number) {
      this.currNumber = number
      
      this.handleClose()
    },
    handleClose() {
      this.$emit('change', this.currNumber)
      this.keyword = ''
      // this.$refs.keyword.value = ''
      // this.closeShow = false

      setTimeout(() => {
        this.currNumber = ''
        this.$emit('update:numberPickerVisible', false)
        this.first = true
      }, 200)
    },
    fetchNumbers() {
      this.loading = true
      let { activeId } = urlParams
      let { province, city } = this.home
      if (!province) return
      // if ('1,2,3,4'.indexOf(province.id) > -1) {
      //   cityId = provinceId
      // }
      city = city || province
      
      this.params = {
        sku: this.pkg.skuid, 
        packageId:  this.pkg.id,       
        provinceId: province.id,      // 当前页:
        cityId: city.id || province.id,         // 城市id:
        numberSize: 10,      // 查询号码数量：
        activeId,        // 活动id:
        keyword: this.keyword,    //查询条件：
      }
      this.list = []
      this.$http.get('/tyk/searchNumber', {
          params: this.params
        })
        .then(resp => {
          this.loading = false
          this.list = resp.datas || []
          if (this.list.length === 0) {
            this.notFound = true
          } else {
            this.currNumber = this.list[0]
          }
        })
        .catch(error => {
          console.log(error)
          this.loading = false
        })
    }
  }
}
</script>

<style lang="less">
  .mint-toast {
    z-index: 10000!important;
  }
  .number-popup {
    // height: 1040px;
    width: 100%;
    overflow: hidden;
    // &.mint-popup {
    //   position: absolute;
    //   top: auto;
    // }
    .header {
      height: auto;
      line-height: normal;
      text-align: center;
      font-size: 30px;
      color: #232326;
      padding: 30px 20px 50px;
      border-bottom: 1PX solid #e3e5e9;
      .close {
        position: absolute;
        right: 20px;
        padding: 0 20px;
        margin-top: -15px;
        font-size: 46px;
        font-weight: normal;
        color: #C4C4C4;
      }
    }
    .phone-wrap {
      padding: 40px 20px 60px;
      .search-box {
        margin-bottom: 30px;
        height: 70px;
        line-height: 70px;
        overflow: hidden;
        font-size: 28px;
        position: relative;
        input {
          -webkit-appearance: none;
          outline: none;
          border-radius: 4px;
          box-sizing: border-box;
          float: left;
          width: 560px;
          padding-left: 10px;
          border: 1PX solid #ccc;
          height: 100%;
          line-height: 100%;
        }
        .clear {
          font-family: mintui!important;
          font-style: normal;
          -webkit-font-smoothing: antialiased;
          -webkit-text-stroke-width: .2px;
          font-size: 32px;
          text-align: center;
          color: #888;
          opacity: .6;
          position: absolute;
          right: 160px;
          display: inline-block;
          width: 70px;
          height: 70px;
          &::after {
            content: "\E605";
          }
        }
        ::-webkit-input-placeholder {
          color: #999;
        }
        .search-btn {
          border-radius: 4px;
          box-sizing: border-box;
          float: right;
          width: 140px;
          height: 100%;
          text-align: center;
          color: #de443b;
          border: 1PX solid #de443b;
        }
      }
      .list {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .item {
          width: 345px;
          height: 70px;
          line-height: 70px;
          font-size: 28px;
          text-align: center;
          border: 1PX solid #bfbfbf;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        .checked {
          border-color: #de443b;
          color: #de443b;
          background-color: #fcf3f0;
        }
      }
      .change-btn {
        position: absolute;
        bottom: 0;
        left: 50%;
        margin-left: -103px;
        display: block;
        width: 206px;
        height: 60px;
        line-height: 60px;
        font-size: 28px;
        text-align: center;
        color: #de443b;
        border-radius: 4px;
        border: solid 1Px #de443b;
      }
      .list-box {
        height: 550px;
        overflow: hidden;
        position: relative;
      }
      .loading-text {
        height: 550px;
        overflow: hidden;
        line-height: 550px;
        text-align: center;
        color: #bfbfbf;
        font-size: 26px;
      }
    }
  }
</style>
