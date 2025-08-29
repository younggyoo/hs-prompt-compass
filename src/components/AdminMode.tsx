
// DEPRECATED: This component contained hardcoded admin password security vulnerability
// Use AdminAuth component instead which implements proper Supabase authentication

import AdminAuth from './AdminAuth';

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

interface AdminModeProps {
  isAdmin: boolean;
  onAdminToggle: (isAdmin: boolean) => void;
  prompts: Prompt[];
  onAdminStatusChange: (isAdmin: boolean) => void;
}

const AdminMode = ({ prompts, onAdminStatusChange }: AdminModeProps) => {
  return <AdminAuth prompts={prompts} onAdminStatusChange={onAdminStatusChange} />;
};

export default AdminMode;
