export default [
    {
        path: '/web-vr',
        meta: {title: 'WebVR'},
        component: () => import('@/Layout/Layout.vue'),
        children: [
            {path: 'threejs', component: () => import("@/views/web-vr/Threejs.vue"), meta: {title: 'WebVR方案一：threejs'}},
            {path: 'css3d', component: () => import("@/views/web-vr/CSS3D.vue"), meta: {title: 'WebVR方案二：CSS3D'}},
            {path: 'pano2vr', component: () => import("@/views/web-vr/Pano2vr.vue"), meta: {title: 'WebVR方案三：pano2vr'}},
        ]
    }
]