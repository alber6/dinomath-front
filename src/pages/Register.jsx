import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    // coger las herramientas de react hook form
    const { register, handleSubmit, formState: { errors} } = useForm();

    //usar useNavigate para llevar al usuario a otra pantalla
    const navigate = useNavigate();

    // estado paraa guardar errores que nos dé el backend como puede ser la contraseña incorrecta
    const [ errorBackend, setErrorBackend ] = useState("");

    const onSubmit = async (data) => {
        try {
            //hacer la llamada POST al backend
            const response = await fetch("https://backend-mathpets.onrender.com/api/v1/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data) //enviar username, password, nombre y curso
            });
            const result = await response.json()

            if (response.ok){
                // madamos al usuario al login
                navigate("/login");
            } else {
                // si falla, mostramos el mensaje del backend
                setErrorBackend(result);
            }
        } catch (error) {
            setErrorBackend("Error al conectarse con el servidor. ❌❌")
        }
    };

        return (
        <div className="register">
            <h2>Registro de usuario 🎮</h2>
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
                <div>
                    <label>Nombre:</label>
                    <input 
                        type="text" 
                        {...register("nombre", { required: "Te olvidaste de escribir tu nombre." })} 
                    />
                    {errors.nombre && <p>{errors.nombre.message}</p>}
                </div>
                <div>
                <label>Curso:</label>
                    <input 
                        type="number" 
                        min="5"
                        max="6"
                        {...register("curso", { 
                            required: "El curso es obligatorio",
                            min: {
                                value: 1,
                                message: "El curso mínimo es 5º"
                            },
                            max: {
                                value: 6,
                                message: "El curso máximo es 6º"
                            }
                        })} 
                    />
                    {errors.curso && <p>{errors.curso.message}</p>}
                </div>

                {/* Si el backend nos dice que los datos están mal, sale aquí */}
                {errorBackend && <p>{errorBackend}</p>}

                <button type="submit">¡A Jugar!</button>
            </form>
        </div>
    );
};

export default Register;