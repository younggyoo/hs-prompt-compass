
import { useState } from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AdminModeProps {
  isAdmin: boolean;
  onAdminToggle: (isAdmin: boolean) => void;
}

const AdminMode = ({ isAdmin, onAdminToggle }: AdminModeProps) => {
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogin = () => {
    if (password === 'abc123') {
      onAdminToggle(true);
      setIsOpen(false);
      setPassword('');
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const handleLogout = () => {
    onAdminToggle(false);
  };

  if (isAdmin) {
    return (
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
      >
        <ShieldCheck className="w-4 h-4 mr-2" />
        관리자 모드 OFF
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="w-4 h-4 mr-2" />
          관리자 모드
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>관리자 로그인</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <Button onClick={handleLogin} className="w-full">
            로그인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminMode;
