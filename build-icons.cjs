const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'photo.png');
const outputDir = path.join(__dirname, 'public');

// Проверяем, существует ли исходное фото
if (!fs.existsSync(inputPath)) {
  console.error(`❌ Ошибка: файл ${inputPath} не найден!`);
  console.log('💡 Пожалуйста, сохраните фото как public/photo.jpg');
  process.exit(1);
}

console.log('🎨 Создаю иконки из фото...');

// Создаем иконки разных размеров
const sizes = [
  { size: 192, name: 'favicon-192.png' },
  { size: 512, name: 'favicon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

Promise.all(
  sizes.map(({ size, name }) =>
    sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .png()
      .toFile(path.join(outputDir, name))
      .then(() => console.log(`✅ Создана ${name} (${size}x${size})`))
  )
)
  .then(() => {
    console.log('\n🎉 Все иконки успешно созданы!');
    console.log('📍 Файлы сохранены в public/');
  })
  .catch((err) => {
    console.error('❌ Ошибка при создании иконок:', err);
    process.exit(1);
  });
