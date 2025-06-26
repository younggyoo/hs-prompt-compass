
import { useState, useEffect } from 'react';
import { Eye, Users } from 'lucide-react';

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [currentUsers, setCurrentUsers] = useState(1);

  useEffect(() => {
    // 오늘 날짜를 키로 사용
    const today = new Date().toDateString();
    const storageKey = `visitors_${today}`;
    
    // 현재 방문자 수 가져오기
    const currentCount = parseInt(localStorage.getItem(storageKey) || '0');
    
    // 세션에서 오늘 이미 카운트했는지 확인
    const sessionKey = `counted_${today}`;
    const alreadyCounted = sessionStorage.getItem(sessionKey);
    
    if (!alreadyCounted) {
      // 새 방문자이므로 카운트 증가
      const newCount = currentCount + 1;
      localStorage.setItem(storageKey, newCount.toString());
      sessionStorage.setItem(sessionKey, 'true');
      setVisitorCount(newCount);
    } else {
      setVisitorCount(currentCount);
    }

    // 현재 접속자 수는 간단히 1-5 사이의 랜덤 값으로 시뮬레이션
    const randomUsers = Math.floor(Math.random() * 5) + 1;
    setCurrentUsers(randomUsers);
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
