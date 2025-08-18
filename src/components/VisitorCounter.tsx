
import { useState, useEffect } from 'react';
import { Eye, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [currentUsers, setCurrentUsers] = useState(0);

  useEffect(() => {
    let mounted = true;
    
    const initializeVisitors = async () => {
      try {
        // 세션에서 오늘 이미 카운트했는지 확인
        const today = new Date().toDateString();
        const sessionKey = `visitor_counted_${today}`;
        const alreadyCounted = sessionStorage.getItem(sessionKey);
        
        if (!alreadyCounted) {
          // 새 방문자이므로 카운트 증가
          const { data, error } = await supabase.rpc('increment_daily_visitors');
          if (error) throw error;
          
          if (mounted) {
            setVisitorCount(data || 0);
            sessionStorage.setItem(sessionKey, 'true');
          }
        } else {
          // 기존 방문자이므로 현재 카운트만 가져오기
          const { data, error } = await supabase.rpc('get_daily_visitors');
          if (error) throw error;
          
          if (mounted) {
            setVisitorCount(data || 0);
          }
        }
      } catch (error) {
        console.error('Error initializing visitor count:', error);
        if (mounted) {
          // 에러 발생 시 기본값 사용
          setVisitorCount(1);
        }
      }
    };

    // 실시간 접속자 추적 설정
    const setupPresence = () => {
      const channel = supabase.channel('visitors', {
        config: {
          presence: {
            key: `user_${Date.now()}_${Math.random()}`
          }
        }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const onlineCount = Object.keys(state).length;
          if (mounted) {
            setCurrentUsers(onlineCount);
          }
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // 현재 사용자를 온라인으로 표시
            await channel.track({
              online_at: new Date().toISOString(),
            });
          }
        });

      return channel;
    };

    initializeVisitors();
    const presenceChannel = setupPresence();

    return () => {
      mounted = false;
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span>오늘의 방문자: <strong className="text-[#A50034]">{visitorCount}</strong>명</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <span>현재 접속자: <strong className="text-[#A50034]">{currentUsers}</strong>명</span>
      </div>
    </div>
  );
};

export default VisitorCounter;
