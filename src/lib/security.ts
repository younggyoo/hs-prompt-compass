/**
 * Security utilities for input validation and sanitization
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Password strength validation
export const isValidPassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "비밀번호는 최소 8자 이상이어야 합니다." };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: "비밀번호는 128자를 초과할 수 없습니다." };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: "비밀번호에는 소문자가 포함되어야 합니다." };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: "비밀번호에는 대문자가 포함되어야 합니다." };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: "비밀번호에는 숫자가 포함되어야 합니다." };
  }
  
  return { isValid: true };
};

// Text content sanitization (basic XSS prevention)
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;')
    .trim();
};

// Validate text length
export const isValidTextLength = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength && text.trim().length > 0;
};

// Validate prompt title
export const isValidPromptTitle = (title: string): boolean => {
  return isValidTextLength(title, 200) && title.trim().length >= 3;
};

// Validate prompt content
export const isValidPromptContent = (content: string): boolean => {
  return isValidTextLength(content, 10000) && content.trim().length >= 10;
};

// Validate comment content
export const isValidCommentContent = (content: string): boolean => {
  return isValidTextLength(content, 1000) && content.trim().length >= 1;
};

// Validate author name
export const isValidAuthorName = (name: string): boolean => {
  return isValidTextLength(name, 50) && name.trim().length >= 1;
};

// Rate limiting helper (client-side basic check)
export const checkRateLimit = (key: string, maxAttempts: number, windowMs: number): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false;
  }
  
  // Add current attempt
  recentAttempts.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(recentAttempts));
  
  return true;
};

// Clean sensitive data from error messages
export const sanitizeErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error.includes('duplicate key') ? '이미 존재하는 데이터입니다.' :
           error.includes('foreign key') ? '잘못된 참조 데이터입니다.' :
           error.includes('not found') ? '요청한 데이터를 찾을 수 없습니다.' :
           '요청 처리 중 오류가 발생했습니다.';
  }
  
  if (error?.message) {
    return sanitizeErrorMessage(error.message);
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};