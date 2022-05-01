export default [
    {
        path: '/web-vr',
        meta: {title: 'WebVR'},
        component: () => import('@/Layout/Layout.vue'),
        children: [
            {path: 'threejs', component: () => import("@/views/web-vr/Threejs.vue"), meta: {title: 'WebVR方案一：threejs'}},
            {path: 'css3d', component: () => import("@/views/web-vr/CSS3D.vue"), meta: {title: 'WebVR方案二：CSS3D'}},
            // {path: 'gyroscope', component: () => import("@/views/autostereoscopy/Gyroscope.vue"), meta: {title: '裸眼3D方案三：陀螺仪'}},
        ]
    }
]