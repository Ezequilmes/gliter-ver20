# Configuración Manual en Firebase Console

## 🔧 Configurar App Check con reCAPTCHA

### Paso 1: Acceder a Firebase Console

✅ **URL abierta**: https://console.firebase.google.com/project/soygay-b9bc5/appcheck

### Paso 2: Configurar reCAPTCHA Provider

1. **En la página de App Check**:
   - Buscar la sección "reCAPTCHA"
   - Hacer clic en "Configure" o "Configurar"

2. **Ingresar Secret Key**:
   ```
   Secret Key: 6LdnbrorAAAAADzPaNdiAFtTfzHvDWI--Wp7T0Ph
   ```
   - Copiar y pegar exactamente como se muestra
   - Hacer clic en "Save" o "Guardar"

### Paso 3: Habilitar Enforcement

1. **Para Firestore**:
   - En la misma página de App Check
   - Buscar "Cloud Firestore"
   - Activar el toggle "Enforce App Check"

2. **Para otros servicios** (opcional):
   - Cloud Storage
   - Cloud Functions
   - Realtime Database

### Paso 4: Verificar Configuración

1. **Verificar que aparezca**:
   - ✅ reCAPTCHA configurado
   - ✅ Enforcement habilitado para Firestore

2. **Revisar métricas**:
   - Ir a la pestaña "Metrics"
   - Verificar que no hay errores

## 🔍 Verificación en Google reCAPTCHA Console

### Acceder a reCAPTCHA Console

**URL**: https://www.google.com/recaptcha/admin/site/6LdnbrorAAAAAK6ugsSqPMnPxhdnrpA0C69hVFw-

### Verificar Dominios Autorizados

Asegurarse de que estos dominios estén en la lista:
- `gliter.com.ar`
- `www.gliter.com.ar`
- `soygay-b9bc5.firebaseapp.com`
- `localhost` (para desarrollo)

### Verificar Configuración

1. **Tipo**: reCAPTCHA v3
2. **Score threshold**: 0.5 (recomendado)
3. **Dominios**: Los listados arriba

## ✅ Checklist de Verificación

- [ ] Secret key configurado en Firebase Console
- [ ] Enforcement habilitado para Firestore
- [ ] Dominios verificados en reCAPTCHA Console
- [ ] Métricas sin errores en Firebase
- [ ] Site key configurado en .env.production

## 🚀 Próximos Pasos

Después de completar la configuración manual:

1. Ejecutar deploy seguro:
   ```bash
   npm run deploy:safe
   ```

2. Verificar en producción:
   ```bash
   npm run verify:production
   ```

3. Monitorear métricas en Firebase Console

---

**Fecha**: $(date)
**Estado**: ⚠️ Configuración manual requerida
**Siguiente**: Deploy y verificación