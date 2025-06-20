// scripts/create-super-admin.ts (новый файл)
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function createSuperAdmin() {
  try {
    const email = "romangulanyan@gmail.com";
    const password = "Hovik-970";
    const name = "Роман Гуланян";

    // Проверяем, существует ли уже админ
    const existingAdmin = await convex.query("users:getByEmail", { email });
    if (existingAdmin) {
      console.log('Супер-админ уже существует');
      return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем супер-админа
    const userId = await convex.mutation("users:create", {
      email,
      password: hashedPassword,
      name,
      role: 'super-admin',
      isActive: true,
      createdAt: Date.now()
    });

    console.log('Супер-админ создан успешно:', userId);
  } catch (error) {
    console.error('Ошибка создания супер-админа:', error);
  }
}

createSuperAdmin();
