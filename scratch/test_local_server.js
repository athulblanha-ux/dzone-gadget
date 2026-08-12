const net = require('net');

const checkPort = (port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      console.log(`Port ${port} is open and active!`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`Port ${port} timed out.`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`Port ${port} is closed. Error: ${err.message}`);
      resolve(false);
    });
    
    socket.connect(port, '127.0.0.1');
  });
};

const testPorts = async () => {
  const ports = [27017, 5000, 5001];
  for (const port of ports) {
    await checkPort(port);
  }
  process.exit(0);
};

testPorts();
