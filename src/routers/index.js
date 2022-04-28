import {createRouter, createWebHashHistory} from 'vue-router';
import Autostereoscopy from "@/routers/autostereoscopy";

export const allRoutes = [
    {path: '/', component: () => import('@/Home.vue'), meta: {title: '首页'}},
    {path: '/car', component: () => import('@/Car.vue'), meta: {title: '汽车模型'}},
    {path: '/earth-and-moon', component: () => import('@/EarthAndMoon.vue'), meta: {title: '地月环绕'}},
    // 裸眼3D
    ...Autostereoscopy
]

// 创建路由实例并传递 `routes` 配置
const router = createRouter({
    // 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes: allRoutes
});

router.beforeEach((to, from, next) => {
    document.title = to.meta.title;
    next();
});

export default router