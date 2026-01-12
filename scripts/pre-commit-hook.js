#!/usr/bin/env node

const { spawn } = require('child_process');

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
      console.log('检测到 README.md 变动，正在自动翻译...');

      // 执行翻译脚本，确保环境变量被正确传递
      const script = spawn('bash', ['./scripts/translate-readme.sh'], {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      script.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      script.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      await new Promise((resolve, reject) => {
        script.on('close', (code) => {
          if (code === 0) {
            console.log('翻译完成');

            // 添加所有生成的翻译文件到暂存区
            const translatedFiles = LANGUAGES.map(lang => `docs/README.${lang}.md`);

            // 使用 git add 命令添加所有翻译文件
            const gitAdd = spawn('git', ['add', ...translatedFiles]);

            gitAdd.on('close', (addCode) => {
              if (addCode === 0) {
                console.log(`已将 ${translatedFiles.length} 个翻译文件添加到暂存区`);
                resolve();
              } else {
                console.error('添加翻译文件到暂存区失败');
                reject(new Error('Git add failed'));
              }
            });

            gitAdd.on('error', (err) => {
              console.error('Git add 命令执行出错:', err.message);
              reject(err);
            });
          } else {
            console.error('翻译失败');
            reject(new Error('Translation failed'));
          }
        });
      });
    }
  } catch (error) {
    console.error('提交钩子执行失败:', error.message);
    process.exit(1);
  }
}

runHook();