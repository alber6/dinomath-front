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

    // 🌟 NUEVO: SISTEMA DE TOKENS (Contamos dinos normales nivel 50 vs míticos adoptados)
    const petsUsuario = user?.pets || [];
    
    const tokensGanados = petsUsuario.filter(pet => {
        const esMitico = DINODEX[pet.nombre]?.[0]?.esEpico;
        return !esMitico && pet.nivel >= 50;
    }).length;

    const miticosAdoptados = petsUsuario.filter(pet => {
        return DINODEX[pet.nombre]?.[0]?.esEpico;
    }).length;

    // Solo se permite ver y adoptar huevos míticos si quedan "Billetes Dorados" sin gastar
    const puedeAdoptarMiticos = tokensGanados > miticosAdoptados;

    // LÓGICA DE ESTADO DERIVADO
    // Calculamos las mascotas que el usuario ya tiene
    const mascotasConseguidas = petsUsuario.map(mascota => mascota.nombre);

    // Calculamos cuáles quedan libres, filtrando los míticos si no le quedan tokens
    const mascotasDisponibles = Object.keys(DINODEX).filter((nombreDino) => {
        // Si el usuario ya tiene este dinosaurio, lo descartamos
        if (mascotasConseguidas.includes(nombreDino)) return false;

        // ¿Es un dinosaurio mítico?
        const esMitico = DINODEX[nombreDino][0]?.esEpico;
        
        // Si es mítico y el usuario NO tiene tokens disponibles, se lo ocultamos
        if (esMitico && !puedeAdoptarMiticos) return false;

        return true; 
    });

    // Preparamos las tarjetas visuales (cortamos a 3 opciones)
    const opcionesParaAdoptar = mascotasDisponibles.slice(0, 3).map(nombreDino => {
        const infoFase1 = DINODEX[nombreDino][0];
        return {
            idDino: nombreDino,
            tipo: infoFase1.tipo,
            imagenHuevo: infoFase1.egg,
            esMitico: infoFase1.esEpico
        };
    });

    // --- FUNCIÓN DE CONFIRMACIÓN ---
    const confirmarEleccion = () => {
        if (!mascotaSeleccionada) return; 
        elegirMascota(mascotaSeleccionada);
        navigate('/dashboard');
    };

    // PROTECCIÓN DE RUTA 
    useEffect(() => {
        if (!user) return;
        // Si es partida nueva, pase VIP
        if (!user.pets || user.pets.length === 0) return;
        
        // Te expulsa solo si el backend dice que no hay espacio común Y TAMPOCO tienes tokens míticos
        if (!puedeAdoptar && !puedeAdoptarMiticos) {
            navigate("/dashboard");
        }
    }, [user, puedeAdoptar, navigate, puedeAdoptarMiticos]);

    return (
        <div className="choose">
            <h2>{puedeAdoptarMiticos ? '¡Has desbloqueado Huevos Míticos!' : '¡Elige la mascota que quieras!'}</h2>
            
            <div className="botones">
                {opcionesParaAdoptar.map((opcion) => (
                    <div className={`eggCard ${opcion.esMitico ? 'huevo-mitico' : ''}`} key={opcion.idDino}>
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
                        {opcion.esMitico && <span className="etiqueta-mitica-tienda">Multiplicaciones ✖️</span>}
                    </div>
                ))} 
            </div>

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