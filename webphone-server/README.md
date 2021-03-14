"test gitlab + group"
node 10.6.0

```
npm install -g yarn
npm install -g babel-cli
npm install -g kexec
```

username: admin

password: webphonebabel 

git post-receive hook:
```
#!/bin/bash -l

source "/home/app/apps/webphone-server"
ENV="production"
APP_DIR="/home/app/apps/webphone-server"
DIR=$(pwd)

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
  sudo systemctl restart webphone-server     
done
```

nginx:
```
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
```



Systemd script

```
[Unit]
Description=Webphone App server
After=network.target
Wants=webphone-node.service

[Service]
Restart=always
WorkingDirectory=/home/app/apps
Environment="NODE_ENV=production"
User=app
ExecStart=/home/app/.nvm/versions/node/v10.6.0/bin/node webphone-server/dist/bin/server.js
RestartSec=500ms
StartLimitInterval=0

[Install]
WantedBy=multi-user.target
```
place to `/etc/systemd/system/webphone-server.service`
```
sudo systemctl daemon-reload 
sudo systemctl enable webphone-server
sudo systemctl start webphone-server
```
