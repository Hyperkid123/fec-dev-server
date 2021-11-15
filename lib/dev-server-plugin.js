const fs = require('fs')
const path = require('path')
var colors = require('colors/safe')
const express = require('express');
const WebSocket = require('ws')
const http = require('http');
const CommonJsRequireDependency = require("webpack/lib/dependencies/CommonJsRequireDependency")

const CONSOLE_PREFIX = '[fec-dev-server]'

class FECWebpackDevServerPlugin {
    constructor(options = {}, compiler) {
        this.options = options;
        this.compiler = compiler;
        this.app;
        this.serverStarted = false;
        this.wss
        this.server
        this.startCallback = new Promise((res, rej) => {
            this.enableServer = () => {
                this.serverStarted = true;
                return res()
            };
            this.stopServer = (err) => {
                console.error(CONSOLE_PREFIX, colors.red('unexpected server error'))
                rej(err)
            }
        })
    }


    async setupServer() {
        await this.startCallback
        this.server = http.createServer(this.app)
        this.wss = new WebSocket.Server({
            server: this.server
        })
        this.wss.on('connection', (ws => {
            console.log('Browser connected to WS server')
            this.websocket = ws;
        }))
        this.server.listen(8080, () => {
            console.log(CONSOLE_PREFIX, 'Server listeting at: localhost:8080')
        })
    }
    
    setupApp() {
        this.app = new express()
        this.app.use(express.static(this.assetsDirectory))
    }

    setupHostHeaderCheck() {
        this.app.all("*", (req, res, next) => {
          if (this.checkHeader(req.headers, "host")) {
            return next();
          }
    
          res.send("Invalid Host header");
        });
    }

    startDevServer() {
        this.setupApp()
        // this.setupHostHeaderCheck()
        this.setupServer()
    }

    refreshServer() {

    }

    apply(compiler) {
        const outputPath = compiler.options.output.path;        
        let outputStats
        try {
            outputStats = fs.lstatSync(outputPath)
        } catch (error) {
            console.error(CONSOLE_PREFIX, colors.red('Could not find webpack output files: '), outputPath);
            throw error
        }
        const isDir = outputStats.isDirectory();
        if(!isDir) {
            console.error(CONSOLE_PREFIX, colors.red('Webpack output is not a directory!'))
            process.exit(1)
        }
        this.assetsDirectory = outputPath;
        this.startDevServer()
    
        compiler.hooks.done.tap('FECWebpackDevServerPlugin', (stats) => {
            const output = stats.compilation.options.output;
            if(!this.serverStarted) {
                /**
                 * Find a webpack way to do ws injecting
                 */
                fs.copyFileSync(path.resolve(__dirname, '../client/ws-client.js'), path.resolve(this.assetsDirectory, './ws-client.js'))
                this.enableServer()
            } else {
                console.log({foo: this.websocket})
                if(this.websocket) {
                    this.websocket.send('refresh')
                }
            }
        })
    }
}

module.exports = FECWebpackDevServerPlugin;
