import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext.jsx";
import "./ChoosePet.css";
import { DINODEX } from '../utils/dinodex.js';

const ChoosePet = () => {
    const navigate = useNavigate();
    const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
    
    // Traemos los datos de nuestros Contextos
    const { elegirMascota, puedeAdoptar } = useContext(GameContext);
    const { user } = useContext(AuthContext);

    // LÓGICA DE ESTADO DERIVADO
    // Calculamos las mascotas que el usuario ya tiene
    const mascotasConseguidas = user?.pets?.map(mascota => mascota.nombre) || [];

    // Calculamos cuáles quedan libres
    const mascotasDisponibles = Object.keys(DINODEX).filter(
        (nombreDino) => !mascotasConseguidas.includes(nombreDino)
    );

    // Preparamos las tarjetas visuales (cortamos a 3 opciones)
    const opcionesParaAdoptar = mascotasDisponibles.slice(0, 3).map(nombreDino => {
        const infoFase1 = DINODEX[nombreDino][0];
        return {
            idDino: nombreDino,
            tipo: infoFase1.tipo,
            imagenHuevo: infoFase1.egg
        };
    });

    // --- FUNCIÓN DE CONFIRMACIÓN ---
    const confirmarEleccion = () => {
        if (!mascotaSeleccionada) return; 
        elegirMascota(mascotaSeleccionada);
        navigate('/dashboard');
    };

    // PROTECCIÓN DE RUTA (por si el usario le diera por cambiar la direccion de la url directamente) 
    useEffect(() => {
        if (!user) return;
        // Si es partida nueva, pase VIP
        if (!user.pets || user.pets.length === 0) return;
        // Si ya tiene dinos pero NO tiene espacio, lo echamos de aquí
        if (!puedeAdoptar) {
            navigate("/dashboard");
        }
    }, [user, puedeAdoptar, navigate]);

    return (
        <div className="choose">
            <h2>¡Elige la mascota que quieras!</h2>
            
            <div className="botones">
                {/* Pintamos las opciones de forma súper limpia */}
                {opcionesParaAdoptar.map((opcion) => (
                    <div className="eggCard" key={opcion.idDino}>
                        <button 
                            className={`btn-juego ${mascotaSeleccionada === opcion.idDino ? 'seleccionado' : ''}`} 
                            onClick={() => setMascotaSeleccionada(opcion.idDino)}
                        >
                            {opcion.tipo}
                        </button>
                        <img
                            src={opcion.imagenHuevo} 
                            alt={`Huevo de ${opcion.tipo}`} 
                        />
                    </div>
                ))} 
            </div>

            {/* Si ha seleccionado uno, le mostramos el botón final */}
            {mascotaSeleccionada && (
                <div className="buttonConfirmado">
                    <p>
                        {`Has elegido el huevo de ${DINODEX[mascotaSeleccionada][0].tipo}. ¿Estás seguro?`}
                    </p>
                    <button onClick={confirmarEleccion}>Adoptar y empezar</button>
                </div>
            )}
        </div>
    );
};

export default ChoosePet;