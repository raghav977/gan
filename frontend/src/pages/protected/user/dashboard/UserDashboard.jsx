import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    MdDashboard,
    MdAssignment,
    MdCheckCircle,
    MdPending,
    MdPlayCircle,
    MdPeople,
    MdSend
} from "react-icons/md";
import { getUserDashboardStats, getUserAssignedTodos, getUserEnrollments } from "../../../../api/clientTrainer.api";

export default function UserDashboard() {
    const [stats, setStats] = useState(null);
    const [recentTodos, setRecentTodos] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, todosRes, enrollmentsRes] = await Promise.all([
                getUserDashboardStats(),
                getUserAssignedTodos(),
                getUserEnrollments()
            ]);
            
            setStats(statsRes.data);
            setRecentTodos((todosRes.data || []).slice(0, 5));
            setTrainers((enrollmentsRes.data || []).filter(e => e.status === 'accepted'));
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-600';
            case 'in_progress': return 'bg-blue-100 text-blue-600';
            case 'submitted': return 'bg-orange-100 text-orange-600';
            case 'completed': return 'bg-green-100 text-green-600';
            case 'revision_needed': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <MdAssignment className="text-yellow-600" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.assignments?.total || 0}</p>
                                <p className="text-sm text-gray-500">Total Tasks</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <MdPlayCircle className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.assignments?.inProgress || 0}</p>
                                <p className="text-sm text-gray-500">In Progress</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <MdCheckCircle className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.assignments?.completed || 0}</p>
                                <p className="text-sm text-gray-500">Completed</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <MdPeople className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.trainers || 0}</p>
                                <p className="text-sm text-gray-500">My Trainers</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Todos */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="font-semibold">Recent Tasks</h2>
                            <Link to="/user/todos" className="text-sm text-yellow-600 hover:underline">
                                View All
                            </Link>
                        </div>
                        
                        {recentTodos.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <MdAssignment size={48} className="mx-auto mb-4" />
                                <p>No tasks assigned yet</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {recentTodos.map((assignment) => (
                                    <Link
                                        key={assignment.id}
                                        to={`/user/todos/${assignment.id}`}
                                        className="block p-4 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{assignment.todo?.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    From: {assignment.todo?.trainer?.username}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Trainers */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b">
                            <h2 className="font-semibold">My Trainers</h2>
                        </div>
                        
                        {trainers.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <MdPeople size={48} className="mx-auto mb-4" />
                                <p>No trainers yet</p>
                                <Link to="/courses" className="text-sm text-yellow-600 hover:underline mt-2 inline-block">
                                    Browse Trainers
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {trainers.map((enrollment) => (
                                    <div key={enrollment.id} className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <span className="font-bold text-yellow-600">
                                                {enrollment.trainer?.username?.[0]?.toUpperCase() || "?"}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{enrollment.trainer?.username}</p>
                                            <p className="text-xs text-gray-500">
                                                {enrollment.trainer?.trainerProfile?.specialization || "Trainer"}
                                            </p>
                                        </div>
                                        <Link
                                            to="/user/messages"
                                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                            title="Message"
                                        >
                                            <MdSend size={18} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                    <Link
                        to="/user/todos"
                        className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition"
                    >
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <MdAssignment className="text-yellow-600" size={24} />
                        </div>
                        <div>
                            <p className="font-medium">My Tasks</p>
                            <p className="text-sm text-gray-500">View all assigned tasks</p>
                        </div>
                    </Link>
                    
                    <Link
                        to="/user/messages"
                        className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition"
                    >
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <MdSend className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="font-medium">Messages</p>
                            <p className="text-sm text-gray-500">Chat with trainers</p>
                        </div>
                    </Link>
                    
                    <Link
                        to="/courses"
                        className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition"
                    >
                        <div className="p-3 bg-green-100 rounded-lg">
                            <MdPeople className="text-green-600" size={24} />
                        </div>
                        <div>
                            <p className="font-medium">Find Trainers</p>
                            <p className="text-sm text-gray-500">Browse available trainers</p>
                        </div>
                    </Link>
                </div>
        </div>
    );
}
