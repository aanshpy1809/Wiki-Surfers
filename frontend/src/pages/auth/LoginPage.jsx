import { useState } from "react";
import { Link } from "react-router-dom";



import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";


const LoginPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const queryClient = useQueryClient();

	const { mutate: loginMutation, isError, isPending, error } = useMutation({
		mutationFn: async ({ username, password }) => {
			try {
				const res = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username, password }),
				});

				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to create account!");

				console.log(data);
				return data;
			} catch (error) {
				console.log(error.message);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className='w-full h-screen flex items-center justify-center bg-gray-900'>
			<div className='w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<h1 className='text-4xl font-extrabold text-white text-center'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow bg-gray-700 text-white p-2 rounded'
							placeholder='Username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow bg-gray-700 text-white p-2 rounded'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button
						type='submit'
						className='btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg'
					>
						{isPending ? "Loading..." : "Login"}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>

				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg text-center'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn w-full bg-transparent border border-blue-600 text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-700 hover:text-white'>
							Sign up
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
