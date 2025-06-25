
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
  views: number;
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
    <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:scale-[1.02] hover:border-[#A50034] dark:hover:border-[#A50034] flex flex-col h-full relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
              {prompt.title}
            </CardTitle>
            <div className="flex gap-2 mb-2">
              <Badge variant="secondary" className="bg-[#A50034]/10 dark:bg-[#A50034]/20 text-[#A50034] dark:text-[#A50034]">
                {prompt.role}
              </Badge>
              <Badge variant="outline" className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300">
                {prompt.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="text-gray-500 hover:text-[#A50034] dark:text-gray-400 dark:hover:text-[#A50034] hover:bg-[#A50034]/10 dark:hover:bg-[#A50034]/20 p-1 h-auto"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">
                  {prompt.likes}
                </span>
              </Button>
            </div>
          </div>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
          {prompt.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          <Collapsible open={isContentOpen} onOpenChange={setIsContentOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
              >
                📄 프롬프트 내용 보기
                {isContentOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3">
              <div className="absolute left-4 right-4 bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-lg z-10 animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
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
                  className="w-full justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  ✨ 프롬프트 결과 보기
                  {isResultOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <div className="absolute left-4 right-4 bg-[#A50034]/5 dark:bg-[#A50034]/10 rounded-lg p-4 border border-[#A50034]/20 dark:border-[#A50034]/30 shadow-lg z-10 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="text-sm text-[#A50034] dark:text-[#A50034] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {prompt.result}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
        
        <div className="flex items-center justify-end mt-auto pt-4">
          <Button
            onClick={handleCopy}
            size="lg"
            className={`transition-all duration-200 px-6 py-3 text-base font-semibold ${
              copied 
                ? "bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white shadow-xl" 
                : "bg-gradient-to-r from-[#A50034] via-[#B8003D] to-[#8B002B] hover:from-[#8B002B] hover:via-[#A50034] hover:to-[#730024] text-white shadow-xl hover:shadow-2xl"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                📋 복사됨!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                📋 프롬프트 복사
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptCard;
