<template>
  <section v-if="list.length > 1" class="choose-package">
    <div class="package-box">
      <div v-for="item in list" @click="choosePackage($event, item)" :class="['package', item.id == pkg.id && 'active']">
        <span class="price">{{ item.fee }}</span> 
        <!-- /<span class="unit">月</span> -->
        <span class="name">{{item.packageName}}</span>
      </div>
    </div>
    <div class="price-desc clear-float">
      {{feeDetail | limitText(79)}}
      <a v-show="feeDetailUrl" class="link" @click="goProtocol">资费详情 ></a>
      <img ref="arrowUp" class="arrow-up" src="@/assets/up-arrow.png" alt="">
    </div>
  </section>
  <section v-else-if="list.length === 1" class="single-package">
    <div class="left-box">
      <div v-for="item in list" class="package active">
        <span class="price">{{item.fee}}</span> 
        <!-- /<span class="unit">月</span> -->
        <span class="name">{{item.packageName}}</span>
      </div>
    </div>
    <div class="right-box">
      {{feeDetail | limitText(49)}}
      <a v-show="feeDetailUrl" class="link" @click="goProtocol">资费详情 ></a>
    </div>
  </section>
</template>

<script>
import mock from '@/mock.js'
import bus from '@/pages/index/bus.js'

var fluctuate = 7

export default {
  name: 'ChoosePackage',
  filters: {
    limitText(text, limit) {
      if (text.length > limit) {
        return text.substr(0, limit - fluctuate) + '...'
      } else {
        return text
      }
    }
  },
  data () {
    return {
      pkg: {},            // 当前资费套餐id  
      feeDetail: '',
      list: [],
      feeDetailUrl: ''    // 资费图片
    }
  },
  created() {
    // 资费详情
    bus.$on('package-img', url => {
      // url = ''
      this.feeDetailUrl = url
      if (!url) {
        fluctuate = 0
        this.feeDetail = this.pkg.feeDetail || ''
      }
    })
  },
  mounted() {
    this.$http.get('/tyk/getPackages', {
        params: {
          provinceId: urlParams.provinceId,
          activeId: urlParams.activeId
        }
      })
      .then(resp => {
        let data = resp.datas || []
        this.list = data
        
        this.pkg = this.list[0]
        this.feeDetail = this.list[0].feeDetail

        // 套餐信息，转发出去
        bus.$emit('pkg-change', this.list[0])
      })
      .catch(error => {
        console.log(error)
      })
  },
  methods: {
    goProtocol() {
      let imgUrl = this.feeDetailUrl
      this.$router.push({ name: 'Protocol', params: { imgUrl } })
    },
    choosePackage(event, item) {
      if (item.id === this.pkg.id) return

      // 套餐信息，转发出去
      bus.$emit('pkg-change', item)

      let baseSize = document.documentElement.style.fontSize.replace('px', '')
      let leftRem = event.currentTarget.getBoundingClientRect().left/baseSize - 0.4 + 1

      this.pkg = item
      this.feeDetail = item.feeDetail
      
      this.$refs.arrowUp.style.left = (leftRem >= 8.6 ? 8.6 : leftRem) + 'rem'
    }
  },
  
}
</script>

<style lang="less" scoped>
  .link {
    float: right;
    font-style: normal;
    color: #D93B31;
    position: relative;
    white-space: nowrap;
  }
  .choose-package {
    padding: 20px 0 30px;
    background-color: #fff;
  }
  .single-package {
    padding: 20px 0 30px 30px;
    overflow: hidden;
    background-color: #fff;
    .left-box {
      float: left;
      margin-right: 30px;
    }
    .right-box {
      float: left;
      width: 432px;
      height: 113px;
      font-size: 26px;
      line-height: 1.6;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .package {
    box-sizing: border-box;
    display: inline-block;
    margin-right: 10px;
    width: 190px;
    height: 120px;
    border-radius: 5px;
    background-color: #ffffff;
    border: solid 1PX #e3e5e9;
    text-align: center;
    .price {
      display: block;
      height: 72px;
      font-size: 30px;
      font-weight: 500;
      line-height: 72px;
      .unit {
        font-size: 26px;
        font-weight: normal;
      }
    }
    .name {
      display: block;
      height: 48px;
      line-height: 48px;
      font-size: 24px;
      font-weight: 500;
      background-color: #E3E5E9;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
    }
  }
  .package.active {
    border-color: #de443b;
    .price {
      color: #de443b;
    }
    .name {
      color: #fff;
      background-color: #de443b;
    }
  }
  .package-box {
    overflow: scroll;
    height: 120px;
    white-space: nowrap;
    
    .package:first-child {
      margin-left: 30px;
    }
  }
  .price-desc {
    position: relative;
    margin-top: 20px;
    margin: 20px 30px 0;
    padding: 26px 16px;
    background-color: #fef9f0;
    border: solid 1PX #f7ece0;
    font-size: 24px;
    line-height: 1.5;
    color: #444444;
    .arrow-up {
      display: inline-block;
      width: 40px;
      height: 20px;
      position: absolute;
      top: -20px;
      left: 1rem;
      &::before {
        display: inline-block;
        width: 0;
        height: 0;
        border: solid transparent;
        border-width: 20px;
        border-bottom-color: #fef9f0;
        content: "";
        position: absolute;
      }
    }
  }
</style>
