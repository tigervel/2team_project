const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://10.0.2.2:8080', // 백엔드
            changeOrigin: true,
            secure: false,
        })
    );
};
