// Script de prueba para verificar la funcionalidad de subida de fotos
import { uploadUserPhoto, validateImageFile } from './uploadUserPhoto';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Función para crear un archivo de prueba
function createTestImageFile(): File {
  // Crear un canvas pequeño para generar una imagen de prueba
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Dibujar un rectángulo de color para la prueba
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText('TEST', 30, 55);
  }
  
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'test-image.png', { type: 'image/png' });
        resolve(file);
      }
    }, 'image/png');
  }) as any;
}

// Función principal de prueba
export async function testPhotoUploadFunctionality() {
  console.log('🧪 Iniciando pruebas de subida de fotos...');
  
  try {
    // Verificar autenticación
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Usuario no autenticado');
      return {
        success: false,
        error: 'Usuario no autenticado',
        details: 'Debes iniciar sesión antes de probar la subida de fotos'
      };
    }
    
    console.log('✅ Usuario autenticado:', user.email);
    
    // Crear archivo de prueba
    console.log('📁 Creando archivo de prueba...');
    const testFile = await createTestImageFile();
    console.log('✅ Archivo de prueba creado:', {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type
    });
    
    // Validar archivo
    console.log('🔍 Validando archivo...');
    const validation = validateImageFile(testFile, 5);
    if (!validation.isValid) {
      console.error('❌ Validación falló:', validation.error);
      return {
        success: false,
        error: 'Validación de archivo falló',
        details: validation.error
      };
    }
    console.log('✅ Archivo válido');
    
    // Probar subida de foto de perfil
    console.log('📤 Probando subida de foto de perfil...');
    try {
      const profileUrl = await uploadUserPhoto(testFile, user, 'profile');
      console.log('✅ Foto de perfil subida exitosamente:', profileUrl);
    } catch (error) {
      console.error('❌ Error en subida de foto de perfil:', error);
      return {
        success: false,
        error: 'Error en subida de foto de perfil',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
    
    // Probar subida de foto de galería
    console.log('📤 Probando subida de foto de galería...');
    try {
      const galleryUrl = await uploadUserPhoto(testFile, user, 'gallery');
      console.log('✅ Foto de galería subida exitosamente:', galleryUrl);
    } catch (error) {
      console.error('❌ Error en subida de foto de galería:', error);
      return {
        success: false,
        error: 'Error en subida de foto de galería',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
    
    console.log('🎉 Todas las pruebas completadas exitosamente');
    return {
      success: true,
      message: 'Todas las funciones de subida funcionan correctamente'
    };
    
  } catch (error) {
    console.error('💥 Error crítico en las pruebas:', error);
    return {
      success: false,
      error: 'Error crítico en las pruebas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Función para probar en el navegador
export function runPhotoUploadTests() {
  // Esperar a que el usuario esté autenticado
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('🔐 Usuario detectado, ejecutando pruebas...');
      const result = await testPhotoUploadFunctionality();
      console.log('📊 Resultado de las pruebas:', result);
    } else {
      console.log('⏳ Esperando autenticación del usuario...');
    }
  });
}

// Función para verificar configuración de Firebase
export function checkFirebaseConfig() {
  console.log('🔧 Verificando configuración de Firebase...');
  
  try {
    const config = {
      hasAuth: !!auth,
      currentUser: auth.currentUser?.email || 'No autenticado',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'No configurado'
    };
    
    console.log('📋 Configuración de Firebase:', config);
    return config;
  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
    return null;
  }
}

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).testPhotoUpload = {
    runTests: runPhotoUploadTests,
    checkConfig: checkFirebaseConfig,
    testFunctionality: testPhotoUploadFunctionality
  };
  
  console.log('🛠️ Funciones de prueba disponibles en window.testPhotoUpload');
  console.log('   - runTests(): Ejecutar todas las pruebas');
  console.log('   - checkConfig(): Verificar configuración de Firebase');
  console.log('   - testFunctionality(): Probar funcionalidad de subida');
}