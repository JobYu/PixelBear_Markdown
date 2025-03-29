// 初始化编辑器
let editor;
let preview;
let toast;
let toastMessage;

// 样式设置
let fontFamily;
let fontSize;
let themeColor;
let lineHeight;
let useIndent;

// 链接引用收集
let linkReferences = [];
let linkReferenceMap = {};

// 示例 Markdown 文本
const sampleMarkdown = `# Markdown 转公众号格式示例

> 这是一个将 Markdown 转换为微信公众号格式的工具。

## 1. 文本格式

**粗体文本**，*斜体文本*，~~删除线文本~~，\`行内代码\`

## 2. 列表

### 无序列表

- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 3. 代码块

\`\`\`javascript
// 这是一段 JavaScript 代码
function hello() {
  console.log("Hello, WeChat!");
}
hello();
\`\`\`

## 4. 表格

| 姓名 | 年龄 | 职业 |
| ---- | ---- | ---- |
| 张三 | 25 | 工程师 |
| 李四 | 30 | 设计师 |
| 王五 | 28 | 产品经理 |

## 5. 图片

![示例图片](./pixelbear.jpg)

## 6. 链接

[Doocs/md 项目](https://github.com/doocs/md)

[微信公众号文档](https://mp.weixin.qq.com/wiki)

[GitHub](https://github.com)

## 7. 引用

> 这是一段引用文本
> 
> 这是引用的第二行

## 8. 分割线

---

## 9. 任务列表

- [x] 已完成任务
- [ ] 未完成任务
- [ ] 计划中的任务

## 10. 数学公式

行内公式：$E = mc^2$

行间公式：

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

`;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEditor();
    initEventListeners();
    applyStyles();
    
    // 加载示例内容并立即更新预览
    editor.setValue(sampleMarkdown);
    updatePreview();
    
    // 确保预览区域可见
    preview.style.display = 'block';
});

// 初始化元素
function initElements() {
    preview = document.getElementById('preview');
    toast = document.querySelector('.toast');
    toastMessage = document.getElementById('toastMessage');
    
    // 样式设置元素
    fontFamily = document.getElementById('fontFamily');
    fontSize = document.getElementById('fontSize');
    themeColor = document.getElementById('themeColor');
    lineHeight = document.getElementById('lineHeight');
    useIndent = document.getElementById('useIndent');
    
    // 确保预览区域存在
    if (!preview) {
        console.error('预览区域元素不存在');
    }
}

// 初始化编辑器
function initEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'default',
        extraKeys: {
            'Ctrl-Enter': updatePreview
        }
    });
    
    // 编辑器内容变化时更新预览
    editor.on('change', () => {
        console.log('编辑器内容已变化，更新预览');
        updatePreview();
    });
}

// 初始化事件监听器
function initEventListeners() {
    // 清空按钮
    document.getElementById('clearBtn').addEventListener('click', () => {
        editor.setValue('');
    });
    
    // 加载示例按钮
    document.getElementById('loadSampleBtn').addEventListener('click', () => {
        editor.setValue(sampleMarkdown);
    });
    
    // 复制 HTML 按钮
    document.getElementById('copyHtmlBtn').addEventListener('click', () => {
        copyToClipboard(preview.innerHTML, '已复制 HTML 到剪贴板');
    });
    
    // 复制文本按钮
    document.getElementById('copyTextBtn').addEventListener('click', () => {
        copyToClipboard(preview.innerText, '已复制文本到剪贴板');
    });
    
    // 样式设置变化时更新预览
    fontFamily.addEventListener('change', applyStyles);
    fontSize.addEventListener('change', applyStyles);
    themeColor.addEventListener('input', applyStyles);
    lineHeight.addEventListener('change', applyStyles);
    useIndent.addEventListener('change', applyStyles);
}

// 应用样式
function applyStyles() {
    // 应用样式到预览区域
    preview.style.fontFamily = fontFamily.value;
    preview.style.fontSize = fontSize.value;
    preview.style.lineHeight = lineHeight.value;
    
    // 更新主题色
    document.documentElement.style.setProperty('--theme-color', themeColor.value);
    
    // 更新所有标题颜色
    const headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        heading.style.color = themeColor.value;
    });
    
    // 更新引用块边框颜色
    const blockquotes = preview.querySelectorAll('blockquote');
    blockquotes.forEach(blockquote => {
        blockquote.style.borderLeftColor = themeColor.value;
        blockquote.style.backgroundColor = `${hexToRgba(themeColor.value, 0.05)}`;
    });
    
    // 更新链接颜色
    const links = preview.querySelectorAll('a');
    links.forEach(link => {
        link.style.color = themeColor.value;
        link.style.borderBottomColor = `${hexToRgba(themeColor.value, 0.3)}`;
    });
    
    // 应用首行缩进
    const paragraphs = preview.querySelectorAll('p');
    paragraphs.forEach(p => {
        if (useIndent.checked) {
            p.classList.add('indent');
        } else {
            p.classList.remove('indent');
        }
    });
    
    // 更新引用链接列表样式
    const referenceList = preview.querySelector('.reference-list');
    if (referenceList) {
        referenceList.style.borderTop = `1px solid ${hexToRgba(themeColor.value, 0.3)}`;
        referenceList.style.marginTop = '2em';
        referenceList.style.paddingTop = '1em';
        
        const referenceItems = referenceList.querySelectorAll('.reference-item');
        referenceItems.forEach(item => {
            const refNumber = item.querySelector('.reference-number');
            if (refNumber) {
                refNumber.style.color = themeColor.value;
                refNumber.style.fontWeight = 'bold';
            }
        });
    }
}

// 更新预览
function updatePreview() {
    const markdownText = editor.getValue();
    console.log('更新预览，Markdown 文本长度:', markdownText.length);
    
    if (!markdownText) {
        preview.innerHTML = '<p>请在左侧输入 Markdown 文本</p>';
        return;
    }
    
    try {
        // 重置链接引用
        linkReferences = [];
        linkReferenceMap = {};
        
        // 配置 marked 选项
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function(code, lang) {
                try {
                    if (lang && hljs.getLanguage(lang)) {
                        return hljs.highlight(code, { language: lang }).value;
                    } else {
                        return hljs.highlightAuto(code).value;
                    }
                } catch (e) {
                    console.error('代码高亮出错:', e);
                    return code;
                }
            },
            pedantic: false,
            gfm: true,
            breaks: true,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false
        });
        
        // 自定义渲染器
        const renderer = new marked.Renderer();
        
        // 自定义链接渲染
        renderer.link = function(href, title, text) {
            // 微信公众号文章链接特殊处理
            if (href.startsWith('https://mp.weixin.qq.com')) {
                return `<a href="${href}" title="${title || text}" style="color:${themeColor.value};border-bottom:1px solid ${hexToRgba(themeColor.value, 0.3)};">${text}</a>`;
            }
            
            // 收集链接引用
            let refIndex = linkReferenceMap[href];
            if (refIndex === undefined) {
                refIndex = linkReferences.length + 1;
                linkReferences.push({
                    href: href,
                    title: title || text,
                    text: text
                });
                linkReferenceMap[href] = refIndex;
            }
            
            // 普通链接，不再添加引用编号
            return `<a href="${href}" title="${title || text}" style="color:${themeColor.value};border-bottom:1px solid ${hexToRgba(themeColor.value, 0.3)};">${text}</a>`;
        };
        
        // 自定义图片渲染
        renderer.image = function(href, title, text) {
            return `<img src="${href}" alt="${text}" title="${title || ''}" style="max-width:100%;display:block;margin:1em auto;border-radius:5px;">`;
        };
        
        // 自定义标题渲染
        renderer.heading = function(text, level) {
            return `<h${level} style="color:${themeColor.value};margin-top:1.2em;margin-bottom:0.8em;font-weight:bold;line-height:1.35;">${text}</h${level}>`;
        };
        
        // 自定义引用块渲染
        renderer.blockquote = function(quote) {
            return `<blockquote style="margin:1em 0;padding:0.5em 1em;border-left:4px solid ${themeColor.value};background-color:${hexToRgba(themeColor.value, 0.05)};color:#666;">${quote}</blockquote>`;
        };
        
        // 自定义代码块渲染
        renderer.code = function(code, language) {
            try {
                let validLanguage = 'plaintext';
                let highlightedCode = code;
                
                if (language && hljs.getLanguage(language)) {
                    validLanguage = language;
                    highlightedCode = hljs.highlight(code, { language: validLanguage }).value;
                } else {
                    const result = hljs.highlightAuto(code);
                    highlightedCode = result.value;
                    validLanguage = result.language || 'plaintext';
                }
                
                return `<pre style="background-color:#f8f8f8;border-radius:5px;padding:1em;overflow-x:auto;"><code class="hljs language-${validLanguage}">${highlightedCode}</code></pre>`;
            } catch (e) {
                console.error('代码块渲染出错:', e);
                return `<pre style="background-color:#f8f8f8;border-radius:5px;padding:1em;overflow-x:auto;"><code>${code}</code></pre>`;
            }
        };
        
        // 设置渲染器
        marked.setOptions({ renderer });
        
        // 转换 Markdown 为 HTML
        let html = marked.parse(markdownText);
        console.log('Markdown 已转换为 HTML');
        
        // 添加链接引用列表
        if (linkReferences.length > 0) {
            html += generateLinkReferenceList();
        }
        
        // 更新预览
        preview.innerHTML = html;
        console.log('预览已更新');
        
        // 应用样式
        applyStyles();
        
        // 处理任务列表
        processTaskLists();
        
        // 处理数学公式（简单实现，实际可能需要 MathJax 或 KaTeX）
        processMathEquations();
    } catch (error) {
        console.error('Markdown 转换出错:', error);
        preview.innerHTML = `<p>转换出错: ${error.message}</p>`;
    }
}

// 生成链接引用列表
function generateLinkReferenceList() {
    let html = '<div class="reference-list" style="border-top:1px solid rgba(15, 76, 129, 0.3);margin-top:2em;padding-top:1em;">';
    html += '<h3 style="color:#0F4C81;font-weight:bold;">参考链接</h3>';
    html += '<ul style="padding-left:1em;list-style-type:none;">';
    
    linkReferences.forEach((ref) => {
        html += `<li class="reference-item" style="margin-bottom:1em;padding-left:0.5em;">
            <a href="${ref.href}" target="_blank" style="color:#0F4C81;text-decoration:none;border-bottom:1px solid rgba(15, 76, 129, 0.3);">${ref.title}</a>
            <br>
            <span style="color:#666;font-size:0.9em;word-break:break-all;">${ref.href}</span>
        </li>`;
    });
    
    html += '</ul></div>';
    return html;
}

// 处理任务列表
function processTaskLists() {
    const lis = preview.querySelectorAll('li');
    lis.forEach(li => {
        const text = li.innerHTML;
        if (text.startsWith('[ ] ')) {
            li.innerHTML = text.replace('[ ] ', '<span style="display:inline-block;width:1.2em;height:1.2em;border:1px solid #ddd;border-radius:3px;margin-right:0.5em;"></span>');
        } else if (text.startsWith('[x] ')) {
            li.innerHTML = text.replace('[x] ', '<span style="display:inline-block;width:1.2em;height:1.2em;border:1px solid #ddd;border-radius:3px;margin-right:0.5em;background-color:#0F4C81;position:relative;"><span style="position:absolute;top:-0.2em;left:0.15em;color:white;">✓</span></span>');
        }
    });
}

// 处理数学公式（简单实现）
function processMathEquations() {
    // 注意：这只是一个简单的实现，实际应用中应该使用 MathJax 或 KaTeX
    const content = preview.innerHTML;
    
    // 行内公式
    let processedContent = content.replace(/\$([^\$]+)\$/g, '<span class="math-inline" style="font-style:italic;font-family:serif;">$1</span>');
    
    // 行间公式
    processedContent = processedContent.replace(/\$\$([^\$]+)\$\$/g, '<div class="math-block" style="text-align:center;font-style:italic;font-family:serif;margin:1em 0;">$1</div>');
    
    preview.innerHTML = processedContent;
}

// 复制到剪贴板
function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(message);
    }).catch(err => {
        showToast('复制失败: ' + err);
    });
}

// 显示提示框
function showToast(message) {
    toastMessage.textContent = message;
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// 十六进制颜色转 RGBA
function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
} 