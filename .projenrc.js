const { TypeScriptAppProject } = require('projen');
const project = new TypeScriptAppProject({
  defaultReleaseBranch: 'main',
  name: 'kaleidoscinema',
  deps: [
    'get-image-colors@4.0.0',
    'jimp@0.16.1',
    'commander@8.0.0',
  ],
  devDeps: [
    '@types/get-image-colors@4.0.0',
  ],
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
    },
  },
  bin: {
    kaleido: './bin/kaleido.js',
  },
  gitignore: [
    "output",
    "in"
  ]
});
project.synth();