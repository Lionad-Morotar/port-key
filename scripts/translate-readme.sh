#!/bin/bash

# 检查是否安装了 node 和 npx
if ! command -v node &> /dev/null || ! command -v npx &> /dev/null; then
    echo "错误: 请确保已安装 Node.js 和 npm"
    exit 1
fi

# 检查是否存在 readme.md 文件
if [ ! -f "README.md" ]; then
    echo "错误: 未找到 README.md 文件"
    exit 1
fi

# 创建 docs 目录（如果不存在）
mkdir -p docs

# 定义待翻译语种
LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it")

# 循环执行翻译任务
for lang in "${LANGUAGES[@]}"; do
    echo "正在翻译为 $lang..."

    # 根据语言设置 fabric 提示词
    case $lang in
        "cn")
            prompt="将以下内容翻译为中文"
            ;;
        "es")
            prompt="将以下内容翻译为西班牙语"
            ;;
        "fr")
            prompt="将以下内容翻译为法语"
            ;;
        "de")
            prompt="将以下内容翻译为德语"
            ;;
        "ja")
            prompt="将以下内容翻译为日语"
            ;;
        "ko")
            prompt="将以下内容翻译为韩语"
            ;;
        "ru")
            prompt="将以下内容翻译为俄语"
            ;;
        "ar")
            prompt="将以下内容翻译为阿拉伯语"
            ;;
        "pt")
            prompt="将以下内容翻译为葡萄牙语"
            ;;
        "it")
            prompt="将以下内容翻译为意大利语"
            ;;
    esac

    # 执行翻译
    cat ./README.md | awk -v p="$prompt" 'BEGIN { print p "\n" } { print $0 }' | fabric -p translate | sponge "./docs/README.$lang.md"

    # 增加文件头说明
    sed -i '' '1s/^/<!-- Auto Generated - Do Not Edit -->\n/' "./docs/README.$lang.md"

    echo "翻译完成: docs/README.$lang.md"
done

echo "所有翻译任务已完成"