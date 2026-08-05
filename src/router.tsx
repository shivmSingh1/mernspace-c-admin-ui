import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/login/LoginPage";

export const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />
	},
	{
		path: '/login',
		element: <LoginPage />
	}
])