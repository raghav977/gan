import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdCheck, MdPerson } from "react-icons/md";
import { getTodoById, getTrainerClients, assignTodoToUsers } from "../../../../api/clientTrainer.api";

export default function AssignTodo() {
    const { todoId } = useParams();
    const navigate = useNavigate();
    const [todo, setTodo] = useState(null);
    const [clients, setClients] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alreadyAssigned, setAlreadyAssigned] = useState([]);

    useEffect(() => {
        fetchData();
    }, [todoId]);

    const fetchData = async () => {
        try {
            const [todoRes, clientsRes] = await Promise.all([
                getTodoById(todoId),
                getTrainerClients()
            ]);
            
            setTodo(todoRes.data);
            setClients(clientsRes.data || []);
            
            // Get already assigned user IDs
            const assignedIds = todoRes.data?.assignments?.map(a => a.userId) || [];
            setAlreadyAssigned(assignedIds);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (userId) => {
        if (alreadyAssigned.includes(userId)) return;
        
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const selectAll = () => {
        const availableUsers = clients
            .filter(c => !alreadyAssigned.includes(c.user?.id))
            .map(c => c.user?.id);
        setSelectedUsers(availableUsers);
    };

    const deselectAll = () => {
        setSelectedUsers([]);
    };

    const handleAssign = async () => {
        if (selectedUsers.length === 0) {
            alert("Please select at least one user");
            return;
        }

        setSubmitting(true);
        try {
            await assignTodoToUsers(todoId, selectedUsers);
            navigate(`/trainer/todos/${todoId}`);
        } catch (err) {
            console.error("Error assigning:", err);
            alert(err.response?.data?.message || "Failed to assign");
        } finally {
            setSubmitting(false);
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
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <MdArrowBack size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Assign Todo</h1>
                    <p className="text-gray-600">{todo?.title}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                {/* Selection Controls */}
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="font-medium">
                            Select Users ({selectedUsers.length} selected)
                        </span>
                        <button
                            onClick={selectAll}
                            className="text-sm text-yellow-600 hover:underline"
                        >
                            Select All
                        </button>
                        <button
                            onClick={deselectAll}
                            className="text-sm text-gray-500 hover:underline"
                        >
                            Deselect All
                        </button>
                    </div>
                    <button
                        onClick={handleAssign}
                        disabled={submitting || selectedUsers.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Assigning...
                            </>
                        ) : (
                            <>
                                <MdCheck size={20} />
                                Assign to Selected
                            </>
                        )}
                    </button>
                </div>

                {/* Client List */}
                {clients.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <MdPerson size={48} className="mx-auto mb-4" />
                        <p>No clients available</p>
                        <p className="text-sm mt-2">Accept client enrollments first</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {clients.map((enrollment) => {
                            const client = enrollment.user;
                            const isAssigned = alreadyAssigned.includes(client?.id);
                            const isSelected = selectedUsers.includes(client?.id);

                            return (
                                <div
                                    key={enrollment.id}
                                    onClick={() => toggleUser(client?.id)}
                                    className={`p-4 flex items-center gap-4 cursor-pointer transition ${
                                        isAssigned 
                                            ? 'bg-gray-50 cursor-not-allowed' 
                                            : isSelected 
                                                ? 'bg-yellow-50' 
                                                : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                        isAssigned
                                            ? 'border-gray-300 bg-gray-200'
                                            : isSelected
                                                ? 'border-yellow-500 bg-yellow-500 text-white'
                                                : 'border-gray-300'
                                    }`}>
                                        {(isSelected || isAssigned) && <MdCheck size={16} />}
                                    </div>
                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-yellow-600">
                                            {client?.username?.[0]?.toUpperCase() || "?"}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{client?.username}</p>
                                        <p className="text-sm text-gray-500">{client?.email}</p>
                                    </div>
                                    {isAssigned && (
                                        <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                                            Already Assigned
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
