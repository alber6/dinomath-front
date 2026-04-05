# 🐾 MathsPets - Aprende Matemáticas Jugando

MathsPets es una aplicación web interactiva y gamificada diseñada para que los niños de primaria practiquen matemáticas mientras crían y evolucionan a su propia mascota virtual. 

## ✨ Características Principales

* **🥚 Adopción de Mascotas:** Los usuarios pueden elegir entre tres elementos iniciales (Fuego, Agua, Planta).
* **🧮 Sistema de Batalla Matemática:** Resolviendo operaciones matemáticas generadas aleatoriamente, su mascota gana Puntos de Experiencia (XP).
* **📈 Progresión y Niveles:** Un sistema dinámico de niveles basado en la XP acumulada.
* **✨ Evoluciones en Tiempo Real:** Al alcanzar ciertos niveles (Nivel 5, Nivel 10...), la mascota evoluciona visualmente con animaciones retro, consumiendo datos directamente de la **PokéAPI**.
* **🎨 Diseño Retro-UI:** Interfaz amigable para niños con animaciones CSS personalizadas, efectos de destello y un diseño *fully responsive* (Flexbox/Grid).

## 🛠️ Tecnologías Utilizadas

* **React (Vite):** Librería principal para la construcción de la interfaz de usuario.
* **Context API:** Para la gestión del estado global (Nivel, XP, Mascota seleccionada) sin *prop drilling*.
* **React Hook Form:** Para la gestión eficiente y validación del formulario de respuestas matemáticas.
* **Fetch & PokéAPI:** Integración con API externa (REST) para obtener los *sprites* oficiales de las evoluciones.
* **CSS3:** Animaciones clave (`@keyframes`), variables CSS, pseudo-elementos y diseño responsivo.

## 🚀 Cómo ejecutar el proyecto en local

Sigue estos pasos para probar MathsPets en tu propio ordenador:

1. Clona este repositorio o descomprime el archivo `.zip`.
2. Abre la terminal en la carpeta raíz del proyecto.
3. Instala las dependencias necesarias ejecutando:
   ```bash
   npm install



---
> ✨ *Profesor y futuro desarrollador* ➔ **Alberto Peinado**