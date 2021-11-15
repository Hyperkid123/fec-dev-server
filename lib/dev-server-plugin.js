const fs = require('fs')
var colors = require('colors/safe')
const express = require('express');

const CONSOLE_PREFIX = '[fec-dev-server]'

class FECWebpackDevServerPlugin {
    constructor(options = {}, compiler) {
        this.options = options;
        this.compiler = compiler;
        this.app;
    }


    setupServer() {
        this.app.listen(8080, () => {
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

    apply(compiler) {
        console.log('Plugin started')
        compiler.hooks.done.tap('FECWebpackDevServerPlugin', (stats) => {
            const output = stats.compilation.outputOptions;
            const outputPath = output.path
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
        })
    }
}

module.exports = FECWebpackDevServerPlugin;
