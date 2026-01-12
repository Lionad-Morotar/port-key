#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOCK_FILE = path.join(__dirname, '../.git/hooks/translate.lock');

function log(message) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  console.log(`[${time}] ${message}`);
}

function error(message) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  console.error(`[${time}] ${message}`);
}

// 简单的锁机制
function acquireLock() {
  try {
    // 确保目录存在（虽然 .git/hooks 通常存在，但防万一）
    const dir = path.dirname(LOCK_FILE);
    if (!fs.existsSync(dir)) {
      // 如果是在非 git 环境运行，可能没有 .git 目录，降级到临时目录或当前目录
      // 这里假设是在项目根目录下运行
    }
    
    // 使用 wx 标志（排他性创建），如果文件存在则失败
    const fd = fs.openSync(LOCK_FILE, 'wx');
    fs.writeSync(fd, String(process.pid));
    fs.closeSync(fd);
    return true;
  } catch (err) {
    if (err.code === 'EEXIST') {
      return false;
    }
    throw err;
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (err) {
    error('释放锁失败: ' + err.message);
  }
}

// 进程退出时确保释放锁
process.on('exit', releaseLock);
process.on('SIGINT', () => { releaseLock(); process.exit(); });
process.on('SIGTERM', () => { releaseLock(); process.exit(); });
process.on('uncaughtException', (err) => { 
  error(err); 
  releaseLock(); 
  process.exit(1); 
});

// 检查是否有文件变动
function checkFileChanges() {
  return new Promise((resolve, reject) => {
    const git = spawn('git', ['diff', '--cached', '--name-only']);

    let output = '';
    git.stdout.on('data', (data) => {
      output += data.toString();
    });

    git.on('close', (code) => {
      if (code === 0) {
        const changedFiles = output.trim().split('\n').filter(f => f.length > 0);
        resolve(changedFiles);
      } else {
        reject(new Error('Git diff failed'));
      }
    });
  });
}

// 定义支持的语言列表
const LANGUAGES = ["cn", "es", "fr", "de", "ja", "ko", "ru", "ar", "pt", "it"];

// 检查是否包含 README.md
async function runHook() {
  try {
    const changedFiles = await checkFileChanges();

    if (changedFiles.includes('README.md')) {
      // 尝试获取锁
      if (!acquireLock()) {
        error('错误: 另一个翻译任务正在运行中。请等待其完成或手动强制删除锁文件 (.git/hooks/translate.lock)。');
        process.exit(1);
      }

      log('检测到 README.md 变动，正在自动翻译...');

      // 执行翻译脚本，确保环境变量被正确传递
      // 设置超时时间为 10 分钟 (600000 ms)
      const script = spawn('bash', ['./scripts/translate-readme.sh'], {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 1000 * 120 * LANGUAGES.length
      });

      script.stdout.on('data', (data) => {
        process.stdout.write(`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${data}`);
      });

      script.stderr.on('data', (data) => {
        process.stderr.write(`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${data}`);
      });

      await new Promise((resolve, reject) => {
        script.on('close', (code) => {
          if (code === 0) {
            log('翻译完成');

            // 添加所有生成的翻译文件到暂存区
            // 使用通配符模式添加 docs 目录下所有 README.*.md 文件，避免硬编码语言列表
            const gitAdd = spawn('git', ['add', 'docs/README.*.md']);

            gitAdd.on('close', (addCode) => {
              if (addCode === 0) {
                log(`已将翻译文件添加到暂存区`);
                resolve();
              } else {
                error('添加翻译文件到暂存区失败');
                reject(new Error('Git add failed'));
              }
            });

            gitAdd.on('error', (err) => {
              error('Git add 命令执行出错: ' + err.message);
              reject(err);
            });
          } else {
            error('翻译失败');
            reject(new Error('Translation failed'));
          }
        });
      });
    }
  } catch (err) {
    error('提交钩子执行失败: ' + err.message);
    process.exit(1);
  }
}

runHook();