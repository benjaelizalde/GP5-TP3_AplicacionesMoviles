# TP3 - Aplicación de Recetas y Gestión de Ingredientes

Esta es una aplicación móvil desarrollada en React Native con Expo, orientada a la gestión de recetas de cocina y el manejo personalizado de ingredientes y favoritos. Permite a los usuarios buscar recetas, guardar sus favoritas, gestionar su lista de ingredientes y personalizar su cuenta y tema visual.

---

## Temática

La app está pensada para personas que desean:
- Buscar recetas de cocina por nombre o ingrediente.
- Guardar recetas favoritas para acceder rápidamente.
- Llevar un control de los ingredientes que tienen en casa.
- Administrar su cuenta y preferencias de tema (claro/oscuro/sistema).

---

## Librerías principales utilizadas

- **Expo**: Framework para desarrollo multiplataforma.
- **React Native**: Base para el desarrollo móvil.
- **expo-router**: Navegación basada en archivos.
- **@supabase/supabase-js**: Backend como servicio para autenticación y base de datos.
- **@react-navigation/native** y dependencias: Navegación entre pantallas.
- **@expo/vector-icons**: Iconografía.
- **axios**: Cliente HTTP para consumir la API de recetas.
- **react-native-toast-message**: Sistema de notificaciones emergentes para mostrar mensajes breves al usuario.

---

## Instrucciones para instalar y correr la app

1. **Clona el repositorio**  
   Descarga o clona este proyecto en tu máquina local.

2. **Instala las dependencias**  
   Abrí una terminal en la carpeta del proyecto y ejecuta:
   ```bash
   npm install
   ```

3. **Inicia la app**  
   Ejecuta:
   ```bash
   npx expo start
   ```
   Luego, seguí las instrucciones en pantalla para abrir la app en un emulador Android/iOS o en tu dispositivo físico con Expo Go.

---

## Notas adicionales

- La app utiliza Supabase para autenticación y almacenamiento de datos de usuario (ingredientes, favoritos, perfil).
- El diseño es responsive y soporta modo claro/oscuro.
- Podes personalizar el tema desde la sección de Cuenta de la app.
- El icono de la app es un libro, representando la temática de recetas.

