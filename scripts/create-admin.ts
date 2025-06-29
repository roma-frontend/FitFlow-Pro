// scripts/create-admin.ts
import { ConvexHttpClient } from 'convex/browser';
import * as readline from 'readline';
import * as fs from 'fs';
import { createHash } from 'crypto';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  console.log('=== Создание администратора ===');
  
  const name = await question('Имя администратора: ');
  const email = await question('Email: ');
  const password = await question('Пароль: ');
  const photoPath = await question('Путь к фотографии (оставьте пустым для использования фото по умолчанию): ');
  
  // Хешируем пароль
  const hashedPassword = createHash('sha256').update(password).digest('hex');
  
  // Используем фото по умолчанию или загружаем указанное
  let photoUrl = '/images/default-admin.jpg';
  if (photoPath && fs.existsSync(photoPath)) {
    // Здесь должен быть код для загрузки фото
    console.log('Загрузка фото...');
    photoUrl = '/uploads/admin-photo.jpg'; // Заглушка
  }
  
  // Создаем фиктивный дескриптор лица (в реальном приложении должен быть получен из фото)
  const faceDescriptor = Array(128).fill(0).map(() => Math.random());
  
  try {
    const userId = await convex.mutation('users:createAdmin', {
      name,
      email,
      password: hashedPassword,
      photoUrl,
      faceDescriptor,
    });
    
    console.log(`Администратор успешно создан! ID: ${userId}`);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
  } finally {
    rl.close();
  }
}

function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
}

createAdmin();
