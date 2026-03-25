import { registerTrainerServie } from "../services/user.services.js";

export const registerTrainer = async (req, res) => {
    console.log("this is body", req.body);
    console.log("Ths si files", req.files);

    const { email, password, contact, username, specialization, type, latitude, longitude, radius } = req.body;


    try {
        const result = await registerTrainerServie(
            email, password, username, contact,
            specialization, type, latitude, longitude, radius,
            req.files
        );

        return res.status(result.status).json({
            message: result.message,
            data: result.data
        });

    } catch (err) {
        console.error("Something went wrong:", err);     
        return res.status(500).json({ message: err.message });
    }
};
