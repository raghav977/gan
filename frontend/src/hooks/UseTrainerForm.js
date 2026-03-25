import { useState } from "react";

export function useTrainerForm() {
    const [formData, setFormData] = useState({
        email: "",
        username:"",
        password: "",
        contact: "",
        specialization: "",
        type: "",
        radiusKm: 2
    });

    const updateField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return { formData, updateField };
}