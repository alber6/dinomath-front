import React, { createContext, useState, useEffect } from "react";

// crear el contexto donde guardamos la información
export const AuthContext = createContext();

//crear el proveedor que es el que da la información a toda la app
const AuthProvider = ({ children }) => {
    // funcion dentro del useState para que lea el localStorage cada vez que se cargue la página, por si hay usuario guardado recuperarlo o no
    const [ user, setUser ] = useState(() => {
         const savedUser = localStorage.getItem("user")
         return savedUser ? JSON.parse(savedUser) : null;
    })
    // mirar si tiene permiso para entrar
    const [ token, setToken ] = useState(() => {
        return localStorage.getItem("token") || null;
    })

    // función que se llamará en el login.jsx cuando el servidor nos dé el ok
    const loginAuth = ( userData, userToken ) => {
        // Actualizamos el estado en tiempo real (React)
        setUser(userData);
        setToken(userToken);

        // Lo guardamos en el "disco duro" del navegador (localStorage).
        // Así, si el niño cierra la pestaña por accidente y vuelve a entrar, 
        // no tiene que volver a poner la contraseña.
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);
    };

    //función para cerrar sesión
    const logoutAuth = () => {
        setUser(null)
        setToken(null)
        // Hacemos limpieza para que el próximo que use el ordenador no entre en esta cuenta.
        localStorage.removeItem("user")
        localStorage.removeItem("token")
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, loginAuth, logoutAuth}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;