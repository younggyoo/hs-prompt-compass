
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PromptRegistrationProps {
  onSubmit: (promptData: {
    title: string;
    role: string;
    type: string;
    description: string;
    content: string;
    result?: string;
  }) => void;
}

const PromptRegistration = ({ onSubmit }: PromptRegistrationProps) => {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("기획");
  const [type, setType] = useState("아이디어");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !content.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      role,
      type,
      description: description.trim(),
      content: content.trim(),
      result: result.trim() || undefined,
    });

    setTitle("");
    setRole("기획");
    setType("아이디어");
    setDescription("");
    setContent("");
    setResult("");
  };

  return (
    <div className="space-y-6 p-4 h-full">
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ✨ 새로운 프롬프트를 등록하고 공유해보세요!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📝 제목
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
            💬 설명
          </Label>
          <Input
            id="description"
            placeholder="프롬프트에 대한 간단한 설명을 입력해주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📄 프롬프트 내용
          </Label>
          <Textarea
            id="content"
            placeholder="프롬프트 내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none flex-1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="result" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ✨ 프롬프트 결과 (선택사항)
          </Label>
          <Textarea
            id="result"
            placeholder="이 프롬프트를 사용했을 때의 예상 결과나 실제 결과를 입력해주세요..."
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#A50034] hover:bg-[#8B002B] text-white mt-auto"
        >
          ✅ 등록하기
        </Button>
      </form>
    </div>
  );
};

export default PromptRegistration;
