import { useLocation, useParams, useNavigate } from "react-router-dom";
import TodosList from "../components/todos/TodosList";

const ClientTrackPage = () => {
  const { state } = useLocation();
  const { clientId } = useParams();


  const client = state?.client;

  // 🛑 Safety check (important in real apps)
  if (!client) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Client data not found. Please navigate from client list.
        </p>
        <button
          onClick={() => navigate("/trainer/clients")}
          className="mt-4 text-blue-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">
        Tracking: {client.name}
      </h2>

      <p className="text-gray-500 mt-1">
        Client ID: {clientId}
      </p>

      <p className="text-gray-500 mt-1">
        Client ID: {clientId}
      </p>

    <TodosList/>
    </div>
  );
};

export default ClientTrackPage;
