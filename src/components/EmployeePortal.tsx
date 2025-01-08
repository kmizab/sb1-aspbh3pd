import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MessageSquare, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  employees: {
    name: string;
  };
}

interface EmployeePortalProps {
  session: any;
  onSignOut: () => void;
}

export function EmployeePortal({ session, onSignOut }: EmployeePortalProps) {
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [forumPosts, setForumPosts] = React.useState<ForumPost[]>([]);
  const [newLeaveRequest, setNewLeaveRequest] = React.useState({
    start_date: '',
    end_date: '',
    type: 'congés payés'
  });
  const [newPost, setNewPost] = React.useState({
    title: '',
    content: ''
  });

  React.useEffect(() => {
    if (session) {
      fetchLeaveRequests();
      fetchForumPosts();
    }
  }, [session]);

  async function fetchLeaveRequests() {
    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (employeeData) {
        const { data } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('employee_id', employeeData.id)
          .order('created_at', { ascending: false });

        if (data) setLeaveRequests(data);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  }

  async function fetchForumPosts() {
    try {
      const { data } = await supabase
        .from('forum_posts')
        .select(\`
          *,
          employees (
            name
          )
        \`)
        .order('created_at', { ascending: false });

      if (data) setForumPosts(data);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
    }
  }

  async function handleLeaveRequest(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (employeeData) {
        const { error } = await supabase
          .from('leave_requests')
          .insert([
            {
              employee_id: employeeData.id,
              ...newLeaveRequest,
              status: 'pending'
            }
          ]);

        if (!error) {
          setNewLeaveRequest({
            start_date: '',
            end_date: '',
            type: 'congés payés'
          });
          fetchLeaveRequests();
        }
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  }

  async function handleForumPost(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (employeeData) {
        const { error } = await supabase
          .from('forum_posts')
          .insert([
            {
              employee_id: employeeData.id,
              ...newPost
            }
          ]);

        if (!error) {
          setNewPost({
            title: '',
            content: ''
          });
          fetchForumPosts();
        }
      }
    } catch (error) {
      console.error('Error submitting forum post:', error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Espace Employé</h1>
        <button
          onClick={onSignOut}
          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Déconnexion
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gestion des congés */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-6">
            <Calendar className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold">Gestion des congés</h2>
          </div>
          
          <form onSubmit={handleLeaveRequest} className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de début</label>
              <input
                type="date"
                value={newLeaveRequest.start_date}
                onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, start_date: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de fin</label>
              <input
                type="date"
                value={newLeaveRequest.end_date}
                onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, end_date: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Type de congé</label>
              <select
                value={newLeaveRequest.type}
                onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, type: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="congés payés">Congés payés</option>
                <option value="rtt">RTT</option>
                <option value="maladie">Maladie</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Soumettre la demande
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="font-semibold">Mes demandes</h3>
            {leaveRequests.map((request) => (
              <div
                key={request.id}
                className="border rounded-md p-4 space-y-2"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{request.type}</span>
                  <span className={\`px-2 py-1 rounded-full text-sm \${
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }\`}>
                    {request.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Du {format(new Date(request.start_date), 'dd/MM/yyyy')} au {format(new Date(request.end_date), 'dd/MM/yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forum */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-6">
            <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold">Forum</h2>
          </div>
          
          <form onSubmit={handleForumPost} className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Publier
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="font-semibold">Discussions récentes</h3>
            {forumPosts.map((post) => (
              <div
                key={post.id}
                className="border rounded-md p-4 space-y-2"
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{post.title}</h4>
                  <span className="text-sm text-gray-500">
                    {format(new Date(post.created_at), 'dd/MM/yyyy')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                <div className="text-sm text-gray-500">
                  Par {post.employees?.name || 'Anonyme'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}