#!/usr/bin/env node
const fs = require('fs');
const { execSync, execFileSync } = require('child_process');

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

function psqlOutput(args, opts = {}) {
  const psql = process.env.PSQL_PATH || 'psql';
  try {
    return execFileSync(psql, args, { env: process.env, encoding: 'utf8' });
  } catch (err) {
    return '';
  }
}

function main() {
  const databaseUrl = parseEnv();
  const { user, password, host, port, database } = parseDatabaseUrl(databaseUrl);
  if (!user || !password || !database) {
    console.error('Parsed DATABASE_URL is missing user, password, or database');
    process.exit(1);
  }

  // Set PGPASSWORD so psql can use the password if needed
  process.env.PGPASSWORD = password;

  console.log('Ensuring role exists:', user);
  const roleCheck = psqlOutput(['-h', host, '-p', String(port), '-d', 'postgres', '-tAc', `SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='${user}';`]);
  if (!roleCheck || !roleCheck.trim()) {
    console.log('Creating role:', user);
    runPsql(`CREATE ROLE "${user}" WITH LOGIN PASSWORD '${password}';`, { host, port, connectDb: 'postgres' });
  } else {
    console.log('Role already exists:', user);
  }

  console.log('Ensuring database exists:', database);
  const dbCheck = psqlOutput(['-h', host, '-p', String(port), '-d', 'postgres', '-tAc', `SELECT 1 FROM pg_database WHERE datname='${database}';`]);
  if (!dbCheck || !dbCheck.trim()) {
    console.log('Creating database:', database);
    runPsql(`CREATE DATABASE "${database}" OWNER "${user}";`, { host, port, connectDb: 'postgres' });
  } else {
    console.log('Database already exists:', database);
  }

  console.log('Bootstrap complete.');
}

main();
