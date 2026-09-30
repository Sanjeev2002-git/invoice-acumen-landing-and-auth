import net from 'node:net';

const jdbcUrl = process.env.DB_URL
  ?? 'jdbc:mysql://localhost:3306/invoice_acumen?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true';
const match = jdbcUrl.match(/^jdbc:mysql:\/\/([^/:?]+)(?::(\d+))?/);

if (!match) {
  console.error(`Invalid DB_URL. Expected a MySQL JDBC URL, received: ${jdbcUrl}`);
  process.exit(1);
}

const host = match[1];
const port = Number(match[2] ?? 3306);
const socket = net.createConnection({ host, port });
socket.setTimeout(2500);

socket.on('connect', () => socket.end());
socket.on('close', hadError => {
  if (hadError) process.exit(1);
});
socket.on('timeout', () => {
  console.error(`Cannot reach MySQL at ${host}:${port}. Start it with \`docker compose up -d db\`, then retry.`);
  socket.destroy();
  process.exit(1);
});
socket.on('error', () => {
  console.error(`Cannot reach MySQL at ${host}:${port}. Start it with \`docker compose up -d db\`, then retry.`);
  process.exit(1);
});
