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
    const [ isLoading, SetisLoading ] = useState(false)

    const onSubmit = async (data) => {
        SetisLoading(true)
        try {
            //hacer la llamada POST al backend
            const response = await fetch("https://backend-mathpets.onrender.com/api/v1/users/login", {
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
                SetisLoading(false)
            }
        } catch (error) {
            setErrorBackend("Error al conectarse con el servidor. ❌❌")
            SetisLoading(false)
        }
    };

    return (
<div className="login">
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

                <button 
                type="submit"
                disabled= {isLoading}
                style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'wait' : 'pointer'
                }}
                >¡A Jugar!

                {isLoading ? 'Conectando...⌛' : '¡A jugar!'}
                </button>
            </form>
        </div>
    );
};

export default Login;