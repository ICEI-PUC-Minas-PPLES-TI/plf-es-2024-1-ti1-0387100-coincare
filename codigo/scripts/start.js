const { exec } = require('child_process');
const path = require('path');

// Caminho para o db.json
const dbPath = path.join(__dirname, '../JsonServer/db.json');

// Caminho para a pasta raiz onde estão seus arquivos HTML
const rootPath = path.join(__dirname, '..');

// Iniciar json-server
const jsonServer = exec(`json-server --watch ${dbPath} --port 3000`);

jsonServer.stdout.on('data', (data) => {
  console.log(`json-server: ${data}`);
});

jsonServer.stderr.on('data', (data) => {
  console.error(`json-server erro: ${data}`);
});

// Iniciar live-server
const liveServer = exec(`live-server ${rootPath} --port=3001`);

liveServer.stdout.on('data', (data) => {
  console.log(`live-server: ${data}`);
});

liveServer.stderr.on('data', (data) => {
  console.error(`live-server erro: ${data}`);
});
