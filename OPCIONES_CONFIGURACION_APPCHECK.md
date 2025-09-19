# 🛡️ Opciones para Configurar Firebase App Check

Este documento presenta **3 métodos diferentes** para configurar App Check como UNENFORCED y resolver el error `auth/firebase-app-check-token-is-invalid`.

## 📊 Resumen de Opciones

| Método | Dificultad | Tiempo | Automatización | Recomendado |
|--------|------------|--------|----------------|-------------|
| **🔧 Terraform (IaC)** | Media | 15-30 min | ✅ Total | ⭐⭐⭐⭐⭐ |
| **⚡ gcloud CLI** | Fácil | 5-10 min | ✅ Parcial | ⭐⭐⭐⭐ |
| **🖱️ Firebase Console** | Muy Fácil | 2-5 min | ❌ Manual | ⭐⭐⭐ |

---

## 🔧 Opción 1: Terraform (Infrastructure as Code)

### ✅ Ventajas
- **Reproducible**: Se puede aplicar en múltiples entornos
- **Versionado**: Los cambios se rastrean en Git
- **Automatizado**: No requiere intervención manual
- **Profesional**: Estándar de la industria

### 📋 Pasos

1. **Instalar Terraform**:
   ```powershell
   # Opción 1: Chocolatey
   choco install terraform
   
   # Opción 2: Manual desde https://www.terraform.io/downloads
   ```

2. **Configurar cuenta de servicio**:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=soygay-b9bc5)
   - Crea cuenta de servicio con roles: Firebase Admin, Project Editor
   - Descarga clave JSON como `service-account-key.json`

3. **Ejecutar configuración**:
   ```bash
   node scripts/setup-terraform-appcheck.js
   cd terraform
   terraform apply
   ```

### 📁 Archivos Creados
- `terraform/main.tf` - Configuración principal
- `terraform/variables.tf` - Variables
- `terraform/outputs.tf` - Salidas
- `terraform/README.md` - Documentación
- `TERRAFORM_SETUP_GUIDE.md` - Guía de instalación

---

## ⚡ Opción 2: gcloud CLI

### ✅ Ventajas
- **Rápido**: Configuración en minutos
- **Directo**: Comandos simples de Google Cloud
- **Flexible**: Se puede automatizar o ejecutar manualmente

### 📋 Pasos

1. **Instalar gcloud CLI**:
   - Descarga desde: https://cloud.google.com/sdk/docs/install

2. **Autenticarse**:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

3. **Ejecutar configuración**:
   ```bash
   # Automático
   node scripts/gcloud-appcheck-setup.js --execute
   
   # Manual (ver comandos)
   node scripts/gcloud-appcheck-setup.js
   
   # Crear script batch
   node scripts/gcloud-appcheck-setup.js --batch
   ```

### 📁 Archivos Creados
- `scripts/gcloud-appcheck-setup.js` - Script de configuración
- `setup-appcheck.bat` - Script batch para Windows

---

## 🖱️ Opción 3: Firebase Console (Manual)

### ✅ Ventajas
- **Simple**: No requiere instalaciones adicionales
- **Visual**: Interfaz gráfica intuitiva
- **Inmediato**: Cambios aplicados al instante

### 📋 Pasos

1. **Abrir Firebase Console**:
   ```bash
   node scripts/firebase-console-navigator.js
   ```

2. **Seguir guía paso a paso**:
   - Lee: `firebase-console-step-by-step.md`
   - Ve a: https://console.firebase.google.com/project/soygay-b9bc5/appcheck

3. **Configurar servicios como UNENFORCED**:
   - Firebase Authentication
   - Cloud Firestore
   - Cloud Storage
   - Realtime Database

### 📁 Archivos de Referencia
- `firebase-console-step-by-step.md` - Guía detallada
- `scripts/firebase-console-navigator.js` - Enlaces directos
- `CONFIGURACION_FINAL_FIREBASE.md` - Resumen completo

---

## 🎯 Recomendación por Escenario

### 👨‍💻 Para Desarrolladores
**Usa Terraform** si:
- Trabajas en equipo
- Quieres automatización completa
- Planeas múltiples entornos (dev/staging/prod)
- Te gusta Infrastructure as Code

### ⚡ Para Configuración Rápida
**Usa gcloud CLI** si:
- Necesitas una solución rápida
- Ya tienes gcloud instalado
- Quieres comandos simples
- Prefieres línea de comandos

### 🖱️ Para Principiantes
**Usa Firebase Console** si:
- Prefieres interfaces gráficas
- Es tu primera vez con App Check
- Quieres ver los cambios visualmente
- No quieres instalar herramientas adicionales

---

## 🔍 Verificación (Todas las Opciones)

Después de cualquier configuración:

1. **Probar autenticación**:
   ```bash
   node scripts/test-after-enforcement.js
   ```

2. **Verificar en consola**:
   - [Firebase Console - App Check](https://console.firebase.google.com/project/soygay-b9bc5/appcheck)

3. **Verificar aplicación**:
   ```bash
   npm run dev
   # Abrir http://localhost:3000
   # Probar registro/login
   ```

---

## 🚨 Solución de Problemas

### Error Común: `auth/firebase-app-check-token-is-invalid`

**Causa**: App Check está en modo ENFORCED en Firebase Console

**Solución**: Usar cualquiera de los 3 métodos arriba para configurar como UNENFORCED

### Verificar Estado Actual
```bash
node scripts/check-appcheck-status.js
```

### Tiempo de Propagación
- **Terraform/gcloud**: 5-10 minutos
- **Firebase Console**: 2-5 minutos

---

## 📋 Estado Actual del Proyecto

✅ **Configuraciones Locales Correctas**:
- `.env.local` - Variables de entorno actualizadas
- `src/lib/firebase.ts` - Configuración con databaseURL
- App Check deshabilitado en código (desarrollo)

❌ **Pendiente**:
- Configurar App Check como UNENFORCED en Firebase Console

🎯 **Objetivo**:
- Resolver error `auth/firebase-app-check-token-is-invalid`
- Permitir autenticación sin App Check en desarrollo

---

## 🔗 Enlaces Útiles

- [Firebase Console - App Check](https://console.firebase.google.com/project/soygay-b9bc5/appcheck)
- [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=soygay-b9bc5)
- [Terraform Downloads](https://www.terraform.io/downloads)
- [gcloud CLI Install](https://cloud.google.com/sdk/docs/install)
- [Firebase App Check Docs](https://firebase.google.com/docs/app-check)

---

## 🚀 Próximos Pasos

1. **Elige tu método preferido** (Terraform, gcloud, o Console)
2. **Sigue la guía correspondiente**
3. **Verifica la configuración**
4. **Prueba la autenticación**
5. **¡Disfruta tu aplicación funcionando!** 🎉