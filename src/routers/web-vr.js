export default [
    {
        path: '/web-vr',
        meta: {title: 'WebVR'},
        component: () => import('@/Layout/Layout.vue'),
        children: [
            {path: 'threejs', component: () => import("@/views/web-vr/Threejs.vue"), meta: {title: 'WebVR方案一：threejs'}},
            // {path: 'tracking', component: () => import("@/views/autostereoscopy/Tracking.vue"), meta: {title: '裸眼3D方案二：人脸识别'}},
            // {path: 'gyroscope', component: () => import("@/views/autostereoscopy/Gyroscope.vue"), meta: {title: '裸眼3D方案三：陀螺仪'}},
        ]
    }
]