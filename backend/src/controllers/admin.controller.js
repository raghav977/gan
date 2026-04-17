import { validateFields } from "../../../frontend/src/utils/validation.js";
import { registerUserService } from "../services/user.services.js";
import http from "../http/response.js";
import user from "../models/usersModels.js";
import bcrypt from "bcrypt";

export const adminSignUp =async(req,res)=>{
    try{
        const {email,password} = req.body;

        const isValidate = validateFields(email,password)
        if (!isValidate){
            return res.status(404).json({
                message:"Please input all the fields"
            })
        }

        const admiCreate = await registerUserService(email,password,"admin","981234567","admin");
        return admiCreate;
    }
    catch(err){
        console.error("The error",err.message)
        throw err;

    }
}

export const getAdminProfile = async (req, res) => {
    try {
        const admin = await user.findByPk(req.user.id, {
            attributes: ["id", "username", "email", "contact", "role", "is_active", "createdAt", "updatedAt"]
        });

        if (!admin || admin.role !== "admin") {
            return http.badRequest(res, "Admin account not found");
        }

        return http.ok(res, "Admin profile fetched", admin);
    } catch (err) {
        console.error("getAdminProfile error:", err);
        return http.serverError(res, "Failed to fetch admin profile", err.message);
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const admin = await user.findByPk(req.user.id);

        if (!admin || admin.role !== "admin") {
            return http.badRequest(res, "Admin account not found");
        }

        const { username, email, contact, currentPassword, newPassword } = req.body;

        if (email && email !== admin.email) {
            const existing = await user.findOne({ where: { email } });
            if (existing) {
                return http.badRequest(res, "Email is already associated with another account");
            }
            admin.email = email;
        }

        if (username) admin.username = username;
        if (contact) admin.contact = contact;

        if (newPassword) {
            if (!currentPassword) {
                return http.badRequest(res, "Current password is required to set a new password");
            }

            const matches = await bcrypt.compare(currentPassword, admin.password);
            if (!matches) {
                return http.badRequest(res, "Current password is incorrect");
            }

            if (newPassword.length < 6) {
                return http.badRequest(res, "Password should be at least 6 characters long");
            }

            admin.password = await bcrypt.hash(newPassword, 10);
        }

        await admin.save();

        const sanitized = {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            contact: admin.contact,
            role: admin.role,
            is_active: admin.is_active,
            updatedAt: admin.updatedAt
        };

        return http.ok(res, "Admin profile updated", sanitized);
    } catch (err) {
        console.error("updateAdminProfile error:", err);
        return http.serverError(res, "Failed to update admin profile", err.message);
    }
};