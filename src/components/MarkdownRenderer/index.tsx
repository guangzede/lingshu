import React from 'react';
import { View, Text, RichText } from '@tarojs/components';
import './index.scss';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // 转义 HTML 特殊字符
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // 处理行内元素（粗体、斜体、代码、链接等）
  const processInlineElements = (text: string): string => {
    let processed = text;

    // 行内代码 `code`
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 粗体 **bold** 或 __bold__
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // 斜体 *italic* 或 _italic_
    processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    processed = processed.replace(/_([^_]+)_/g, '<em>$1</em>');

    // 链接 [text](url)
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    return processed;
  };

  // 处理代码块
  const processCodeBlocks = (lines: string[]): { content: string; skipLines: number } => {
    let codeBlockContent = '';
    let skipLines = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('```')) {
        if (codeBlockContent === '') {
          // 开始代码块
          codeBlockContent = '<pre><code>';
          skipLines = 1;
        } else {
          // 结束代码块
          codeBlockContent += '</code></pre>';
          skipLines = i + 1;
          break;
        }
      } else if (codeBlockContent !== '') {
        // 代码块内容
        codeBlockContent += escapeHtml(line) + '\n';
      }
    }
    
    return { content: codeBlockContent, skipLines };
  };

  // 将 Markdown 转换为 HTML
  const markdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    
    let lines = markdown.split('\n');
    let html = '';
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // 代码块
      if (line.trim().startsWith('```')) {
        const { content, skipLines } = processCodeBlocks(lines.slice(i));
        html += content;
        i += skipLines;
        continue;
      }
      
      // 引用块 > quote
      if (line.trim().startsWith('> ')) {
        const quoteContent = line.replace(/^>\s*/, '');
        html += `<blockquote>${processInlineElements(escapeHtml(quoteContent))}</blockquote>`;
        i++;
        continue;
      }
      
      // 无序列表 - item 或 * item
      if (/^(\s*)[-*]\s+(.+)$/.test(line)) {
        const match = line.match(/^(\s*)[-*]\s+(.+)$/);
        if (match) {
          const indent = match[1].length;
          const content = match[2];
          html += `<ul style="margin-left:${indent * 20}px;"><li>${processInlineElements(escapeHtml(content))}</li></ul>`;
          i++;
          continue;
        }
      }
      
      // 有序列表 1. item
      if (/^(\s*)\d+\.\s+(.+)$/.test(line)) {
        const match = line.match(/^(\s*)\d+\.\s+(.+)$/);
        if (match) {
          const indent = match[1].length;
          const content = match[2];
          html += `<ol style="margin-left:${indent * 20}px;"><li>${processInlineElements(escapeHtml(content))}</li></ol>`;
          i++;
          continue;
        }
      }
      
      // 标题
      if (line.startsWith('# ')) {
        html += `<h1>${processInlineElements(escapeHtml(line.replace('# ', '')))}</h1>`;
      } else if (line.startsWith('## ')) {
        html += `<h2>${processInlineElements(escapeHtml(line.replace('## ', '')))}</h2>`;
      } else if (line.startsWith('### ')) {
        html += `<h3>${processInlineElements(escapeHtml(line.replace('### ', '')))}</h3>`;
      } else if (line.startsWith('#### ')) {
        html += `<h4>${processInlineElements(escapeHtml(line.replace('#### ', '')))}</h4>`;
      } else if (line.startsWith('##### ')) {
        html += `<h5>${processInlineElements(escapeHtml(line.replace('##### ', '')))}</h5>`;
      } else if (line.startsWith('###### ')) {
        html += `<h6>${processInlineElements(escapeHtml(line.replace('###### ', '')))}</h6>`;
      } 
      // 分隔线
      else if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        html += '<hr/>';
      }
      // 空行
      else if (line.trim() === '') {
        html += '<br/>';
      }
      // 普通段落
      else {
        html += `<p>${processInlineElements(escapeHtml(line))}</p>`;
      }
      
      i++;
    }
    
    return html;
  };

  const htmlContent = markdownToHtml(content);

  return (
    <View className="markdown-renderer">
      <RichText nodes={htmlContent} />
    </View>
  );
};

export default MarkdownRenderer;