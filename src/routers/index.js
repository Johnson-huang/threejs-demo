import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/Home.vue'
import EarthAndMoon from '@/EarthAndMoon.vue'
import Car from '@/Car.vue'

// 创建路由实例并传递 `routes` 配置
const router = createRouter({
  // 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home, meta: {title: '首页'} },
    { path: '/earth-and-moon', component: EarthAndMoon, meta: {title: '地月环绕'} },
    { path: '/car', component: Car, meta: {title: '汽车模型'} },
  ],
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next();
});

export default router