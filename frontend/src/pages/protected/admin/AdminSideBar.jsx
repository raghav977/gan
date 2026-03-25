import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'


const AdminSidebar = () => {




    const menuItems = [
        { name: "Dashboard", link: "/admin/dashboard" },
        { name: "Users", link: "/admin/users" },
        { name: "Courses", link: "/admin/courses" },
        { name: "Client Todos", link: "/admin/client-todos" },
        { name: "Settings", link: "/admin/settings" },
        { name: "Profile", link: "/admin/profile" },
        { name: "Products", link: "/admin/products" },
        { name: "Logout", link: "/logout" }
    ]

    return (
        <div className="flex">
            {/* SIDEBAR */}
            <aside className="w-64 h-screen bg-gray-100 border-r border-gray-300">
                <div className="py-4 px-3">
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.link}
                                    className={({ isActive }) =>
                                        `
                                        flex items-center p-2 rounded-lg 
                                        font-medium transition 
                                        ${isActive 
                                          ? "bg-yellow-400 text-black" 
                                          : "text-black hover:bg-yellow-200"}
                                        `
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-4 border border-gray-300">
                <Outlet />
            </div>
        </div>
    )
}

export default AdminSidebar
