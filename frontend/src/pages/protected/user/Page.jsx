import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { MdDashboard, MdAssignment, MdMessage, MdSettings, MdLogout, MdPerson, MdPlayCircle, MdShoppingCart } from 'react-icons/md'


import Header from '../../../components/Header'

const Page = () => {
    const menuItems = [
        { name: "Dashboard", link: "/user/dashboard", icon: MdDashboard },
        { name: "My Courses", link: "/user/my-courses", icon: MdPlayCircle },
    { name: "My Products", link: "/user/my-products", icon: MdShoppingCart },
        { name: "My Trainers", link: "/user/trainers", icon: MdPerson },
        { name: "My Tasks", link: "/user/todos", icon: MdAssignment },
        { name: "Messages", link: "/user/messages", icon: MdMessage },
        { name: "Settings", link: "/user/settings", icon: MdSettings },
        { name: "Logout", link: "/logout", icon: MdLogout }
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            {/* <Header /> */}
            <div className="flex">
                {/* SIDEBAR */}
                <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 shadow-sm">
                    <div className="py-4 px-3">
                        <h2 className="px-2 mb-4 text-sm font-semibold text-gray-500 uppercase">Menu</h2>
                        <ul className="space-y-1">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <NavLink
                                        to={item.link}
                                        className={({ isActive }) =>
                                            `
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg 
                                            font-medium transition-colors
                                            ${isActive 
                                              ? "bg-yellow-400 text-black" 
                                              : "text-gray-700 hover:bg-yellow-50"}
                                            `
                                        }
                                    >
                                        <item.icon size={20} />
                                        {item.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Page