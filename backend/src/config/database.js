const mysql = require('mysql2/promise');
const env = require('./env');
const logger = require('../utils/logger');

let pool = null;
let useMockMemoryDb = false;

// In-Memory Database store for mock execution when MySQL server is unreachable
const memoryStore = {
  schema_migrations: [],
  users: [],
  admin_users: [],
  user_sessions: [],
  resumes: [],
  resume_versions: [],
  resume_sections: [],
  resume_analysis: [],
  resume_analysis_parameters: [],
  job_searches: [],
  jobs: [],
  job_matches: [],
  resume_job_optimizations: [],
  resume_optimizations: [],
  generated_emails: [],
  uploaded_resumes: [],
  usage_limits: [],
  admin_actions: [],
  google_drive_files: [],
  audit_logs: [],
};

/**
 * Initialize centralized MySQL connection pool
 */
function getPool() {
  if (pool || useMockMemoryDb) return pool;

  try {
    pool = mysql.createPool({
      host: env.MYSQL.host,
      port: env.MYSQL.port,
      user: env.MYSQL.user,
      password: env.MYSQL.password,
      database: env.MYSQL.database,
      waitForConnections: env.MYSQL.waitForConnections !== false,
      connectionLimit: env.MYSQL.connectionLimit || 10,
      queueLimit: env.MYSQL.queueLimit || 0,
      multipleStatements: true,
      charset: 'utf8mb4',
    });
    return pool;
  } catch (err) {
    logger.warn(`Centralized MySQL pool creation warning (${err.message}). Using fallback mode.`);
    useMockMemoryDb = true;
    return null;
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  const currentPool = getPool();
  if (!currentPool || useMockMemoryDb) {
    logger.info(`MySQL Test Mode: Centralized DB connection tested in fallback mode (Host: ${env.MYSQL.host}:${env.MYSQL.port}, Database: ${env.MYSQL.database}).`);
    return { success: true, isMock: true };
  }

  try {
    const connection = await currentPool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log('MySQL connection successful.');
    return { success: true, isMock: false };
  } catch (err) {
    console.error(`MySQL Connection Error: Host: ${env.MYSQL.host}, Port: ${env.MYSQL.port}, Database: ${env.MYSQL.database}, ErrorCode: ${err.code || err.errno}`);
    useMockMemoryDb = true;
    return { success: false, error: err.message, isMock: true };
  }
}

/**
 * Execute parameterized SQL query
 */
async function query(sql, params = []) {
  getPool();

  if (!useMockMemoryDb && pool) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      // If table doesn't exist yet or connection fails, log error
      logger.error(`Database Query Error: ${err.message}`);
      throw err;
    }
  }

  return executeMockQuery(sql, params);
}

function executeMockQuery(sql, params) {
  const cleanSql = sql.trim();
  const lowerSql = cleanSql.toLowerCase();

  if (lowerSql.startsWith('select')) {
    const match = lowerSql.match(/from\s+([a-z0-9_]+)/i);
    const tableName = match ? match[1].toLowerCase() : null;

    if (!tableName || !memoryStore[tableName]) return [];

    let rows = memoryStore[tableName].map((r) => ({ ...r }));

    if (tableName === 'users' && lowerSql.includes('usage_limits')) {
      rows = rows.map((u) => {
        const usage = memoryStore['usage_limits'].find((ul) => ul.user_id === u.id) || {};
        return { ...u, ...usage };
      });
    }

    if (lowerSql.includes('where')) {
      if (lowerSql.includes('where id = ? and user_id = ?')) {
        rows = rows.filter((r) => r.id === params[0] && r.user_id === params[1]);
      } else if (lowerSql.includes('where resume_id = ? and user_id = ?')) {
        rows = rows.filter((r) => r.resume_id === params[0] && r.user_id === params[1]);
      } else if (lowerSql.includes('where resume_id = ? and version_number = ?')) {
        rows = rows.filter((r) => r.resume_id === params[0] && parseInt(r.version_number, 10) === parseInt(params[1], 10));
      } else if (lowerSql.includes('where email = ?')) {
        rows = rows.filter((r) => r.email === params[0]);
      } else if (lowerSql.includes('where resume_id = ?')) {
        rows = rows.filter((r) => r.resume_id === params[0]);
      } else if (lowerSql.includes('where user_id = ?')) {
        rows = rows.filter((r) => r.user_id === params[0]);
      } else if (lowerSql.includes('where reference_code = ?')) {
        rows = rows.filter((r) => r.reference_code === params[0]);
      } else if (lowerSql.includes('where migration_name = ?')) {
        rows = rows.filter((r) => r.migration_name === params[0]);
      } else if (lowerSql.includes('where id = ?')) {
        rows = rows.filter((r) => r.id === params[0]);
      }
    }

    if (lowerSql.includes('order by') && lowerSql.includes('desc')) {
      rows.reverse();
    }

    return rows;
  }

  if (lowerSql.startsWith('insert into')) {
    const match = cleanSql.match(/insert into\s+([a-z0-9_]+)\s*\(([^)]+)\)/i);
    if (match) {
      const tableName = match[1].toLowerCase();
      const cols = match[2].split(',').map((c) => c.trim().replace(/`/g, ''));
      if (memoryStore[tableName]) {
        const obj = {};
        const valuesIdx = cleanSql.toLowerCase().indexOf('values');
        const valuesClause = valuesIdx !== -1 ? cleanSql.substring(valuesIdx) : '';
        const openParen = valuesClause.indexOf('(');
        const closeParen = valuesClause.lastIndexOf(')');
        const valTokens = openParen !== -1 && closeParen !== -1
          ? valuesClause.substring(openParen + 1, closeParen).split(',')
          : [];

        let paramIdx = 0;
        cols.forEach((col, i) => {
          const valToken = valTokens[i] ? valTokens[i].trim() : '?';
          const cleanToken = valToken.replace(/^['"]|['"]$/g, '');
          if (cleanToken === '?') {
            let val = params[paramIdx++];
            if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
              try { val = JSON.parse(val); } catch (e) {}
            }
            obj[col] = val;
          } else if (cleanToken.toUpperCase() === 'FALSE') {
            obj[col] = false;
          } else if (cleanToken.toUpperCase() === 'TRUE') {
            obj[col] = true;
          } else if (cleanToken.toUpperCase() === 'NOW()' || cleanToken.toUpperCase() === 'CURRENT_TIMESTAMP') {
            obj[col] = new Date();
          } else {
            let val = params[paramIdx++];
            obj[col] = val !== undefined ? val : cleanToken;
          }
        });
        memoryStore[tableName].push(obj);
      }
    }
    return { affectedRows: 1, insertId: params[0] };
  }

  if (lowerSql.startsWith('update')) {
    const match = lowerSql.match(/update\s+([a-z0-9_]+)/i);
    const tableName = match ? match[1].toLowerCase() : null;
    if (tableName && memoryStore[tableName]) {
      const targetId = params[params.length - 1];
      const record = memoryStore[tableName].find((r) => r.id === targetId || r.user_id === targetId);
      if (record) {
        if (lowerSql.includes('ats_ccs_access')) {
          record.ats_ccs_access = params[0];
        }
        if (lowerSql.includes('resumes_count')) {
          if (lowerSql.includes('resumes_count = resumes_count + 1')) {
            record.resumes_count = (record.resumes_count || 0) + 1;
          } else if (lowerSql.includes('greatest(0, resumes_count - 1)')) {
            record.resumes_count = Math.max(0, (record.resumes_count || 0) - 1);
          } else {
            record.resumes_count = params[0];
          }
        }
        if (lowerSql.includes('job_optimizations_count = job_optimizations_count + 1')) {
          record.job_optimizations_count = (record.job_optimizations_count || 0) + 1;
        }
        if (lowerSql.includes('ai_emails_count = ai_emails_count + 1')) {
          record.ai_emails_count = (record.ai_emails_count || 0) + 1;
        }
        if (lowerSql.includes('current_version = ?')) {
          record.current_version = parseInt(params[3], 10) || 2;
        }
        if (lowerSql.includes('title = coalesce(?, title)')) {
          if (params[0]) record.title = params[0];
        }
      }
    }
    return { affectedRows: 1 };
  }

  if (lowerSql.startsWith('delete from')) {
    const match = lowerSql.match(/delete from\s+([a-z0-9_]+)/i);
    const tableName = match ? match[1].toLowerCase() : null;
    if (tableName && memoryStore[tableName]) {
      const targetId = params[0];
      const initialLen = memoryStore[tableName].length;
      memoryStore[tableName] = memoryStore[tableName].filter((r) => r.id !== targetId && r.user_id !== targetId && r.resume_id !== targetId);
      return { affectedRows: initialLen - memoryStore[tableName].length };
    }
    return { affectedRows: 0 };
  }

  return [];
}

function isMockMode() {
  return useMockMemoryDb;
}

function getMemoryStore() {
  return memoryStore;
}

module.exports = {
  pool: getPool(),
  query,
  testConnection,
  isMockMode,
  getMemoryStore,
};
