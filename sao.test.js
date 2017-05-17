const { resolve } = require('path');
const test = require('ava');
const sao = require('sao');

const template = {
  fromPath: resolve('.'),
};

function getFileContents(file) {
  return file.contents.toString();
}

function getConfig(file) {
  const contents = getFileContents(file).replace(/(\r\n|\n|\r)/gm, '');
  const config = contents.split('kibana.Plugin(')[1];
  return config;
}

test('skips files when answering no', (t) => {
  t.plan(8);

  return sao.mockPrompt(template, {
    generateApp: false,
    generateTranslations: false,
    generateHack: false,
    generateApi: false,
  })
  .then((res) => {
    // check output files
    t.is(res.fileList.includes('public/app.js'), false, 'no sample app');
    t.is(res.fileList.includes('translations/es.json'), false, 'no translations');
    t.is(res.fileList.includes('public/hack.js'), false, 'no sample hack');
    t.is(res.fileList.includes('server/routes/example.js'), false, 'no sample server');

    const uiExports = getConfig(res.files['index.js']);
    t.is(uiExports.indexOf('app:'), -1);
    t.is(uiExports.indexOf('translations:'), -1);
    t.is(uiExports.indexOf('hacks:'), -1);
    t.is(uiExports.indexOf('init(server, options)'), -1);
  });
});

test('includes app when answering yes', (t) => {
  t.plan(8);

  return sao.mockPrompt(template, {
    generateApp: true,
    generateTranslations: false,
    generateHack: false,
    generateApi: false,
  })
  .then((res) => {
    // check output files
    t.is(res.fileList.includes('public/app.js'), true, 'sample app');
    t.is(res.fileList.includes('translations/es.json'), false, 'no translations');
    t.is(res.fileList.includes('public/hack.js'), false, 'no sample hack');
    t.is(res.fileList.includes('server/routes/example.js'), false, 'no sample server');

    const uiExports = getConfig(res.files['index.js']);
    t.not(uiExports.indexOf('app:'), -1);
    t.is(uiExports.indexOf('translations:'), -1);
    t.is(uiExports.indexOf('hacks:'), -1);
    t.is(uiExports.indexOf('init(server, options)'), -1);
  });
});

test('includes translations when answering yes', (t) => {
  t.plan(8);

  return sao.mockPrompt(template, {
    generateApp: true,
    generateTranslations: true,
    generateHack: false,
    generateApi: false,
  })
  .then((res) => {
    // check output files
    t.is(res.fileList.includes('public/app.js'), true, 'sample app');
    t.is(res.fileList.includes('translations/es.json'), true, 'translations');
    t.is(res.fileList.includes('public/hack.js'), false, 'no sample hack');
    t.is(res.fileList.includes('server/routes/example.js'), false, 'no sample server');

    const uiExports = getConfig(res.files['index.js']);
    t.not(uiExports.indexOf('app:'), -1);
    t.not(uiExports.indexOf('translations:'), -1);
    t.is(uiExports.indexOf('hacks:'), -1);
    t.is(uiExports.indexOf('init(server, options)'), -1);
  });
});

test('includes hack when answering yes', (t) => {
  t.plan(8);

  return sao.mockPrompt(template, {
    generateApp: true,
    generateTranslations: true,
    generateHack: true,
    generateApi: false,
  })
  .then((res) => {
    // check output files
    t.is(res.fileList.includes('public/app.js'), true, 'sample app');
    t.is(res.fileList.includes('translations/es.json'), true, 'translations');
    t.is(res.fileList.includes('public/hack.js'), true, 'no sample hack');
    t.is(res.fileList.includes('server/routes/example.js'), false, 'no sample server');

    const uiExports = getConfig(res.files['index.js']);
    t.not(uiExports.indexOf('app:'), -1);
    t.not(uiExports.indexOf('translations:'), -1);
    t.not(uiExports.indexOf('hacks:'), -1);
    t.is(uiExports.indexOf('init(server, options)'), -1);
  });
});

test('includes server api when answering yes', (t) => {
  t.plan(8);

  return sao.mockPrompt(template, {
    generateApp: true,
    generateTranslations: true,
    generateHack: true,
    generateApi: true,
  })
  .then((res) => {
    // check output files
    t.is(res.fileList.includes('public/app.js'), true, 'sample app');
    t.is(res.fileList.includes('translations/es.json'), true, 'translations');
    t.is(res.fileList.includes('public/hack.js'), true, 'no sample hack');
    t.is(res.fileList.includes('server/routes/example.js'), true, 'no sample server');

    const uiExports = getConfig(res.files['index.js']);
    t.not(uiExports.indexOf('app:'), -1);
    t.not(uiExports.indexOf('translations:'), -1);
    t.not(uiExports.indexOf('hacks:'), -1);
    t.not(uiExports.indexOf('init(server, options)'), -1);
  });
});

test('plugin config has correct name', (t) => {
  t.plan(2);

  return sao.mockPrompt(template, {
    name: 'Some fancy plugin',
    generateApp: true,
    generateTranslations: true,
    generateHack: true,
    generateApi: true,
  })
  .then((res) => {
    const contents = getFileContents(res.files['index.js']);
    const nameLine = contents.match('name: (.*)')[1];
    const mainLine = contents.match('main: (.*)')[1];

    t.not(nameLine.indexOf('some-fancy-plugin'), -1);
    t.not(mainLine.indexOf('plugins/some-fancy-plugin/app'), -1);
  });
});

test('sample app has correct values', (t) => {
  t.plan(2);

  return sao.mockPrompt(template, {
    name: 'Some fancy plugin',
    generateApp: true,
    generateTranslations: true,
    generateHack: true,
    generateApi: true,
  })
  .then((res) => {
    const contents = getFileContents(res.files['public/app.js']);
    const controllerLine = contents.match('.controller(.*)')[1];
    const titleLine = contents.match('\\$scope\.title(.*)')[1];

    t.not(controllerLine.indexOf('someFancyPluginHelloWorld'), -1);
    t.not(titleLine.indexOf('Some Fancy Plugin'), -1);
  });
});