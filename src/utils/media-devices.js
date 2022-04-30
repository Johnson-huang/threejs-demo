/**
 * * 是否支持访问用户媒体设备
 * ? 支持，返回对应的支持函数
 * ? 不支持，返回 false
 */
export function checkGetUserMediaSupport() {
    return navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia
}

// 获取支持的音视频设备
export function checkMediaDevices() {
    return new Promise((resolve, reject) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices()) {
            reject({
                code: 0,
                msg: '不支持获取音视频设备'
            })
        } else {
            navigator.mediaDevices.enumerateDevices()
                .then((deviceInfos) => {
                    resolve({
                        code: 1,
                        data: deviceInfos,
                        msg: ''
                    })
                })
                .catch((err) => {
                    reject({
                        code: 0,
                        data: err,
                        msg: err.message
                    })
                });
        }
    })
}

// 访问用户媒体设备的兼容方法
export function getUserMedia(constraints, success, error) {
    if (navigator.mediaDevices.getUserMedia) {
        // 最新的标准API
        navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    } else if (navigator.webkitGetUserMedia) {
        // webkit 核心浏览器
        navigator.webkitGetUserMedia(constraints, success, error)
    } else if (navigator.mozGetUserMedia) {
        // firefox 浏览器
        navigator.mozGetUserMedia(constraints, success, error);
    } else if (navigator.getUserMedia) {
        // 旧版API
        navigator.getUserMedia(constraints, success, error);
    }
}