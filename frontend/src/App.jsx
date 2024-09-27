import {useQuery} from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/common/LoadingSpinner';
import GamePage from './pages/game/GamePage';

function App() {
  const {data: authUser,isLoading, isError, error}=useQuery({
    queryKey: ['authUser'],
    queryFn: async()=>{
      try {
        const res=await fetch('/api/auth/me');
        const data=await res.json();
        if(data.error) return null;
        if(!res.ok){
          throw new Error(data.error || 'Something went wrong!')
        }
        
        return data;
      } catch (error) {
        throw new Error(data.error);
      }
    },
    retry: false
  })

  if(isLoading){
    return (
      <div className="h-screen flex justify-center items-center"> 
        <LoadingSpinner size="lg"/>
      </div>
    );
  }

  return (
    <div className='min-h-screen  mx-auto bg-gray-900 text-white'>
      <Routes>
        <Route path='/' element={authUser?<HomePage />:<Navigate to={'/login'}/>} />
        <Route path='/signup' element={!authUser?<SignupPage />: <Navigate to={'/'}/>} />
        <Route path='/login' element={!authUser?<LoginPage />:<Navigate to={'/'}/>} />
        <Route path='/game/:roomId' element={<GamePage/>} />
      </Routes>
      <Toaster/>
    </div>
    
    
  )
}

export default App
