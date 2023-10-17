module.exports = {
    apps: [
        {
            name: 'my-vue-app',
            script: 'node_modules/@vue/cli-service/bin/vue-cli-service.js',
            args: 'serve',
            env: {
                NODE_ENV: 'development',
                VUE_APP_CLI_UI_URL: 'ws://vue-cicd.ewan.cn/graphql',
                VUE_APP_GRAPHQL_PORT: '4030'
            }
        },
        {
            name: 'apollo',
            script: 'node_modules/@vue/cli-service/bin/vue-cli-service.js',
            args: 'apollo:dev',
            env: {
                VUE_APP_CLI_UI_DEV: true,
                VUE_APP_CLI_UI_DEBUG: true,
                VUE_APP_GRAPHQL_PORT: '4030'
            }
        }
    ]
};
