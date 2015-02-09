Kancolle-broker
===============

VPN server is forbidden in Japan and may have serious security problems. Kancolle-broker is the app to play DMM's kantai collection without having a proxy server - You are connecting to DMM's server directly.

Deploy the app on a Japan server, and login from it's webpage to get the direct game link.

Demo: https://kancolle.phoenixlzx.com

**ATTENTION**

This application does not need database, and will NOT store any account data. You could setup one but remember not to do anything bad.

I am not responsible for any loss by using this software.

### Deployment

1. Setup Node.js on a Japan server or a server which could login to dmm.com directly.
2. clone.
3. `npm install`
4. `npm start`
5. Setup NGINX and TLS, proxy pass to `http://127.0.0.1:3000`.

### License

MIT.
