import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext.jsx";
import "./ChoosePet.css"
import { POKEDEX } from '../utils/pokedex.js'

const ChoosePet = () => {
        const navigate = useNavigate()
        const [ mascotaSeleccionada, setMascotaSeleccionada] = useState(null)
        
       // coger la función para guardar los datos
        const { elegirMascota, puedeAdoptar } = useContext(GameContext)
        const { user } = useContext(AuthContext)

        // conseguir el nombre de las mascotas que tiene el usuario y sino me das un array vacío, ponemos ? para que si no sale nada, aparezca undefined en vez de saltar un error
        const mascotasConseguidas = user?.pets?.map(mascota => mascota.nombre) || [];

        //sacamos las mascotas que siguen disponibles para elegir porque cuando ya no quede ninguno para elegir, mandaremos un mensaje al usuario
        const mascotasDisponibles = Object.keys(POKEDEX).filter((nombrePokemon) => !mascotasConseguidas.includes(nombrePokemon))
        
        const confirmarEleccion = () => {
            if (!mascotaSeleccionada) return; 

            // Metemos la mascota elegida en la mochila global
            elegirMascota(mascotaSeleccionada);
            navigate('/dashboard');
        }
        //añadimos esto para que no puedan entrar a /choose desde la barra del navegador
        useEffect(() => {
            // Si el usuario todavía no ha cargado del todo, esperamos en silencio.
            if (!user) return;

            // Si la mochila del usuario está VACÍA, es una partida nueva. 
            // Le damos pase VIP para quedarse, pase lo que pase.
            if (!user.pets || user.pets.length === 0) return;

            // Si ya tiene Pokémon en la mochila, entonces SÍ aplicamos la seguridad estricta.
            if (!puedeAdoptar) {
                navigate("/dashboard");
            }
    }, [user, puedeAdoptar, navigate]);

return (
        <div className="choose">
                    <h2>¡Elige la mascota que quieras!</h2>
                    <div className="botones">
                        {/* Como ya hemos filtrado arriba, aquí solo usamos el array y lo cortamos a 3 */}
                        {mascotasDisponibles.slice(0, 3).map((nombrePokemon) => {
                            const imagenHuevo = POKEDEX[nombrePokemon][0].egg;
                            const tipoHuevo = POKEDEX[nombrePokemon][0].tipo;

                            return (
                                <div className="eggCard" key={nombrePokemon}>
                                    <button 
                                        className={`btn-juego ${mascotaSeleccionada === nombrePokemon ? 'seleccionado' : ''}`} 
                                        onClick={() => setMascotaSeleccionada(nombrePokemon)}
                                    >
                                        {tipoHuevo}
                                    </button>
                                    <img
                                        src={imagenHuevo} 
                                        alt={`Huevo de ${tipoHuevo}`} 
                                    />
                                </div>
                            );
                        })} 
                    </div>

                    {mascotaSeleccionada && (
                        <div className="buttonConfirmado">
                            <p>
                                {`Has elegido el huevo de ${POKEDEX[mascotaSeleccionada][0].tipo}. ¿Estás seguro?`}
                            </p>
                            <button onClick={confirmarEleccion}>Adoptar y empezar</button>
                        </div>
                    )}
        </div>
    );
};

export default ChoosePet;