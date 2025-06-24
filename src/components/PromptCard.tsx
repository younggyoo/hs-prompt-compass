
import { useState } from "react";
import { Copy, CheckCircle, ChevronDown, ChevronUp, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Prompt {
  id: string;
  title: string;
  role: string;
  type: string;
  description: string;
  content: string;
  result?: string;
  likes: number;
  createdAt: Date;
}

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (content: string, title: string) => void;
  onLike: (id: string) => void;
}

const PromptCard = ({ prompt, onCopy, onLike }: PromptCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const handleCopy = () => {
    onCopy(prompt.content, prompt.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    onLike(prompt.id);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 flex flex-col h-full">
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
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {prompt.likes}
            </span>
          </div>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {prompt.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          <Collapsible open={isContentOpen} onOpenChange={setIsContentOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                프롬프트 내용 보기
                {isContentOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {prompt.content}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {prompt.result && (
            <Collapsible open={isResultOpen} onOpenChange={setIsResultOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  프롬프트 결과 보기
                  {isResultOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <div className="text-sm text-green-800 dark:text-green-200 leading-relaxed whitespace-pre-wrap">
                    {prompt.result}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {prompt.createdAt.toLocaleDateString('ko-KR')}
          </span>
          <Button
            onClick={handleCopy}
            size="lg"
            className={`transition-all duration-200 px-6 py-3 text-base font-semibold ${
              copied 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                복사됨!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                프롬프트 복사
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptCard;
