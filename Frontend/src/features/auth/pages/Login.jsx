
import React, { useState } from 'react'
import { useNavigate,Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
const Login = () => {

    const {loading,handleLogin}= useAuth()
    const navigate = useNavigate()

    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
     const handleSubmit = async(e) =>{
        e.preventDefault()
        try{
        handleLogin({email,password})
        navigate("/")
        }
        catch(error){
       console.error(
       "Login failed:",
       error.response?.data||error.message
       );
      }
    };

    if(loading){
     return (<main><h1>Loading....</h1></main>)
    }

  return (
   <main className='flex min-h-screen items-center justify-center bg-gray-400 px-4'>
    <div className='form-container  max-w-mb rounded-2xl p-8 shadow-lg'>
        <h1 className=' flex mb-2 text-gray-500' font-bold text-3xl >Login to your account</h1>
        <form onSubmit={handleSubmit}>
            <div className=' display-flex flex-col gap-0.75 input-group'>
            <label htmlFor='email'>Email</label>
            <input 
             onChange={(e)=>{setEmail(e.target.value)}}
            className =' w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black' type='email' id='email' name='email' placeholder='Enter email adress'></input>
            </div>
            <div className='input-group'>
            <label htmlFor='password'>Password</label>
            <input 
            onChange={(e)=>{setPassword(e.target.value)}}
            className = 'w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black' type='password' id='password' name='password' placeholder='Enter a password'></input>
            </div>
            <button className=' w-full rounded-lg bg-pink-700 py-3 font-semibold text-white  hover:bg-gray-800 button primary-button cursor-pointer transition duration-300 ease-in-out'>Login</button>
        </form>
         <p>Don't have an account?<Link to={"/register"}>Register</Link></p>
    </div>
   </main>
  )
}
export default Login