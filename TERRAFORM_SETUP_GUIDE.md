# 🚀 Guía de Instalación de Terraform para Windows

Esta guía te ayudará a instalar Terraform en Windows para configurar App Check automáticamente.

## 📋 Opciones de Instalación

### Opción 1: Chocolatey (Recomendado)

1. **Instalar Chocolatey** (si no lo tienes):
   ```powershell
   # Ejecuta como Administrador
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Instalar Terraform**:
   ```powershell
   choco install terraform
   ```

3. **Verificar instalación**:
   ```powershell
   terraform version
   ```

### Opción 2: Descarga Manual

1. **Descargar Terraform**:
   - Ve a: https://www.terraform.io/downloads
   - Descarga la versión para Windows (AMD64)

2. **Extraer y configurar**:
   ```powershell
   # Crear directorio
   mkdir C:\terraform
   
   # Extraer terraform.exe a C:\terraform
   # Agregar C:\terraform al PATH del sistema
   ```

3. **Agregar al PATH**:
   - Abre "Variables de entorno del sistema"
   - Edita la variable PATH
   - Agrega: `C:\terraform`
   - Reinicia PowerShell

### Opción 3: Winget (Windows 11)

```powershell
winget install HashiCorp.Terraform
```

## 🔧 Configuración Posterior

Después de instalar Terraform:

1. **Ejecutar configuración automática**:
   ```bash
   node scripts/setup-terraform-appcheck.js
   ```

2. **Aplicar configuración**:
   ```bash
   cd terraform
   terraform apply
   ```

## 🎯 Alternativa Sin Terraform

Si prefieres no instalar Terraform, puedes:

1. **Configurar manualmente en Firebase Console**:
   ```bash
   node scripts/firebase-console-navigator.js
   ```

2. **Usar la configuración manual**:
   - Sigue las instrucciones en `CONFIGURACION_FINAL_FIREBASE.md`
   - Ve a Firebase Console y configura App Check como UNENFORCED

## 🚨 Solución de Problemas

### Error: "terraform no se reconoce como comando"
- Reinicia PowerShell después de la instalación
- Verifica que Terraform esté en el PATH
- Ejecuta: `$env:PATH -split ';'` para ver las rutas

### Error de permisos
- Ejecuta PowerShell como Administrador
- Configura la política de ejecución: `Set-ExecutionPolicy RemoteSigned`

## 📊 Verificación

Para verificar que todo funciona:

```powershell
# Verificar Terraform
terraform version

# Verificar configuración
node scripts/setup-terraform-appcheck.js

# Probar autenticación
node scripts/test-after-enforcement.js
```

## 🔗 Enlaces Útiles

- [Terraform Downloads](https://www.terraform.io/downloads)
- [Chocolatey Install](https://chocolatey.org/install)
- [Firebase Console](https://console.firebase.google.com/project/soygay-b9bc5/appcheck)
- [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=soygay-b9bc5)