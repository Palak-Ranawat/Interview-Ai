import { useContext,useEffect } from "react";
import { AuthContext } from "../auth.context";
import {login,register,logout,getMe} from "../services/auth.api"
export const useAuth =()=>{
    const context =useContext(AuthContext)
    const {user,setUser,loading,setLoading} = context

    const handleLogin = async ({ email, password }) => {
        try {
            setLoading(true);
            const data = await login({ email, password });
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        try {
            setLoading(true);
            const data = await register({ username, email, password });
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGetMe = async () => {
        try {
            setLoading(true);
            const data = await getMe();
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    };
    
        return {
        user,
        setUser,
        loading,
        setLoading,
        handleLogin,
        handleRegister,
        handleLogout,
        handleGetMe,
    };
};