
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

const LoginDialog = ({ isOpen, onClose, onLogin }: LoginDialogProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    if (!username.trim()) {
      toast({
        title: "사용자명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 간단한 로그인 처리 (실제 프로젝트에서는 서버 인증 필요)
    onLogin(username);
    onClose();
    setUsername("");
    setPassword("");
    
    toast({
      title: `${username}님, 환영합니다!`,
    });
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>
            프롬프트를 등록하고 관리하려면 로그인이 필요합니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">사용자명</Label>
            <Input
              id="username"
              type="text"
              placeholder="사용자명을 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleLogin}>
            로그인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
