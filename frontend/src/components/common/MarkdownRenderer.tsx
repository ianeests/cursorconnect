import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown 
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          // Style headings
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-4 mb-2" {...props} />,
          
          // Style links
          a: ({ node, ...props }) => (
            <a
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          
          // Style code blocks with improved formatting and language label
          pre: ({ node, children, className, ...props }) => {
            const language = /language-(\w+)/.exec(className || '')?.[1] || '';
            return (
              <div className="relative">
                <pre 
                  className="bg-accent/50 p-3 rounded-md overflow-auto my-3 text-xs" 
                  data-language={language}
                  {...props}
                >
                  {children}
                </pre>
              </div>
            );
          },
          code: ({ node, inline, className, children, ...props }: { 
            node?: any;
            inline?: boolean; 
            className?: string; 
            children?: React.ReactNode;
          }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <code className={cn("block font-mono text-xs p-0", className)} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-accent/30 px-1 py-0.5 rounded font-mono text-xs" {...props}>
                {children}
              </code>
            );
          },
          
          // Style lists
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
          
          // Style blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-border pl-4 py-1 my-2 text-muted-foreground italic" {...props} />
          ),
          
          // Style paragraphs
          p: ({ node, ...props }) => <p className="my-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 