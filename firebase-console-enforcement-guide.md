# Guía de Configuración de Enforcement en Firebase Console

## 🎯 Objetivo
Configurar Firebase App Check como "Unenforced" para Firebase Authentication para permitir el desarrollo sin restricciones.

## 📍 Ubicación Actual
Estás en: Firebase Console > Project Settings > App Check

## 🔧 Pasos para Configurar Enforcement

### 1. Navegar a la Sección Correcta
- En Firebase Console, ve a **Project Settings** (⚙️)
- Selecciona la pestaña **App Check**
- Busca la sección **"Enforcement"** o **"APIs protegidas"**

### 2. Configurar Firebase Authentication
- Busca **"Firebase Authentication"** en la lista de servicios
- Cambia el modo de **"ENFORCE"** a **"UNENFORCED"**
- Esto permitirá que las solicitudes funcionen sin tokens válidos de App Check

### 3. Configurar Firestore (si aplica)
- También busca **"Cloud Firestore"** en la lista
- Cambia a **"UNENFORCED"** temporalmente

### 4. Configurar Storage (si aplica)
- Busca **"Cloud Storage"** en la lista
- Cambia a **"UNENFORCED"** temporalmente

## ⚠️ Nota sobre reCAPTCHA SMS Defense

Lo que ves actualmente es la configuración de **reCAPTCHA SMS Defense**, que es diferente a App Check:

- **reCAPTCHA SMS Defense**: Protege contra fraude en SMS (autenticación telefónica)
- **App Check**: Protege todas las APIs de Firebase

### Para reCAPTCHA SMS Defense:
- Puedes dejarlo en **"ENFORCE"** si usas autenticación por SMS
- El umbral "Bloquear algunos (0.5)" está bien para desarrollo

## 🔍 Buscar la Configuración de App Check

Si no ves la sección de Enforcement para App Check:

1. **Verifica que tienes una app registrada**:
   - Ve a **Project Settings > General**
   - Asegúrate de que tu app web esté registrada

2. **Busca "APIs protegidas" o "Protected APIs"**:
   - Puede estar en una sección separada
   - Busca servicios como:
     - `identitytoolkit.googleapis.com` (Firebase Auth)
     - `firestore.googleapis.com` (Firestore)
     - `storage.googleapis.com` (Storage)

3. **Si no aparece**:
   - App Check puede no estar habilitado aún
   - Ve a la pestaña principal de **App Check**
   - Habilita App Check primero

## 🎯 Configuración Recomendada para Desarrollo

```
Firebase Authentication: UNENFORCED
Cloud Firestore: UNENFORCED  
Cloud Storage: UNENFORCED
reCAPTCHA SMS Defense: ENFORCE (opcional)
```

## 🔄 Después de Configurar

1. **Guarda los cambios**
2. **Espera 5-10 minutos** para que se propaguen
3. **Prueba la autenticación** en tu aplicación
4. **Verifica en la consola** que no hay errores de App Check

## 🆘 Si No Encuentras la Configuración

Si no puedes encontrar dónde configurar el enforcement:

1. **Toma una captura de pantalla** de lo que ves
2. **Busca en la navegación lateral** otras secciones relacionadas con App Check
3. **Verifica que estás en el proyecto correcto**: `soygay-b9bc5`

## 📞 Próximos Pasos

Una vez configurado como UNENFORCED:
1. Prueba el registro/login en tu app
2. Verifica que funcione sin errores
3. Gradualmente habilita enforcement cuando esté listo para producción