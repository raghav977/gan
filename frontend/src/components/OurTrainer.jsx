import React, { useEffect, useState } from "react";
import TrainerList from "../components/TrainerList";
import { getAllApprovedTrainer } from "../api/public.trainer";

export default function OurTrainer() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getApprovedTrainer = async () => {
    try {
      setLoading(true);
      setError("");

      const approvedTrainer = await getAllApprovedTrainer({
        limit: 5
      });

      setTrainers(approvedTrainer.approvedTrainer || []);
    } catch (err) {
      console.error("Failed to fetch trainers:", err);
      setError(err.message || "Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getApprovedTrainer();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <TrainerList 
        trainers={trainers}
        loading={loading}
        error={error}
      />
    </div>
  );
}