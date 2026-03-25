import React from "react";
import ClientList from "../components/client/ClientList";

const Client = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm text-slate-500">Manage and view client progress</p>
      </header>

      <ClientList />
    </div>
  );
};

export default Client;