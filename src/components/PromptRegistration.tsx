
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromptData {
  title: string;
  role: string;
  type: string;
  description: string;
  content: string;
}

interface PromptRegistrationProps {
  onSubmit: (prompt: PromptData) => void;
  onClose: () => void;
}

const ROLES = ["기획자", "분석가", "마케터", "개발자", "디자이너", "PM", "기타"];
const TYPES = ["작성", "요약", "분석", "번역", "검토", "기타"];

const PromptRegistration = ({ onSubmit, onClose }: PromptRegistrationProps) => {
  const [formData, setFormData] = useState<PromptData>({
    title: "",
    role: "",
    type: "",
    description: "",
    content: ""
  });

  const [errors, setErrors] = useState<Partial<PromptData>>({});

  const validateForm = () => {
    const newErrors: Partial<PromptData> = {};
    
    if (!formData.title.trim()) newErrors.title = "제목을 입력해주세요";
    if (!formData.role) newErrors.role = "역할을 선택해주세요";
    if (!formData.type) newErrors.type = "유형을 선택해주세요";
    if (!formData.description.trim()) newErrors.description = "설명을 입력해주세요";
    if (!formData.content.trim()) newErrors.content = "프롬프트 내용을 입력해주세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof PromptData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="pt-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            제목 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="프롬프트 제목을 입력하세요"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <span className="text-red-500 text-sm">{errors.title}</span>
          )}
        </div>

        {/* 역할 및 유형 */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              역할 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange("role", value)}
            >
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="역할 선택" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <span className="text-red-500 text-sm">{errors.role}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              유형 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <span className="text-red-500 text-sm">{errors.type}</span>
            )}
          </div>
        </div>

        {/* 설명 */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            설명 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="이 프롬프트의 용도와 특징을 설명해주세요"
            rows={3}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <span className="text-red-500 text-sm">{errors.description}</span>
          )}
        </div>

        {/* 프롬프트 내용 */}
        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">
            프롬프트 내용 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="실제 사용할 프롬프트 내용을 입력하세요&#10;&#10;예시:&#10;다음 텍스트를 요약해주세요.&#10;&#10;[텍스트]&#10;(여기에 텍스트 입력)&#10;&#10;요구사항:&#10;- 3줄 이내로 요약&#10;- 핵심 키워드 포함"
            rows={12}
            className={`font-mono text-sm ${errors.content ? "border-red-500" : ""}`}
          />
          {errors.content && (
            <span className="text-red-500 text-sm">{errors.content}</span>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-800 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            등록하기
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromptRegistration;
