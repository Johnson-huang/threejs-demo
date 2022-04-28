<template>
  <div class="home-box">
    <div class="list-box">
      <div class="item-box" v-for="(item) in urls" :key="item.path">
        <span class="text" v-if="!item.children || !item.children.length" @click="handleClick(item)">{{ item.meta.title }}</span>
        <div class="list-box" v-else>
          <div class="item-box" v-for="(subItem) in item.children" :key="subItem.path">
            <span class="text" @click="handleClick(item, subItem)">{{subItem.meta.title}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {defineComponent, reactive} from 'vue'
import {useRouter} from 'vue-router'
import {allRoutes} from "@/routers";

export default defineComponent({
  setup() {
    const router = useRouter()
    const state = reactive({
      urls: allRoutes.filter(item => item.path !== '/')
    })

    function handleClick(item, subItem) {
      if (!subItem) {
        router.push({
          path: item.path
        })
      } else {
        router.push({
          path: `${item.path}/${subItem.path}`
        })
      }
    }

    return {
      ...state,
      handleClick
    }
  }
})
</script>

<style lang="less" scoped>
.home-box {
  padding: 20px;

  .list-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .item-box {
    color: blue;
    text-decoration: underline;
    cursor: pointer;

    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }
}
</style>
