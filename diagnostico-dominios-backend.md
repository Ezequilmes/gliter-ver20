# 🔍 Diagnóstico: Problemas con Backend web-prod y Dominios

## 🚨 Problema Identificado

**Backend:** `web-prod`  
**Estado:** Dominios personalizados desconectados
- ❌ `gliter.com.ar` - Desconectado
- ❌ `www.gliter.com.ar` - Desconectado
- ✅ `web-prod--soygay-b9bc5.us-central1.hosted.app` - Conectado (predeterminado)

## 🔍 Análisis de la Configuración Actual

### Firebase App Hosting
- **Backend ID:** `web-prod`
- **Repositorio:** `Ezequilmes-gliter-ver20`
- **URL Activa:** `https://web-prod--soygay-b9bc5.us-central1.hosted.app`
- **Región:** `us-central1`
- **Última actualización:** 2025-09-17 03:04:28

### Configuración de Sitios Firebase
- **Sitio principal:** `soygay-b9bc5`
- **URL Firebase:** `https://soygay-b9bc5.web.app`
- **Estado:** Solo sitio predeterminado configurado

### Configuración Local (.firebaserc)
```json
{
  "targets": {
    "soygay-b9bc5": {
      "hosting": {
        "gliter-app": ["soygay-b9bc5"],
        "main": ["soygay-b9bc5"]
      }
    }
  }
}
```

## 🎯 Causa del Problema

**Los dominios personalizados `gliter.com.ar` y `www.gliter.com.ar` NO están configurados en Firebase Hosting actual.**

### Evidencia:
1. ✅ `firebase hosting:sites:list` muestra solo el sitio predeterminado
2. ❌ No hay dominios personalizados configurados en Firebase Console
3. ⚠️ App Hosting (web-prod) y Firebase Hosting son servicios diferentes
4. 🔍 Los scripts encontrados indican configuración previa pero no activa

## 🛠️ Soluciones Propuestas

### Opción 1: Configurar Dominios en Firebase Hosting (Recomendado)

#### Paso 1: Agregar Dominios Personalizados
```bash
# Verificar sitios actuales
firebase hosting:sites:list

# Agregar dominio personalizado en Firebase Console
# https://console.firebase.google.com/project/soygay-b9bc5/hosting/main
```

#### Paso 2: Configuración DNS
**En tu proveedor de DNS (donde compraste gliter.com.ar):**
```
# Registros A para gliter.com.ar
gliter.com.ar.     A     151.101.1.195
gliter.com.ar.     A     151.101.65.195

# Registro CNAME para www
www.gliter.com.ar. CNAME gliter.com.ar.
```

#### Paso 3: Verificación
1. Ir a Firebase Console > Hosting > Dominios
2. Agregar `gliter.com.ar`
3. Seguir instrucciones de verificación DNS
4. Agregar `www.gliter.com.ar` como redirección

### Opción 2: Usar App Hosting con Dominios Personalizados

#### Configurar dominios en App Hosting:
```bash
# Verificar configuración actual
firebase apphosting:backends:get web-prod

# Configurar dominios personalizados para App Hosting
# (Requiere configuración en Firebase Console)
```

## 🔧 Pasos Inmediatos de Solución

### 1. Verificar Estado Actual
```bash
# Ejecutar diagnóstico completo
node scripts/manage-custom-domains.js

# Verificar configuración DNS actual
nslookup gliter.com.ar
nslookup www.gliter.com.ar
```

### 2. Configurar Dominios en Firebase Console
1. **Abrir Firebase Console:**
   https://console.firebase.google.com/project/soygay-b9bc5/hosting/main

2. **Agregar Dominio Personalizado:**
   - Clic en "Agregar dominio personalizado"
   - Ingresar: `gliter.com.ar`
   - Seguir instrucciones de verificación

3. **Configurar Redirección WWW:**
   - Agregar `www.gliter.com.ar`
   - Configurar redirección a `gliter.com.ar`

### 3. Actualizar Configuración DNS
**Contactar al proveedor de dominio para configurar:**
```
# Eliminar registros existentes conflictivos
# Agregar nuevos registros según instrucciones de Firebase
```

### 4. Verificar Propagación
```bash
# Verificar propagación DNS (puede tomar hasta 24 horas)
dig gliter.com.ar
dig www.gliter.com.ar

# Probar conectividad
curl -I https://gliter.com.ar
curl -I https://www.gliter.com.ar
```

## ⚠️ Consideraciones Importantes

### Diferencias entre Servicios:
- **Firebase Hosting:** Hosting estático tradicional
- **App Hosting:** Hosting para aplicaciones full-stack (backend web-prod)
- **Dominios:** Pueden configurarse en ambos servicios

### Recomendación:
**Usar Firebase Hosting para dominios personalizados** ya que:
- ✅ Más simple de configurar
- ✅ Mejor integración con dominios personalizados
- ✅ Certificados SSL automáticos
- ✅ CDN global incluido

## 📋 Checklist de Verificación

- [ ] Verificar que gliter.com.ar esté disponible para configuración
- [ ] Acceder a configuración DNS del dominio
- [ ] Configurar dominios en Firebase Console
- [ ] Actualizar registros DNS según instrucciones de Firebase
- [ ] Esperar propagación DNS (24-48 horas)
- [ ] Verificar certificados SSL automáticos
- [ ] Probar acceso desde ambos dominios
- [ ] Configurar redirección www → no-www (o viceversa)

## 🔗 Enlaces Útiles

- **Firebase Console - Hosting:** https://console.firebase.google.com/project/soygay-b9bc5/hosting/main
- **Firebase Console - App Hosting:** https://console.firebase.google.com/project/soygay-b9bc5/apphosting
- **Documentación Firebase Hosting:** https://firebase.google.com/docs/hosting/custom-domain

---

**Estado:** 🔍 Diagnóstico completado  
**Próximo paso:** Configurar dominios personalizados en Firebase Console  
**Tiempo estimado:** 24-48 horas (incluyendo propagación DNS)