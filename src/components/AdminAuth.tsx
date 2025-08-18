import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Shield, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminDashboard from './AdminDashboard';

interface Comment {
  id: string;
  author: string;
  content: string;
  password?: string;
  createdAt: Date;
}

interface Prompt {
  id: string;
  title: string;
  role: string;
  type: string;
  description: string;
  content: string;
  result?: string;
  tool?: string;
  author: string;
  likes: number;
  views: number;
  copyCount: number;
  comments: Comment[];
  createdAt: Date;
}

interface AdminAuthProps {
  prompts: Prompt[];
}

const AdminAuth = ({ prompts }: AdminAuthProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        return;
      }

      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      toast({
        title: "오류",
        description: "이메일과 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "로그인 실패",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "로그인 성공",
            description: "관리자 권한을 확인 중입니다.",
          });
          setIsOpen(false);
          setEmail('');
          setPassword('');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          toast({
            title: "회원가입 실패",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "회원가입 성공",
            description: "이메일을 확인하여 계정을 활성화해주세요.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "인증 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "로그아웃",
        description: "로그아웃되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const makeUserAdmin = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .upsert({
          user_id: user.id,
          is_admin: true,
        });

      if (error) {
        toast({
          title: "오류",
          description: "관리자 권한 설정 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } else {
        setIsAdmin(true);
        toast({
          title: "관리자 권한 설정",
          description: "관리자 권한이 설정되었습니다.",
        });
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "관리자 권한 설정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (user && isAdmin) {
    return (
      <div className="flex gap-2">
        <AdminDashboard prompts={prompts} isAdmin={isAdmin} />
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={makeUserAdmin}
          variant="outline"
          size="sm"
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <Shield className="w-4 h-4 mr-2" />
          관리자 권한 요청
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LogIn className="w-4 h-4 mr-2" />
          관리자 로그인
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLoginMode ? '관리자 로그인' : '관리자 계정 생성'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
          />
          <Button 
            onClick={handleAuth} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? '처리 중...' : (isLoginMode ? '로그인' : '회원가입')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="w-full"
          >
            {isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAuth;