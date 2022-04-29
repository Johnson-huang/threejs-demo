export default [
    {
        path: '/autostereoscopy',
        meta: {title: '裸眼3D'},
        component: () => import('@/Layout.vue'),
        children: [
            {path: 'break-border', component: () => import("@/views/autostereoscopy/BreakBorder.vue"), meta: {title: '裸眼3D方案一：突破边框'}},
            {path: 'tracking', component: () => import("@/EarthAndMoon.vue"), meta: {title: '裸眼3D方案二：人脸识别'}},
            {path: 'gyroscope', component: () => import("@/EarthAndMoon.vue"), meta: {title: '裸眼3D方案三：陀螺仪'}},
        ]
    }
]