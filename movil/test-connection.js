/**
 * Script para probar la conectividad del servidor backend
 * Ejecutar con: node test-connection.js
 */

const https = require('https');
const http = require('http');

const servers = [
  { name: 'Localhost', url: 'http://localhost:8080' },
  { name: 'Android Emulator', url: 'http://10.0.2.2:8080' },
  { name: 'Physical Device', url: 'http://10.3.234.28:8080' }
];

async function testServer(server) {
  return new Promise((resolve) => {
    const url = new URL(server.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${server.name}: ${res.statusCode} - ${res.statusMessage}`);
      resolve({ server: server.name, status: 'success', code: res.statusCode });
    });

    req.on('error', (err) => {
      console.log(`❌ ${server.name}: ${err.message}`);
      resolve({ server: server.name, status: 'error', message: err.message });
    });

    req.on('timeout', () => {
      console.log(`⏰ ${server.name}: Timeout`);
      req.destroy();
      resolve({ server: server.name, status: 'timeout' });
    });

    req.setTimeout(5000);
    req.end();
  });
}

async function testAllServers() {
  console.log('🔍 Probando conectividad del servidor backend...\n');
  
  const results = [];
  for (const server of servers) {
    const result = await testServer(server);
    results.push(result);
  }

  console.log('\n📊 Resumen:');
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status !== 'success');

  console.log(`✅ Exitosos: ${successful.length}`);
  console.log(`❌ Fallidos: ${failed.length}`);

  if (successful.length > 0) {
    console.log('\n🎉 ¡Servidor funcionando! Puedes usar cualquiera de estas URLs:');
    successful.forEach(r => {
      const server = servers.find(s => s.name === r.server);
      console.log(`   - ${server.url}`);
    });
  } else {
    console.log('\n⚠️  No se pudo conectar a ningún servidor.');
    console.log('   Verifica que el backend esté funcionando en el puerto 8080.');
  }

  return results;
}

// Ejecutar las pruebas
testAllServers().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Error ejecutando pruebas:', err);
  process.exit(1);
});
