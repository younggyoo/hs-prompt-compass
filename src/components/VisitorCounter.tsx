
import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);

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
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Eye className="w-4 h-4" />
      <span>오늘의 방문자: <strong className="text-[#A50034]">{visitorCount}</strong>명</span>
    </div>
  );
};

export default VisitorCounter;
