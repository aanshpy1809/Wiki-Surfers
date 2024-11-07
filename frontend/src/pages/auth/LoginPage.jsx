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
		<>
		<div className='max-w-screen-xl mx-auto flex min-h-screen px-10 '>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				{/* <XSvg className=' lg:w-2/3 fill-white' /> */}
				<img src='/display.png' className="lg:w-full" />
			</div>
			<div className='flex-1 flex flex-col justify-center m-5 items-center'>
				<form className='lg:w-4/5  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					{/* <XSvg className='w-24 lg:hidden fill-white' /> */}
					<img src='/display.png' className=" w-96 lg:hidden fill-white " />
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail className="text-orange-500"/>
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
						<MdPassword className="text-orange-500"/>
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
		<footer class="text-center text-gray-500 py-4">
		<p>Developed by <a href="https://www.linkedin.com/in/aansh-sagar/" class="text-blue-500 hover:underline">Aansh Sagar</a></p>
		</footer>
		</>
	);
};

export default LoginPage;
