# Claves de reCAPTCHA para App Check

## ⚠️ INFORMACIÓN CONFIDENCIAL

**IMPORTANTE**: Este archivo contiene claves sensibles. NO lo subas a repositorios públicos.

## Claves Obtenidas

### Site Key (Frontend)
```
6LdnbrorAAAAAK6ugsSqPMnPxhdnrpA0C69hVFw-
```
- **Uso**: Se incluye en el código frontend (ya configurado en `.env.production`)
- **Ubicación**: Variable `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Visibilidad**: Pública (se envía al navegador)

### Secret Key (Backend)
```
6LdnbrorAAAAADzPaNdiAFtTfzHvDWI--Wp7T0Ph
```
- **Uso**: Se configura en Firebase Console para App Check
- **Ubicación**: Firebase Console > App Check > reCAPTCHA
- **Visibilidad**: PRIVADA (solo en servidor)

## Configuración en Firebase Console

### Pasos para configurar el Secret Key:

1. **Ir a Firebase Console**:
   - URL: https://console.firebase.google.com/
   - Proyecto: `soygay-b9bc5`

2. **Navegar a App Check**:
   - Menú lateral > App Check
   - O directamente: https://console.firebase.google.com/project/soygay-b9bc5/appcheck

3. **Configurar reCAPTCHA**:
   - Buscar la sección "reCAPTCHA"
   - Hacer clic en "Configurar" o "Editar"
   - Ingresar el **Secret Key**: `6LdnbrorAAAAADzPaNdiAFtTfzHvDWI--Wp7T0Ph`
   - Guardar cambios

4. **Habilitar Enforcement**:
   - En la misma página de App Check
   - Activar "Enforce App Check" para Firestore
   - Activar para otros servicios si es necesario

## Dominios Autorizados

Estas claves están configuradas para los siguientes dominios:
- `gliter.com.ar`
- `www.gliter.com.ar`
- `soygay-b9bc5.firebaseapp.com`
- `localhost` (para desarrollo)

## Verificación

Después de configurar:

1. **Ejecutar verificación**:
   ```bash
   npm run setup:appcheck
   ```

2. **Deploy seguro**:
   ```bash
   npm run deploy:safe
   ```

3. **Verificar en producción**:
   - Abrir https://gliter.com.ar
   - Verificar que no hay errores de App Check en la consola del navegador
   - Probar funcionalidades (login, chat, etc.)

## Troubleshooting

### Si App Check falla:
1. Verificar que el Secret Key está configurado en Firebase Console
2. Verificar que los dominios están autorizados en Google reCAPTCHA Console
3. Verificar que las reglas de Firestore incluyen `hasValidAppCheck()`
4. Revisar logs en Firebase Console

### Logs útiles:
- Firebase Console > App Check > Métricas
- Browser DevTools > Console (errores de App Check)
- Firebase Console > Firestore > Uso (requests bloqueados)

---

**Fecha de configuración**: $(date)
**Configurado por**: Sistema automatizado
**Estado**: ✅ Site Key configurado en .env.production
**Pendiente**: ⚠️ Configurar Secret Key en Firebase Console