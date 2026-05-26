import { useCallback, useState } from "react";

export const useMathsEngine = () => {
    const [num1, setNum1] = useState(() => Number(localStorage.getItem('dino_n1')) || 0);
    const [num2, setNum2] = useState(() => Number(localStorage.getItem('dino_n2')) || 0);
    const [operador, setOperador] = useState(() => localStorage.getItem('dino_op') || "+");

    // 🌟 NUEVO: Ahora recibe también el nivel del dinosaurio
    const nuevaOperacion = useCallback((esModoEpico = false, nivelActual = 1) => {
        let n1, n2, nuevoOperador;

        if (esModoEpico) {
            // LÓGICA DE PROGRESIÓN ÉPICA
            const opciones = ['basica']; // Nivel 1 a 4
            if (nivelActual >= 5) opciones.push('media'); // Añadimos 1x2 cifras
            if (nivelActual >= 10) opciones.push('ceros'); // Añadimos x10, x100...
            if (nivelActual >= 20) opciones.push('division'); // Añadimos divisiones

            // Elegimos una operación al azar de las que tenga desbloqueadas
            const elegida = opciones[Math.floor(Math.random() * opciones.length)];

            if (elegida === 'division') {
                // Fabricamos una división exacta (ej. 3 x 4 = 12 -> 12 ÷ 3 = 4)
                const divisor = Math.floor(Math.random() * 9) + 2; // del 2 al 10
                const resultado = Math.floor(Math.random() * 9) + 2; // del 2 al 10
                n1 = divisor * resultado; 
                n2 = divisor;
                nuevoOperador = '÷';

            } else if (elegida === 'ceros') {
                n1 = Math.floor(Math.random() * 89) + 11; // del 11 al 99
                const multiplos = [10, 100, 1000];
                n2 = multiplos[Math.floor(Math.random() * multiplos.length)];
                if (Math.random() > 0.5) [n1, n2] = [n2, n1]; // A veces desordena
                nuevoOperador = 'x';

            } else if (elegida === 'media') {
                n1 = Math.floor(Math.random() * 89) + 11; // 11 al 99 (2 cifras)
                n2 = Math.floor(Math.random() * 8) + 2; // 2 al 9 (1 cifra)
                if (Math.random() > 0.5) [n1, n2] = [n2, n1]; // A veces desordena
                nuevoOperador = 'x';

            } else {
                // Básica (Tablas normales)
                n1 = Math.floor(Math.random() * 9) + 2; // 2 al 10
                n2 = Math.floor(Math.random() * 9) + 2; // 2 al 10
                nuevoOperador = 'x';
            }

        } else {
            // LÓGICA CLÁSICA: Sumas y Restas (Dinos normales)
            const esResta = Math.random() > 0.5;
            let numRandom1 = Math.floor(Math.random() * 131) + 20;
            let numRandom2 = Math.floor(Math.random() * 131) + 20;

            if (esResta) {
                if (numRandom2 > numRandom1) {
                    const temp = numRandom1;
                    numRandom1 = numRandom2;
                    numRandom2 = temp;
                }
                nuevoOperador = '-';
            } else {
                nuevoOperador = '+';
            }
            n1 = numRandom1;
            n2 = numRandom2;
        }

        setNum1(n1);
        setNum2(n2);
        setOperador(nuevoOperador);

        localStorage.setItem('dino_n1', n1);
        localStorage.setItem('dino_n2', n2);
        localStorage.setItem('dino_op', nuevoOperador);
    }, []);

    // 🌟 NUEVO: cargarOperacionSegura también recibe el nivel para pasárselo a nuevaOperacion si toca hacer una
    const cargarOperacionSegura = useCallback((esModoEpico = false, nivelActual = 1) => {
        const guardadoOp = localStorage.getItem('dino_op');
        const guardadoN1 = localStorage.getItem('dino_n1');
        
        // Verificamos si la guardada es épica ('x' o '÷')
        const esOperacionEpica = guardadoOp === 'x' || guardadoOp === '÷';

        if (!guardadoN1 || !guardadoOp || (esModoEpico !== esOperacionEpica)) {
            nuevaOperacion(esModoEpico, nivelActual);
        } else {
            setNum1(Number(guardadoN1));
            setNum2(Number(localStorage.getItem('dino_n2')));
            setOperador(guardadoOp);
        }
    }, [nuevaOperacion]);

    const comprobarResultado = (respuestaUsuario) => {
        let resultadoCorrecto;
        if (operador === '+') resultadoCorrecto = num1 + num2;
        else if (operador === '-') resultadoCorrecto = num1 - num2;
        else if (operador === 'x') resultadoCorrecto = num1 * num2;
        else if (operador === '÷') resultadoCorrecto = num1 / num2; // 🌟 NUEVO: Resolver división
        
        const esCorrecto = Number(respuestaUsuario) === resultadoCorrecto;

        if (esCorrecto) {
            localStorage.removeItem('dino_n1');
            localStorage.removeItem('dino_n2');
            localStorage.removeItem('dino_op');
        }
        return esCorrecto;
    };

    return { num1, num2, operador, nuevaOperacion, cargarOperacionSegura, comprobarResultado };
};