
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Eye, Copy, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface AdminDashboardProps {
  prompts: Prompt[];
  isAdmin: boolean;
}

const AdminDashboard = ({ prompts, isAdmin }: AdminDashboardProps) => {
  const [dailyVisitors, setDailyVisitors] = useState<{ [key: string]: number }>({});
  const [monthlyVisitors, setMonthlyVisitors] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // 일별 방문자 수 계산
    const daily: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();
      daily[dateKey] = parseInt(localStorage.getItem(`visitors_${dateKey}`) || '0');
    }
    setDailyVisitors(daily);

    // 월별 방문자 수 계산 (최근 6개월)
    const monthly: { [key: string]: number } = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // 해당 월의 일별 방문자 수 합산
      let monthlyTotal = 0;
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
        const dayKey = dayDate.toDateString();
        monthlyTotal += parseInt(localStorage.getItem(`visitors_${dayKey}`) || '0');
      }
      monthly[monthKey] = monthlyTotal;
    }
    setMonthlyVisitors(monthly);
  }, []);

  const totalPrompts = prompts.length;
  const totalViews = prompts.reduce((sum, prompt) => sum + prompt.views, 0);
  const totalLikes = prompts.reduce((sum, prompt) => sum + prompt.likes, 0);
  const totalCopies = prompts.reduce((sum, prompt) => sum + (prompt.copyCount || 0), 0);
  const totalComments = prompts.reduce((sum, prompt) => sum + prompt.comments.length, 0);

  // 가장 인기있는 프롬프트들 (조회수 기준)
  const topPrompts = [...prompts]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // 역할별 프롬프트 수
  const promptsByRole = prompts.reduce((acc, prompt) => {
    acc[prompt.role] = (acc[prompt.role] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  if (!isAdmin) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          관리자 대시보드
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">📊 관리자 대시보드</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 전체 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">총 프롬프트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#A50034]">{totalPrompts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">총 조회수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">총 좋아요</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalLikes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">총 복사수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{totalCopies}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">총 댓글수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{totalComments}</div>
              </CardContent>
            </Card>
          </div>

          {/* 방문자 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📅 일별 방문자 (최근 7일)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(dailyVisitors)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, count]) => (
                      <div key={date} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {new Date(date).toLocaleDateString('ko-KR')}
                        </span>
                        <span className="font-semibold text-[#A50034]">{count}명</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📈 월별 방문자 (최근 6개월)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(monthlyVisitors)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([month, count]) => (
                      <div key={month} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{month}</span>
                        <span className="font-semibold text-[#A50034]">{count}명</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 인기 프롬프트 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔥 인기 프롬프트 Top 5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPrompts.map((prompt, index) => (
                  <div key={prompt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#A50034]">#{index + 1}</span>
                        <h4 className="font-semibold text-gray-900 truncate">{prompt.title}</h4>
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {prompt.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{prompt.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{prompt.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Copy className="w-3 h-3" />
                          <span>{prompt.copyCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{prompt.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 역할별 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👥 역할별 프롬프트 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(promptsByRole)
                  .sort(([, a], [, b]) => b - a)
                  .map(([role, count]) => (
                    <div key={role} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-[#A50034]">{count}</div>
                      <div className="text-sm text-gray-600">{role}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDashboard;
