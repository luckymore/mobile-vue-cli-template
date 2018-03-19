<template>
  <div class="page-result">
    <div v-if="$route.params.success" class="success">
      <img src="@/assets/get-success.png" alt="">
      <p>恭喜，领取成功！</p>
      <!-- <p>领取号码为 {{resp.phone}}</p> -->
      <p class="message">{{ $route.params.message }}</p>
      <div class="btn-group">
        <div @click="go('wangting')" class="back-btn">回网厅</div>
        <div @click="go" class="go-btn">去首页</div>
      </div>
    </div>
    
    <!-- 领取失败 -->
    <div v-else class="fail">
      <img src="@/assets/cry.png" alt="">
      <p>{{ $route.params.message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Result',
  data () {
    return {
    }
  },
  mounted() {
  },
  methods: {
    go(name) {
      if (name == 'wangting') {
        window.location.href = '//pro.m.jd.com/mall/active/2g6zWZQ7dwTGDRsMg19BdN1U5T5o/index.html'
      } else {
        window.location.href = '//m.jd.com/'
      }
    }
  }
}
</script>

<style lang="less">
  .index-wrapper {
    // min-height: 100%;
    background: #F3F5F6;
  }
  html, body {
    height: 100%;
    background: #F3F5F6; 
  }
  .page-result {
    .success {
      text-align: center;
      padding: 0 22px 60px;
      overflow: hidden;
      background-color: #fff;
      p {
        font-size: 32px;
        color: #232326;
      }
      .message {
        font-size: 28px;
        color: #666;
        word-wrap: break-word;
        padding-bottom: 20px;
      }
      img {
        display: inline-block;
        width: 184px;
      }
      .btn-group {
        margin-top: 48px;

        div {
          border: 1PX solid #DE443B;
          width: 340px;
          height: 88px;
          text-align: center;
          font-size: 36px;
          line-height: 88px;
        }
        .back-btn {
          float: left;
          color: #DE443B;
          background: #fff;
        }
        .go-btn {
          float: right;
          color: #fff;
          background: #DE443B;      
        }
      }
    }

    .fail {
      text-align: center;
      font-size: 26px;
      margin-bottom: 300px;
      img {
        width: 80px;
        height: 80px;
        margin-top: 300px;
        margin-bottom: 40px;
      }
      p {
        word-wrap: break-word;
        padding: 0 30px;
      }
    }
  }
  
</style>
