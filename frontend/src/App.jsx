import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/public/Home';
import Courses from './pages/public/Courses';
import CourseDetail from './pages/public/CourseDetail';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Dashboard from './pages/protected/trainer/dashboard/Dashboard'
import Sidebar from './pages/protected/trainer/components/Sidebar';
import Course from './pages/protected/trainer/courses/Courses';
import CoursesList from './pages/protected/trainer/courses/CoursesList';
import Client from './pages/protected/trainer/clients/Client';
import ClientTrackPage from './pages/protected/trainer/clients/ClientTrackPage';
import Chat from './pages/protected/user/Chat';
import Page from './pages/protected/user/Page';
import UserMessagePage from './pages/protected/user/messages/UserMessagePage';
import TrainerMessagePage from './pages/protected/trainer/messages/TrainerMessagePage';
import Register from './pages/public/Register';
import RegisterTrainer from './pages/public/RegisterTrainer';
import Login from './pages/public/Login';
import ProtectedRoute from './pages/protected/trainer/ProtectedRoute';
import ProtectedAdminRoute from './pages/protected/admin/ProtectedAdminRoute';
import AdminSidebar from './pages/protected/admin/AdminSideBar';
import AdminProduct from './pages/protected/admin/products/AdminProduct';
import UserPage from './pages/protected/admin/users/UserPage';
import IncomingCallHandler from './components/chat/IncomingCallHandler';

// Client-Trainer System imports
import ClientManagement from './pages/protected/trainer/clients/ClientManagement';
import TodoManagement from './pages/protected/trainer/todos/TodoManagement';
import CreateTodo from './pages/protected/trainer/todos/CreateTodo';
import TodoDetail from './pages/protected/trainer/todos/TodoDetail';
import AssignTodo from './pages/protected/trainer/todos/AssignTodo';
import UserDashboard from './pages/protected/user/dashboard/UserDashboard';
import UserTodoList from './pages/protected/user/todos/UserTodoList';
import UserTodoDetail from './pages/protected/user/todos/UserTodoDetail';
import MyTrainers from './pages/protected/user/trainers/MyTrainers';
import TrainerTasks from './pages/protected/user/trainers/TrainerTasks';
import MyCourses from './pages/protected/user/courses/MyCourses';
import CoursePlayer from './pages/protected/user/courses/CoursePlayer';
import AdminClientTodos from './pages/protected/admin/clientTodos/AdminClientTodos';
import EsewaSuccess from './pages/public/EsewaSuccess';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        {/* Global incoming call handler */}
        <IncomingCallHandler />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-trainer" element={<RegisterTrainer />} />
          <Route path="/course/payment/success" element={<EsewaSuccess/>}/>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/about" element={<About />} /> */}

          <Route path="/trainer" element={
            <ProtectedRoute allowedRole="trainer">
              <Sidebar />
            </ProtectedRoute>}>

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<CoursesList />} />
            <Route path="courses/:courseId" element={<Course />} />
            <Route path="clients" element={<Client />} />
            <Route path="messages" element={<TrainerMessagePage />} />
            <Route path="clients/:clientId/track" element={<ClientTrackPage />} />
            
            {/* Client-Trainer Management */}
            <Route path="client-management" element={<ClientManagement />} />
            <Route path="todos" element={<TodoManagement />} />
            <Route path="todos/create" element={<CreateTodo />} />
            <Route path="todos/:todoId" element={<TodoDetail />} />
            <Route path="todos/:todoId/assign" element={<AssignTodo />} />
          </Route>

          <Route path='/user' element={<Page />}>
            <Route path="chat" element={<Chat />} />
            <Route path="messages" element={<UserMessagePage />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="trainers" element={<MyTrainers />} />
            <Route path="trainers/:trainerId/tasks" element={<TrainerTasks />} />
            <Route path="todos" element={<UserTodoList />} />
            <Route path="todos/:assignmentId" element={<UserTodoDetail />} />
          </Route>

          {/* Course Player - Full screen layout (outside Page layout) */}
          <Route path="/user/my-courses/:courseId" element={<CoursePlayer />} />

            {/* admin route protected wala */}
          <Route path="/admin" element={
              <ProtectedAdminRoute allowedRole="admin">
                <AdminSidebar />
              </ProtectedAdminRoute>
            }>
              <Route path="dashboard" element={<h1>This is admin dashboard</h1>} />
              <Route path="products" element={<AdminProduct/>}/>
              <Route path="users" element={<UserPage/>}/>
              <Route path="client-todos" element={<AdminClientTodos/>}/>
            </Route>

        </Routes>
      </Router>
    </>
  )
}


export default App
