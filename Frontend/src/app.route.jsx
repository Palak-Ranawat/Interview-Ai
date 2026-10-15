import { createBrowserRouter } from "react-router-dom";
import Home from "./features/interview/pages/Home";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import Protected from "./features/auth/components/protected";
import Interview from "./features/interview/pages/interview";
import Reports from "./features/interview/pages/Reports";
export const router = createBrowserRouter([
  {
    path:"/login",
    element:<Login />
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path:"/",
    element:<Protected>
    <Home />
</Protected>
  },
  {
    path:"/reports",
    element:<Protected>
    <Reports />
</Protected>
  },
  {
    path:"/interview/:interviewId?",
    element:<Protected><Interview /></Protected>
  }
]);