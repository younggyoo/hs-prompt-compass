
import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Prompt {
  id: string;
  title: string;
  role: string;
  type: string;
  description: string;
  content: string;
  createdAt: Date;
}

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (content: string, title: string) => void;
}

const PromptCard = ({ prompt, onCopy }: PromptCardProps) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(prompt.content, prompt.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedContent = prompt.content.length > 150 
    ? prompt.content.substring(0, 150) + "..."
    : prompt.content;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {prompt.title}
            </CardTitle>
            <div className="flex gap-2 mb-3">
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {prompt.role}
              </Badge>
              <Badge variant="outline" className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300">
                {prompt.type}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {prompt.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
            {showFullContent ? prompt.content : truncatedContent}
          </div>
          {prompt.content.length > 150 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-blue-600 dark:text-blue-400 text-sm mt-2 hover:underline"
            >
              {showFullContent ? "접기" : "더보기"}
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {prompt.createdAt.toLocaleDateString('ko-KR')}
          </span>
          <Button
            onClick={handleCopy}
            variant={copied ? "default" : "outline"}
            size="sm"
            className={`transition-all duration-200 ${
              copied 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                복사됨!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                복사
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptCard;
