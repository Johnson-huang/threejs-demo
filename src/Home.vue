<template>
  <div class="home-box">
    <div class="item-box" v-for="(item) in urls" :key="item.path" @click="handleClick(item)">{{item.meta.title}}</div>
  </div>
</template>

<script>
import { defineComponent, reactive } from 'vue'
import {useRouter} from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()
    const state = reactive({
      urls: router.getRoutes().filter(item => item.path !== '/')
    })

    function handleClick(item) {
      router.push({
        path: item.path
      })
    }

    return {
      ...state,
      handleClick
    }
  }
})
</script>

<style lang="less" scope>
  .home-box {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    .item-box {
      color: blue;
      text-decoration: underline;

      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
</style>
