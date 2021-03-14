"Test gitlabci + group"
Install
=======
freeswitch 1.6.17

node 10.6.0

npm install -g yarn
npm install -g babel-cli
npm install -g nodemon
npm install -g kexec

`yarn install`
yarn `cd frontend && yarn install`


Build
=====

Frontend

`npm run compile`

Run
===

**Socket server:**

dev: `yarn start`

prod: 
```
babel . -d dist --copy-files --ignore node_modules
node dist/server.js
```


### on server:

```
node 10.6.0
npm install -g forever
```
git post-receive hook:
```
#!/bin/bash -l

ENV="production"
APP_DIR="/home/app/apps/webphone-node"
DIR=$(pwd)
RED='\033[0;31m'
NC='\033[0m'

while read oldrev newrev ref
do
    branch=`echo $ref | cut -d/ -f3`
    git --work-tree=$APP_DIR checkout -f $branch
    echo "$newrev" > $APP_DIR/REVISION

	function catch_errors() {
	   echo -e "${RED}Script aborted, because of errors ${NC}"
	   cd $DIR
	   git update-ref HEAD $oldrev
	   exit 0;
	}

	trap catch_errors ERR;

  cd $APP_DIR
  nvm use
  yarn install
  NODE_ENV=$ENV yarn build
  sudo systemctl restart webphone-node
done
```

nginx conf:
```
upstream websocket {
    server unix:/home/app/apps/webphone-node/dist/tmp/webphone.sock;
}

server {
    server_name   ns11.lab4thinking.fr;

    #charset koi8-r;

    #access_log  logs/host.access.log  main;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
#          root   /usr/share/nginx/html;
#          index index.html index.htm;
    }


    location /ws {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /janus {
        proxy_pass http://127.0.0.1:8088/janus;
    }

    location /fs {
        alias /home/app/apps/webphone/frontend/dist;
        index  index.html index.htm;
        auth_basic "Private Property";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location /mizu {
        alias /home/app/apps/webphone-mizu/frontend/dist;
        index  index.html index.htm;
        auth_basic "Private Property";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

```

Systemd script

```
[Unit]
Description=Webphone Nodejs server
After=network.target

[Service]
Restart=always
WorkingDirectory=/home/app/apps
Environment="NODE_ENV=production"
User=app
ExecStart=/home/app/.nvm/versions/node/v10.6.0/bin/node webphone-node/dist/bin/server.js
RestartSec=500ms
StartLimitInterval=0

[Install]
WantedBy=multi-user.target
```
place to `/etc/systemd/system/webphone-node.service`
```
sudo systemctl daemon-reload 
sudo systemctl enable webphone-node
sudo systemctl start webphone-node
```



## Janus
systemd
/etc/systemd/system/janus.service:
```
[Unit]
Description=Janus WebRTC gateway
After=network.target

[Service]
Type=simple
ExecStart=/opt/janus/bin/janus -o
Restart=on-abnormal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```
