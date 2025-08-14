
import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface PromptRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promptData: {
    title: string;
    role: string;
    type: string;
    description: string;
    content: string;
    result?: string;
    tool?: string;
    author: string;
    password: string;
  }) => void;
  editPrompt?: {
    id: string;
    title: string;
    role: string;
    type: string;
    description: string;
    content: string;
    result?: string;
    tool?: string;
    author: string;
    password?: string;
  } | null;
}

const PromptRegistration = ({ isOpen, onClose, onSubmit, editPrompt }: PromptRegistrationProps) => {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("기획");
  const [type, setType] = useState("아이디어");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [tool, setTool] = useState<string[]>([]);
  const [author, setAuthor] = useState("");
  const [password, setPassword] = useState("");
  
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const resultTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editPrompt) {
      setTitle(editPrompt.title);
      setRole(editPrompt.role);
      setType(editPrompt.type);
      setDescription(editPrompt.description);
      setContent(editPrompt.content);
      setResult(editPrompt.result || "");
      setTool(editPrompt.tool ? (typeof editPrompt.tool === 'string' ? editPrompt.tool.split(', ') : editPrompt.tool) : []);
      setAuthor(editPrompt.author);
      setPassword("");
    } else {
      setTitle("");
      setRole("기획");
      setType("아이디어");
      setDescription("");
      setContent("");
      setResult("");
      setTool([]);
      setAuthor("");
      setPassword("");
    }
  }, [editPrompt, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !content.trim() || !author.trim() || !password.trim()) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    onSubmit({
      title: title.trim(),
      role,
      type,
      description: description.trim(),
      content: content.trim(),
      result: result.trim() || undefined,
      tool: tool.length > 0 ? tool.join(', ') : undefined,
      author: author.trim(),
      password: password.trim(),
    });

    onClose();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, currentValue: string, setter: (value: string) => void) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageData = event.target?.result as string;
            setter(currentValue + `\n<img src="${imageData}" alt="붙여넣은 이미지" style="max-width: 100%; height: auto; margin: 10px 0;" />\n`);
          };
          reader.readAsDataURL(blob);
          e.preventDefault();
          return;
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPrompt ? '📝 프롬프트 수정' : '📝 새 프롬프트 등록'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {editPrompt ? '✏️ 프롬프트를 수정해보세요!' : '✨ 새로운 프롬프트를 등록하고 공유해보세요!'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  👤 작성자 *
                </Label>
                <Input
                  id="author"
                  placeholder="작성자명을 입력해주세요"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  🔒 비밀번호 *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="수정/삭제용 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📝 제목 *
              </Label>
              <Input
                id="title"
                placeholder="프롬프트의 제목을 입력해주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  👤 역할
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R&D">R&D</SelectItem>
                    <SelectItem value="기획">기획</SelectItem>
                    <SelectItem value="구매">구매</SelectItem>
                    <SelectItem value="생산">생산</SelectItem>
                    <SelectItem value="SCM">SCM</SelectItem>
                    <SelectItem value="품질">품질</SelectItem>
                    <SelectItem value="영업/마케팅">영업/마케팅</SelectItem>
                    <SelectItem value="공통">공통</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  🏷️ 타입
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="아이디어">아이디어</SelectItem>
                    <SelectItem value="요약">요약</SelectItem>
                    <SelectItem value="분석">분석</SelectItem>
                    <SelectItem value="작성">작성</SelectItem>
                    <SelectItem value="번역">번역</SelectItem>
                    <SelectItem value="편집">편집</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                💬 설명 *
              </Label>
              <Input
                id="description"
                placeholder="프롬프트에 대한 간단한 설명을 입력해주세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🛠️ 사용 가능 Tool (선택사항)
              </Label>
              <div className="grid grid-cols-1 gap-2 p-3 border rounded-md">
                {[
                  "엘지니 AI",
                  "Chat EXAONE", 
                  "CHATDA",
                  "METIS",
                  "MS Copilot",
                  "외부 Tool (ChatGPT, Claude, Gemini 등)"
                ].map((toolOption) => (
                  <div key={toolOption} className="flex items-center space-x-2">
                    <Checkbox
                      id={toolOption}
                      checked={tool.includes(toolOption)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTool([...tool, toolOption]);
                        } else {
                          setTool(tool.filter(t => t !== toolOption));
                        }
                      }}
                    />
                    <Label 
                      htmlFor={toolOption}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {toolOption}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📄 프롬프트 내용 * <span className="text-xs text-gray-500">(이미지 붙여넣기 가능)</span>
              </Label>
              <Textarea
                ref={contentTextareaRef}
                id="content"
                placeholder="프롬프트 내용을 입력해주세요 (Ctrl+V로 이미지도 붙여넣을 수 있습니다)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={(e) => handlePaste(e, content, setContent)}
                className="min-h-[120px] resize-none"
                required
              />
              {content.includes('<img') && (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-slate-700 max-h-80 overflow-y-auto">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">미리보기:</div>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="result" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ✨ 프롬프트 결과 (선택사항) <span className="text-xs text-gray-500">(이미지 붙여넣기 가능)</span>
              </Label>
              <Textarea
                ref={resultTextareaRef}
                id="result"
                placeholder="이 프롬프트를 사용했을 때의 예상 결과나 실제 결과를 입력해주세요... (Ctrl+V로 이미지도 붙여넣을 수 있습니다)"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                onPaste={(e) => handlePaste(e, result, setResult)}
                className="min-h-[100px] resize-none"
              />
              {result.includes('<img') && (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-slate-700 max-h-80 overflow-y-auto">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">미리보기:</div>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#A50034] via-[#B8003D] to-[#8B002B] hover:from-[#8B002B] hover:via-[#A50034] hover:to-[#730024] text-white shadow-xl hover:shadow-2xl"
            >
              {editPrompt ? '✅수정하기' : '✅등록하기'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptRegistration;
