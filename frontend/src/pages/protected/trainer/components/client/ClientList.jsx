import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientCard from "./ClientCard";

export default function ClientList() {
  const [clients, setClients] = useState([
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" }
  ]);
//   const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    return () => {
      mounted = false;
    };
  }, []);

//   if (loading) {
//     return <div className="p-6">Loading clients...</div>;
//   }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((c) => (
          <ClientCard
            key={c.id}
            client={c}
            onView={() => navigate(`/trainer/clients/${c.id}/track`, { state: { client: c } })}
          />
        ))}
      </div>
    </div>
  );
}