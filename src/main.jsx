import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Register from './Page/Register.jsx'
import Login from './Page/Login.jsx'

import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import UserProfile from './Page/UserProfile.jsx'
import HomePage from './Page/HomePage.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'; // นำเข้าไฟล์ CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // นำเข้าไฟล์ JS (ถ้าต้องการใช้ Components เช่น Modal, Dropdown)
import '@fortawesome/fontawesome-free/css/all.min.css';
import Calculating from './Page/Calculating.jsx'
import Members from './Page/Members.jsx'
import RiskReportDetails from './Page/RiskReportDetails.jsx'

const router = createBrowserRouter([
  {
    path:'/',
    element: <HomePage />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/userProfile',
    element: <UserProfile />
  },
  {
    path: '/calculating',
    element: <Calculating />
  },
  {
    path: '/members',
    element: <Members/>
  },
  {
    path: '/risk-report/:reportId',
    element: <RiskReportDetails />
  },

  

  
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router} />
  </StrictMode>,
)
