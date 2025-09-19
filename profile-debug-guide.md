# Guía de Diagnóstico - Problemas del Perfil

## 🔍 Problemas Identificados

### 1. El formulario no guarda los cambios
### 2. El botón de imagen no carga/sube imágenes
### 3. Los datos no persisten después de recargar

---

## 🛠️ Pasos de Diagnóstico

### Paso 1: Verificar Autenticación
```javascript
// Ejecutar en la consola del navegador
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ Usuario autenticado:', user.uid);
    console.log('Email:', user.email);
  } else {
    console.log('❌ Usuario NO autenticado');
  }
});
```

### Paso 2: Verificar Conexión a Firestore
```javascript
// Probar lectura de documento
const user = firebase.auth().currentUser;
if (user) {
  firebase.firestore().collection('users').doc(user.uid).get()
    .then(doc => {
      if (doc.exists) {
        console.log('✅ Documento encontrado:', doc.data());
      } else {
        console.log('⚠️ Documento no existe');
      }
    })
    .catch(error => {
      console.error('❌ Error Firestore:', error);
    });
}
```

### Paso 3: Verificar Permisos de Storage
```javascript
// Probar acceso a Storage
const user = firebase.auth().currentUser;
if (user) {
  const storageRef = firebase.storage().ref(`users/${user.uid}/profile/test.txt`);
  const testData = 'test';
  
  storageRef.putString(testData)
    .then(() => {
      console.log('✅ Storage funciona correctamente');
      return storageRef.delete(); // Limpiar archivo de prueba
    })
    .catch(error => {
      console.error('❌ Error Storage:', error);
    });
}
```

---

## 🔧 Soluciones Paso a Paso

### Solución 1: Problemas de Autenticación

**Si el usuario no está autenticado:**
1. Cerrar sesión completamente
2. Limpiar caché del navegador
3. Volver a iniciar sesión
4. Verificar que el token no haya expirado

```javascript
// Forzar renovación del token
firebase.auth().currentUser?.getIdToken(true)
  .then(token => console.log('✅ Token renovado'))
  .catch(error => console.error('❌ Error renovando token:', error));
```

### Solución 2: Problemas de Firestore

**Si Firestore no permite escritura:**
1. Verificar reglas de seguridad
2. Comprobar que el usuario tenga permisos
3. Verificar estructura de datos

```javascript
// Probar escritura manual
const user = firebase.auth().currentUser;
if (user) {
  firebase.firestore().collection('users').doc(user.uid).set({
    displayName: 'Test',
    updatedAt: new Date()
  }, { merge: true })
    .then(() => console.log('✅ Escritura exitosa'))
    .catch(error => console.error('❌ Error escritura:', error));
}
```

### Solución 3: Problemas de Storage

**Si Storage no permite subida:**
1. Verificar reglas de Storage
2. Comprobar tamaño y tipo de archivo
3. Verificar permisos de usuario

```javascript
// Verificar configuración de Storage
console.log('Storage config:', firebase.storage().app.options);
```

---

## 🚨 Errores Comunes y Soluciones

### Error: "Permission denied"
**Causa:** Reglas de seguridad muy restrictivas
**Solución:** Verificar y actualizar reglas de Firestore/Storage

### Error: "User not authenticated"
**Causa:** Token expirado o sesión inválida
**Solución:** Renovar token o volver a autenticar

### Error: "Network error"
**Causa:** Problemas de conectividad
**Solución:** Verificar conexión a internet y estado de Firebase

### Error: "Quota exceeded"
**Causa:** Límites de Firebase excedidos
**Solución:** Verificar uso en la consola de Firebase

---

## 📋 Checklist de Verificación

- [ ] Usuario autenticado correctamente
- [ ] Token de autenticación válido
- [ ] Reglas de Firestore permiten escritura
- [ ] Reglas de Storage permiten subida
- [ ] Formulario tiene event listeners correctos
- [ ] Datos se envían en formato correcto
- [ ] No hay errores en la consola
- [ ] Firebase está configurado correctamente

---

## 🔄 Pasos de Recuperación

### Si nada funciona:
1. **Limpiar completamente:**
   ```javascript
   // Limpiar localStorage
   localStorage.clear();
   // Limpiar sessionStorage
   sessionStorage.clear();
   // Recargar página
   window.location.reload();
   ```

2. **Verificar configuración de Firebase:**
   - Revisar `firebase.json`
   - Verificar reglas desplegadas
   - Comprobar configuración del proyecto

3. **Redesplegar todo:**
   ```bash
   firebase deploy
   ```

4. **Verificar en modo incógnito:**
   - Abrir navegador en modo incógnito
   - Probar funcionalidades
   - Si funciona, el problema es caché local

---

## 📞 Información de Contacto para Soporte

- **Proyecto Firebase:** soygay-b9bc5
- **URL de Hosting:** https://soygay-b9bc5.web.app
- **Consola Firebase:** https://console.firebase.google.com/project/soygay-b9bc5

---

## 📝 Notas Adicionales

- Siempre verificar la consola del navegador para errores
- Los cambios en reglas pueden tardar unos minutos en aplicarse
- Si persisten los problemas, verificar el estado de Firebase en https://status.firebase.google.com
- Considerar usar el emulador local para pruebas de desarrollo