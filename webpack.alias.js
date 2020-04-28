const path = require('path');

module.exports = {
    'node_modules': path.join(__dirname, 'node_modules'),
    'src': path.join(__dirname, 'src'),
    'actions': path.join(__dirname, 'src/redux/actions'),
    'components': path.join(__dirname, 'src/components'),
    'elements': path.join(__dirname, 'src/components/elements'),
    'modals': path.join(__dirname, 'src/components/modals'),
    'reducers': path.join(__dirname, 'src/redux/reducers'),
    'scenario': path.join(__dirname, 'src/scenario'),
    'assets': path.join(__dirname, 'assets'),
    'templates': path.join(__dirname, 'src/scenarios/templates'),
    'libs': path.join(__dirname, 'src/libs'),
    'worker': path.join(__dirname, 'src/worker'),
    'store': path.join(__dirname, 'src/store'),
    'mobx': path.join(__dirname + '/node_modules/mobx/lib/mobx.es6.js'),
};