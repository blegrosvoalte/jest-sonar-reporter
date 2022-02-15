'use strict'

const fs = require('fs')
const path = require('path')
const xml = require('xml')
const xmlIndent = require('./utils/xmlIndent')
const testExecutions = require('./xml/testExecutions')

const DEFAULTS = {
    indent: 2,
    reportPath: './',
    reportFile: 'test-report.xml',
    sonar56x: false
};

function processor(results, options = {}) {
    options = Object.assign({}, DEFAULTS, options);

    const report = xml(testExecutions(results, options.sonar56x), {
        declaration: true,
        indent: xmlIndent(options.indent)
    })

    if (!fs.existsSync(options.reportPath)) {
        fs.mkdirSync(options.reportPath)
    }

    const reportFile = path.join(options.reportPath, options.reportFile)
    fs.writeFileSync(reportFile, report)

    if (process.env.DEBUG) {
        fs.writeFileSync('debug.json', JSON.stringify(results, null, 2))
    }

    return results;
}

function GenericTestDataReporter(globalConfig, options) {
    if (globalConfig.hasOwnProperty('testResults')) {
        return processor(globalConfig);
    }

    this._options = options;
    this.onRunComplete = (contexts, results) => {
        processor(results, this._options);
    };
}

module.exports = GenericTestDataReporter;
