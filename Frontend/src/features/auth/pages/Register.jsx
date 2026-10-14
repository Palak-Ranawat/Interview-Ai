import React, { useState } from 'react'
import {useNavigate,Link} from 'react-router-dom'
import  {useAuth} from '../hooks/useAuth'

const Register = () => {
  const navigate = useNavigate()
  const [username,setusername]= useState("")
  const [email,setemail]=useState("")
  const [password,setpassword] = useState("")
  const {loading,handleRegister}= useAuth()
     const handleSubmit = async(e) =>{
        e.preventDefault()
       try{
        await handleRegister({username,email,password})
        navigate("/")
      } 
      catch(error){
       console.error(
       "Register failed:",
       error.response?.data||error.message
       );
      }
    };
        if(loading){
          return(<main><h1>Loading.....</h1></main>)
        }
  return (
      <main className='flex min-h-screen items-center justify-center bg-gray-400 px-4'>
    <div className='form-container  max-w-mb rounded-2xl p-8 shadow-lg'>
        <h1 className=' flex mb-2 text-gray-500' font-bold text-3xl >Register</h1>
        <form onSubmit={handleSubmit}>

       <div className='display-flex flex-col gap-0.75'>
          <label htmlFor='username'>Username</label>
          <input  
          onChange={(e)=>{setusername(e.target.value)}}
          className =' w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black'
          type="text" id='username' placeholder='Enter username'required
          />
       </div>


            <div className=' display-flex flex-col gap-0.75 input-group'>
            <label htmlFor='email'>Email</label>
            <input 
            onChange={(e)=>{setemail(e.target.value)}}
            className =' w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black' type='email' id='email' name='email' placeholder='Enter email adress'
            required/>
            </div>

            <div className='input-group'>
            <label htmlFor='password'>Password</label>
            <input 
            onChange={(e)=>{setpassword(e.target.value)}}
            className = 'w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black' type='password' id='password' name='password' placeholder='Enter a password'
            required/>
            </div>
            <button className=' w-full rounded-lg bg-pink-700 py-3 font-semibold text-white  hover:bg-gray-800 button primary-button cursor-pointer transition duration-300 ease-in-out'>Register</button>
        </form>
        <p>Already have an account? <Link to={"/login"}>Login</Link></p>
    </div>
   </main>
  )
}

export default Register
