import { useState, useEffect } from 'react';
import { Eye, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [currentUsers, setCurrentUsers] = useState(0);

  useEffect(() => {
    let presenceChannel: any = null;

    const initializeCounters = async () => {
      try {
        // 세션에서 오늘 이미 카운트했는지 확인
        const today = new Date().toISOString().split('T')[0];
        const sessionKey = `visited_${today}`;
        const alreadyVisited = sessionStorage.getItem(sessionKey);
        
        if (!alreadyVisited) {
          // 새 방문자이므로 카운트 증가
          const { data } = await supabase.rpc('increment_daily_visitors');
          setVisitorCount(data || 0);
          sessionStorage.setItem(sessionKey, 'true');
        } else {
          // 기존 방문자는 현재 카운트만 가져오기
          const { data } = await supabase.rpc('get_daily_visitors');
          setVisitorCount(data || 0);
        }

        // 실시간 접속자 추적 설정
        presenceChannel = supabase.channel('online_users', {
          config: {
            presence: {
              key: `user_${Date.now()}_${Math.random()}`
            }
          }
        });

        presenceChannel
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            const onlineCount = Object.keys(state).length;
            setCurrentUsers(onlineCount);
          })
          .on('presence', { event: 'join' }, ({ newPresences }: any) => {
            console.log('New users joined:', newPresences);
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
            console.log('Users left:', leftPresences);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await presenceChannel.track({
                online_at: new Date().toISOString(),
                user_id: `anonymous_${Date.now()}`
              });
            }
          });

      } catch (error) {
        console.error('Error initializing counters:', error);
        // 에러 시 기본값 설정
        setVisitorCount(0);
        setCurrentUsers(1);
      }
    };

    initializeCounters();

    // 컴포넌트 언마운트 시 정리
    return () => {
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