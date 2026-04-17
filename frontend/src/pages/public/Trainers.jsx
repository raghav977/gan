import React from 'react'
import Header from '../../components/Header'
import TrainerList from '../../components/TrainerList'
import { useState } from 'react'
import { useEffect } from 'react'
import { getAllApprovedTrainer } from '../../api/public.trainer'


const Trainers = () => {

     const [trainers, setTrainers] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState("");

      const [pages,setPages] = useState(1);
      const [totalPages,setTotalPages] = useState(1);
    
      const getTrainers = async () => {
        try {
          setLoading(true);
          setError("");

          const approvedTrainer = await getAllApprovedTrainer({
            limit: 10,
            page: pages
          });
    
          setTrainers(approvedTrainer.approvedTrainer || []);
          setTotalPages(approvedTrainer.totalPages || 1);
          console.log("Approved trainers:", approvedTrainer);
        } catch (err) {
          console.error("Failed to fetch trainers:", err);
          setError(err.message || "Failed to load trainers");
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        getTrainers();
      }, []);
  return (
    <div>
        <Header/>
        <TrainerList trainers={trainers} loading={loading} error={error} />

        {/* pagination */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={() => setPages((prev) => Math.max(prev - 1, 1))}
                    disabled={pages === 1}
                >
                    Previous
                </button>
                <span className="mx-4">Page {pages} of {totalPages}</span>
                <button
                    onClick={() => setPages((prev) => Math.min(prev + 1, totalPages))}
                    disabled={pages === totalPages}
                >
                    Next
                </button>
            </div>
    </div>
  )
}

export default Trainers