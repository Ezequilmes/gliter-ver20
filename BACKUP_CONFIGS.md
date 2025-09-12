# Backup de Configuraciones Esenciales

## Archivos a Preservar:

### Firebase Configuration
- `.firebaserc` - Configuración de proyectos Firebase
- `firebase.json` - Configuración de hosting, functions, rules
- `firestore.rules` - Reglas de desarrollo
- `firestore.rules.production` - Reglas de producción
- `storage.rules` - Reglas de Storage desarrollo
- `storage.rules.production` - Reglas de Storage producción
- `firestore.indexes.json` - Índices de Firestore
- `database.rules.json` - Reglas de Realtime Database

### GitHub Actions
- `.github/workflows/ci.yml` - Pipeline de CI/CD
- `GITHUB_ACTIONS_SETUP.md` - Guía de configuración

### Git Configuration
- `.gitignore` - Archivos a ignorar
- `.husky/` - Git hooks
- `.lintstagedrc.js` - Configuración de lint staged

### Build Tools
- `vite.config.js` - Configuración de Vite
- `tsconfig.json` - Configuración de TypeScript
- `tsconfig.node.json` - TypeScript para Node
- `playwright.config.js` - Configuración de tests E2E
- `vitest.config.js` - Configuración de tests unitarios
- `.eslintrc.cjs` - Configuración de ESLint

### Package Management
- `package.json` (solo scripts y dependencias básicas)

## Archivos a Eliminar:

### Source Code
- `src/` - Todo el código fuente
- `public/` - Assets públicos (excepto manifest básico)
- `functions/src/` - Código de Cloud Functions

### Build Artifacts
- `node_modules/`
- `dist/`
- `build/`
- `.firebase/`
- `playwright-report/`
- `test-results/`

### Logs y Temporales
- `*.log`
- `response.json`
- `users.json`
- `*.html` (archivos de debug)

### Tests y Scripts
- `e2e/`
- `tests/`
- `scripts/` (excepto deploy básico)
- `*.spec.js`
- `test-*.js`

### Documentation
- `docs/`
- `*.md` (excepto este backup y setup)

### APK Analysis
- `grinder viejo/`
- `grinder-analysis/`
