# @vue/cli-ui

### Local development

Before starting a local cli-ui instance,
consider following the [contributing guide](https://github.com/vuejs/vue-cli/blob/dev/.github/CONTRIBUTING.md)
in order to download all required dependencies of vue-cli's packages.

Just after, you should build once then serve `@vue/cli-ui-addon-webpack` by running:
```bash
cd ../cli-ui-addon-webpack
yarn build # just do once
yarn serve
```

Then you start the ui server (based on Apollo):

```
cd ../cli-ui
yarn run apollo
```

And then in another terminal, you should serve the ui web app:

```
yarn run serve
```

#### Testing

For running E2E tests, you just need to run:

```
yarn run test:e2e
```

This will open a new [Cypress](https://www.cypress.io/) window.
You can now run all or specific integration tests.


## nginx 配置
```
server
  {
    listen      80;
    server_name  vue-cicd.xxx.cn;
    index index.html index.htm;
    root  /data/apps/cicd-vue-ui/dist;

    ssi on;
    ssi_silent_errors on;

  #  location / {
#	proxy_pass http://127.0.0.1:8080;
 #   }
    location / {
      try_files $uri $uri/ /index.html;
    }
    location /graphql {
        proxy_pass http://localhost:4030;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
    #location / {
    #    proxy_pass http://127.0.0.1:8080;
    #    proxy_http_version 1.1;
    #    proxy_set_header Upgrade $http_upgrade;
    #    proxy_set_header Connection "Upgrade";
    #}

    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf|js|css)$
    {
      expires      1h;
    }

    access_log /data/logs/nginx/cli.ewan.cn.log  weblog;
            
  }


```