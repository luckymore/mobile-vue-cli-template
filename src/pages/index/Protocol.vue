<template>
  <div class="page-protocol">
    <img :src="$route.params.imgUrl" alt="没配置图片...">
  </div>
</template>

<script>
  export default {
    // watch: {
    //   $route(route) {
    //     if (route.name === 'Protocol') {
    //       console.log(route)
    //       let $footer = document.getElementById('m_common_bottom3')
    //       $footer && ($footer.style.display = 'none')
    //     }
    //   }
    // }
  }
</script>

<style lang="less">
  .page-protocol {
    padding: 15px;
    img {
      display: block;
      width: 100%;
    }
  }
</style>

