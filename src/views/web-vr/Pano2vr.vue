<template>
  <div id="page-box"></div>
</template>

<script>
/**
 * * 利用 pano2vr 软件来实现基本的 WebVR 效果（需要全景图）
 * * 利用 pano2vr api 来实现一些定制化的效果
 */
import {onMounted, onUnmounted, defineComponent} from 'vue'

export default defineComponent({
  setup() {
    // 初始化
    function init() {
      // create the panorama player with the container
      const pano = new pano2vrPlayer("page-box");
      // load the configuration
      pano.setUseGyro(true);
      pano.readConfigUrlAsync("src/views/web-vr/pano-files/pano.xml",()=>{
        var pois=pano.getPointHotspotIds();

        var hotScale = 0.2;

        for(var i=0;i<pois.length;i++){
          var ids=pois[i];
          var hotsopt=pano.getHotspot(ids);
          hotsopt.div.firstChild.src="src/assets/web-vr/images/hot.png";
          hotsopt.div.firstChild.style.width = 207*hotScale+"px";
          hotsopt.div.firstChild.style.height = 162*hotScale+"px";
          hotsopt.div.onmouseover = null;
          hotsopt.div.setAttribute("ids",ids);
          hotsopt.div.onclick=function() {
            console.log(this.getAttribute("ids"));
          };
        }
      });
    }

    onMounted(() => {
      init();
    })

    onUnmounted(() => {})

    return {}
  },
})
</script>

<style lang="less" scoped>
#page-box {
  height: 100vh;

  div, h1, h2, h3, span, p {
    font-family: Verdana,Arial,Helvetica,sans-serif;
  }
  /* fullscreen */
  html {
    height:100%;
  }
  body {
    height:100%;
    margin: 0px;
    overflow:hidden; /* disable scrollbars */
    font-size: 10pt;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0); /* remove highlight on tab for iOS/Android */
  }
  /* fix for scroll bars on webkit & >=Mac OS X Lion */
  ::-webkit-scrollbar {
    background-color: rgba(0,0,0,0.5);
    width: 0.75em;
  }
  ::-webkit-scrollbar-thumb {
    background-color:  rgba(255,255,255,0.5);
  }
}
</style>
