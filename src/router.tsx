import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/login/LoginPage";
import Dashboard from "./layouts/Dashboard";
import NonAuth from "./layouts/NonAuth";
import Root from "./layouts/Root";
import Users from "./pages/Users/Users";

export const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		children: [
			{
				path: '',
				element: <Dashboard />,
				children: [
					{
						path: '',
						element: <Home />,
					},
					{
						path: '/users',
						element: <Users />,
					},
				],
			},
			{
				path: '/auth',
				element: <NonAuth />,
				children: [
					{
						path: 'login',
						element: <LoginPage />,
					},
				],
			},
		],
	},
]);