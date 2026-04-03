#!/usr/bin/env node
const fs = require('fs');
const { execFileSync } = require('child_process');

function parseEnv() {
  const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
  const match = env.split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='));
  if (!match) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
  }
  let url = match.replace(/^DATABASE_URL=/, '').trim();
  if (url.startsWith('"') || url.startsWith("'")) url = url.slice(1, -1);
  return url;
}

function parseDatabaseUrl(databaseUrl) {
  try {
    const u = new URL(databaseUrl);
    return {
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      host: u.hostname || 'localhost',
      port: u.port || '5432',
      database: u.pathname.replace(/^\//, '') || undefined,
    };
  } catch (err) {
    console.error('Invalid DATABASE_URL:', err.message);
    process.exit(1);
  }
}

function runPsql(cmd, opts = {}) {
  const psql = process.env.PSQL_PATH || 'psql';
  try {
    execFileSync(psql, ['-h', opts.host, '-p', String(opts.port), '-d', opts.connectDb, '-c', cmd], {
      stdio: 'inherit',
      env: process.env,
    });
  } catch (err) {
    console.error('psql command failed:', err.message);
    process.exit(1);
  }
}

function main() {
  const databaseUrl = parseEnv();
  const { user, password, host, port, database } = parseDatabaseUrl(databaseUrl);
  if (!database) {
    console.error('Parsed DATABASE_URL is missing database');
    process.exit(1);
  }

  // Set PGPASSWORD so psql can use the password if needed
  if (password) process.env.PGPASSWORD = password;

  console.log('Dropping database if it exists:', database);
  const dropSql = `DROP DATABASE IF EXISTS "${database}";`;
  runPsql(dropSql, { host, port, connectDb: 'postgres' });

  console.log('Done.');
}

main();
