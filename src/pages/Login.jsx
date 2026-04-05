import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    // coger las herramientas de react hook form
    const { register, handleSubmit, formState: { errors} } = useForm();

    //cogemos la función del contexto para guardar la sesión 
    const { loginAuth } = useContext(AuthContext);

    //usar useNavigate para llevar al usuario a otra pantalla
    const navigate = useNavigate();

    // estado paraa guardar errores que nos dé el backend como puede ser la contraseña incorrecta
    const [ errorBackend, setErrorBackend ] = useState("");

    const onSubmit = async (data) => {
        try {
            //hacer la llamada POST al backend
            const response = await fetch("http://localhost:3000/api/v1/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data) //enviar username y password
            });
            const result = await response.json()

            if (response.ok){
                // si funciona bien, guardamos los datos en el contexto y localStorage
                loginAuth(result.user, result.token);
                // madamos al usuario al dashboard
                if (result.user.mascotaActiva.nombre){
                    navigate("/dashboard");
                } else {
                    navigate("/choose")
                }
            } else {
                // si falla, mostramos el mensaje del backend
                setErrorBackend(result);
            }
        } catch (error) {
            setErrorBackend("Error al conectarse con el servidor. ❌❌")
        }
    };

    return (
<div className="login-container">
            <h2>Iniciar Sesión 🎮</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>Nombre de Jugador:</label>
                    <input 
                        type="text" 
                        {...register("username", { required: "¡El nombre de usuario es obligatorio!" })} 
                    />
                    {/* Si hay error de validación, lo mostramos */}
                    {errors.username && <p>{errors.username.message}</p>}
                </div>

                <div>
                    <label>Contraseña:</label>
                    <input 
                        type="password" 
                        {...register("password", { required: "¡No te olvides de la contraseña!" })} 
                    />
                    {errors.password && <p>{errors.password.message}</p>}
                </div>

                {/* Si el backend nos dice que los datos están mal, sale aquí */}
                {errorBackend && <p>{errorBackend}</p>}

                <button type="submit">¡A Jugar!</button>
            </form>
        </div>
    );
};

export default Login;