import React from 'react'

const UserList = ({ user, onViewDetails, onApprove, onReject }) => {
  if (!user || user.length === 0) {
    return (
      <div className="mt-6 text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No trainers found</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {user.map((trainer) => (
              <tr key={trainer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{trainer.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {trainer.User?.username || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {trainer.User?.email || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    trainer.is_verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {trainer.is_verified ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(trainer.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(trainer)}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        View
                      </button>
                    )}
                    {!trainer.is_verified && onApprove && (
                      <button
                        onClick={() => onApprove(trainer.id)}
                        className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
                      >
                        Approve
                      </button>
                    )}
                    {!trainer.is_verified && onReject && (
                      <button
                        onClick={() => onReject(trainer.id)}
                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserList