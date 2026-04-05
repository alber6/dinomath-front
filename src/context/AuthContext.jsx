import React, { createContext, useState, useEffect } from "react";

// crear el contexto donde guardamos la información
export const AuthContext = createContext();

//crear el proveedor que es el que da la información a toda la app
const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(() => {
         const savedUser = localStorage.getItem("user")
         return savedUser ? JSON.parse(savedUser) : null;
    })
    const [ token, setToken ] = useState(() => {
        return localStorage.getItem("token") || null;
    })

    // función que se llamará cuando el login sea correcto
    const loginAuth = ( userData, userToken ) => {
        setUser(userData);
        setToken(userToken);

        //borrar en el navegador para que no se borre al recargar la página
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);
    };

    //función para cerrar sesión
    const logoutAuth = () => {
        setUser(null)
        setToken(null)
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