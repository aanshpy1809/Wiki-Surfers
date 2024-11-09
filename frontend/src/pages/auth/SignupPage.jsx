import { Link } from "react-router-dom";
import { useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaMale, FaFemale } from 'react-icons/fa';


const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    gender: "",
  });

  const onCheckBoxChange = (gender) => {
    
    setFormData({ ...formData, gender: gender });
  };

  const queryClient = useQueryClient();

  const { mutate: signupMutation, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, username, fullName, password, gender }) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, fullName, password, gender }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create account!");

        
        return data;
      } catch (error) {
        
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className='flex flex-col min-h-screen justify-center items-center'>
		<div className='max-w-screen-xl mx-auto flex  px-10 '>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				{/* <XSvg className=' lg:w-2/3 fill-white' /> */}
				<img src='/display.png' className="lg:w-full" />
			</div>
			<div className='flex-1 flex flex-col justify-center m-5 items-center'>
				<form className='lg:w-4/5  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					{/* <XSvg className='w-24 lg:hidden fill-white' /> */}
					<img src='/display.png' className=" w-96 lg:hidden fill-white " />
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
					<label className="input input-bordered rounded flex items-center gap-2 ">
            <MdOutlineMail className="text-orange-500" />
            <input
              type="email"
              className="grow bg-gray-700 text-white p-2 rounded"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>

          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1 ">
              <FaUser className="text-orange-500" />
              <input
                type="text"
                className="grow bg-gray-700 text-white p-2 rounded"
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>
            <label className="input input-bordered rounded flex items-center gap-2 flex-1 ">
              <MdDriveFileRenameOutline className="text-orange-500" />
              <input
                type="text"
                className="grow bg-gray-700 text-white p-2 rounded"
                placeholder="Full Name"
                name="fullName"
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </label>
          </div>

          <label className="input input-bordered rounded flex items-center gap-2 ">
            <MdPassword className="text-orange-500" />
            <input
              type="password"
              className="grow bg-gray-700 text-white p-2 rounded"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <div className="flex justify-center items-center">
          <GenderCheckbox
            onCheckBoxChange={onCheckBoxChange}
            selectedGender={formData.gender}
          />
          </div>
          

          <button className="btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg">
            {isPending ? "Loading..." : "Sign Up"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>

        <div className="flex flex-col gap-2 mt-4">
          <p className="text-white text-lg text-center">
            Already have an account?
          </p>
          <Link to="/login">
            <button className="btn w-full bg-transparent border border-blue-600 text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-700 hover:text-white">
              Sign in
            </button>
          </Link>
          </div>
          
			</div>
		</div>
    <footer className="text-center text-gray-500 py-4">
            <p>Developed by <a href="https://www.linkedin.com/in/aansh-sagar/" className="text-blue-500 hover:underline">Aansh Sagar</a></p>
        </footer>
    </div>
	);
};



const GenderCheckbox = ({ onCheckBoxChange, selectedGender }) => {
	return (
		<div className='flex gap-4'>
			<div className='form-control'>
				<label className='label gap-2 cursor-pointer items-center'>
					<FaMale className={`text-xl ${selectedGender === 'male' ? "text-orange-500" : "text-slate-500"}`} />
					<span className='label-text mr-2'>Male</span>
					<input 
                        type='checkbox' 
                        className='checkbox border-slate-900' 
                        checked={selectedGender === 'male'} 
                        onClick={() => onCheckBoxChange('male')} 
                    />
				</label>
			</div>
			<div className='form-control'>
				<label className='label gap-2 cursor-pointer items-center'>
					<FaFemale className={`text-xl ${selectedGender === 'female' ? "text-orange-500" : "text-slate-500"}`} />
					<span className='label-text mr-2'>Female</span>
					<input 
                        type='checkbox' 
                        className='checkbox border-slate-900' 
                        checked={selectedGender === 'female'} 
                        onClick={() => onCheckBoxChange('female')} 
                    />
				</label>
			</div>
		</div>
	);
};

export default SignUpPage;
