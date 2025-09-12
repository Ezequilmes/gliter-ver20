# Configuración de GitHub Actions para Deploy Automático

## 🚀 Estado Actual

✅ **Pipeline configurado**: El archivo `.github/workflows/ci.yml` está listo
✅ **Código subido**: El proyecto está en GitHub en `https://github.com/Ezequilmes/Gliter.git`
✅ **Reglas de Firebase**: Archivos de producción creados

## 🔐 Secrets Requeridos en GitHub

Para que el deploy automático funcione, necesitas configurar estos secrets en GitHub:

### 1. Ir a GitHub Repository Settings
1. Ve a `https://github.com/Ezequilmes/Gliter/settings/secrets/actions`
2. Haz clic en "New repository secret"

### 2. Configurar Firebase Secrets

#### `FIREBASE_SERVICE_ACCOUNT_KEY`
```bash
# Generar la clave de servicio:
firebase projects:list
firebase use soygay-b9bc5

# En Firebase Console:
# 1. Ve a Project Settings > Service Accounts
# 2. Click "Generate new private key"
# 3. Copia todo el contenido JSON
```

#### Variables de entorno de Firebase:
- `VITE_FIREBASE_API_KEY`: Tu API key de Firebase
- `VITE_FIREBASE_AUTH_DOMAIN`: soygay-b9bc5.firebaseapp.com
- `VITE_FIREBASE_PROJECT_ID`: soygay-b9bc5
- `VITE_FIREBASE_STORAGE_BUCKET`: soygay-b9bc5.appspot.com
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Tu sender ID
- `VITE_FIREBASE_APP_ID`: Tu app ID

### 3. Configurar Secrets Opcionales

#### `SNYK_TOKEN` (Seguridad)
1. Ve a https://snyk.io/
2. Crea una cuenta gratuita
3. Ve a Account Settings > API Token
4. Copia el token

#### `SLACK_WEBHOOK_URL` (Notificaciones)
1. Configura un webhook en tu Slack workspace
2. Copia la URL del webhook

## 🔄 Flujo de Deploy Automático

### Branches y Environments:

#### `develop` branch → **Staging**
- Se ejecuta automáticamente al hacer push a `develop`
- Deploy a: `https://staging.gliter.com.ar`
- Incluye: Tests + Build + Deploy a staging

#### `master` branch → **Production**
- Se ejecuta automáticamente al hacer push a `master`
- Deploy a: `https://gliter.com.ar`
- Incluye: Tests + Security + Build + Deploy a producción

### Pipeline Completo:
1. **Test & Lint**: ESLint, tests unitarios, integración
2. **Security Scan**: Audit de dependencias, Snyk
3. **Build**: Compilación optimizada para producción
4. **E2E Tests**: Tests end-to-end con Playwright
5. **Deploy**: Firebase Hosting + Functions + Rules
6. **Smoke Tests**: Verificación post-deploy
7. **Notifications**: Slack notifications

## 🛠️ Comandos Útiles

### Para activar deploy a staging:
```bash
git checkout -b develop
git push origin develop
```

### Para activar deploy a producción:
```bash
git checkout master
git push origin master
```

### Para ver logs del pipeline:
```bash
# Ve a: https://github.com/Ezequilmes/Gliter/actions
```

## 📋 Checklist de Configuración

- [ ] Configurar `FIREBASE_SERVICE_ACCOUNT_KEY` en GitHub Secrets
- [ ] Configurar variables de entorno de Firebase
- [ ] Configurar `SNYK_TOKEN` (opcional)
- [ ] Configurar `SLACK_WEBHOOK_URL` (opcional)
- [ ] Crear branch `develop` para staging
- [ ] Verificar que el dominio `gliter.com.ar` esté configurado en Firebase
- [ ] Probar el pipeline con un push a `develop`

## 🚨 Troubleshooting

### Si el deploy falla:
1. Revisa los logs en GitHub Actions
2. Verifica que todos los secrets estén configurados
3. Asegúrate de que Firebase CLI tenga permisos
4. Revisa que las reglas de Firestore sean válidas

### Comandos de debug:
```bash
# Validar configuración local
npm run validate:prod

# Probar build local
npm run build:production

# Probar deploy manual
npm run deploy:production
```

## 🎯 Próximos Pasos

1. **Configurar secrets** en GitHub
2. **Crear branch develop** para staging
3. **Probar pipeline** con un commit pequeño
4. **Configurar dominio personalizado** si es necesario
5. **Configurar monitoreo** y alertas

---

**¡El pipeline está listo! Solo falta configurar los secrets para activar el deploy automático.**