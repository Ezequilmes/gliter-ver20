# 🎯 Guía Paso a Paso: Configurar App Check Enforcement en Firebase Console

## ✅ Estado Actual Confirmado
- **App Check está DESHABILITADO en tu código** ✅
- **Todas las configuraciones están correctas** ✅
- **El problema está en Firebase Console** ❌

## 🔍 Lo que viste vs Lo que necesitas

### ❌ Lo que viste (reCAPTCHA SMS Defense):
```
reCAPTCHA SMS defense para Firebase Authentication
Modo de aplicación forzosa de la autenticación telefónica: ENFORCE
Puntuación de umbral de riesgo de fraude por SMS: Bloquear algunos (0.5)
```
**Esto NO es App Check** - Es solo para protección SMS

### ✅ Lo que necesitas encontrar (App Check Enforcement):
```
APIs protegidas / Protected APIs
├── Firebase Authentication (identitytoolkit.googleapis.com)
├── Cloud Firestore (firestore.googleapis.com)
└── Cloud Storage (storage.googleapis.com)
```

## 🗺️ Navegación Exacta en Firebase Console

### Paso 1: Acceder a App Check
1. Ve a: https://console.firebase.google.com/project/soygay-b9bc5/settings/appcheck
2. O navega: **Project Settings** ⚙️ → **App Check** (pestaña)

### Paso 2: Buscar la Sección Correcta
Busca una de estas secciones (pueden tener nombres diferentes):
- **"APIs protegidas"**
- **"Protected APIs"**
- **"Enforcement"**
- **"Service enforcement"**
- **"API enforcement"**

### Paso 3: Identificar los Servicios
Deberías ver una lista como esta:
```
🔒 Firebase Authentication
   Estado: ENFORCE → Cambiar a UNENFORCED
   
🔒 Cloud Firestore  
   Estado: ENFORCE → Cambiar a UNENFORCED
   
🔒 Cloud Storage
   Estado: ENFORCE → Cambiar a UNENFORCED
```

## 🔍 Si NO encuentras "APIs protegidas"

### Opción A: Verificar que App Check esté habilitado
1. En la página principal de App Check
2. Busca un botón **"Get started"** o **"Enable App Check"**
3. Si lo ves, haz clic para habilitar App Check primero

### Opción B: Buscar en otras ubicaciones
1. **Authentication** → **Settings** → **App Check**
2. **Firestore** → **Settings** → **App Check**
3. **Storage** → **Settings** → **App Check**

### Opción C: Verificar permisos
- Asegúrate de tener permisos de **Editor** o **Owner** en el proyecto

## 🎯 Configuración Exacta Requerida

### Para cada servicio, cambia:
```
ANTES:  [ENFORCE]     ❌
DESPUÉS: [UNENFORCED] ✅
```

### Servicios específicos:
1. **identitytoolkit.googleapis.com** → UNENFORCED
2. **firestore.googleapis.com** → UNENFORCED  
3. **storage.googleapis.com** → UNENFORCED

## 🚨 Importante: NO cambies reCAPTCHA SMS

**DEJA ESTO COMO ESTÁ:**
```
reCAPTCHA SMS defense: ENFORCE ✅ (Está bien así)
Puntuación de umbral: Bloquear algunos (0.5) ✅ (Está bien así)
```

## ⏱️ Después de Configurar

1. **Guarda los cambios**
2. **Espera 5-10 minutos** para propagación
3. **Prueba tu aplicación**
4. **Ejecuta**: `node scripts/test-auth-simple.js`

## 🆘 Si Sigues Sin Encontrarlo

### Método 1: Buscar por URL directa
Intenta estas URLs específicas:
- https://console.firebase.google.com/project/soygay-b9bc5/appcheck
- https://console.firebase.google.com/project/soygay-b9bc5/settings/appcheck/enforcement

### Método 2: Usar la búsqueda
1. En Firebase Console, usa **Ctrl+K** (o Cmd+K en Mac)
2. Busca: "app check enforcement"
3. Busca: "protected apis"

### Método 3: Verificar en Authentication
1. Ve a **Authentication** → **Settings**
2. Busca una sección de **App Check** o **Security**

## 📞 Confirmación Final

Una vez configurado, deberías ver:
```
✅ Firebase Authentication: UNENFORCED
✅ Cloud Firestore: UNENFORCED
✅ Cloud Storage: UNENFORCED
```

Y tu aplicación debería funcionar sin errores de App Check.

---

**💡 Tip**: Si la interfaz se ve diferente, busca cualquier mención de "enforcement", "protected", o "APIs" en la página de App Check.