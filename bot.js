const { Telegraf, Markup } = require('telegraf');
const http = require('http'); // Для health check на Koyeb

// API-токен бота
const BOT_TOKEN = '7646237377:AAH30i_qcrd0ILAD5mJUvXYWjg_w0FLU8Uo';
const bot = new Telegraf(BOT_TOKEN);

// HTTP-сервер для health check
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(8000, () => console.log('🔧 HTTP-сервер запущен на порту 8000...'));

// Хранилище данных
const state = {
  sentMessages: [], // Русские комплименты
  sentArmenianMessages: [], // Армянские комплименты
  surpriseHistory: [], // Сюрпризы
};

// Русские комплименты
const russianCompliments = [
  'Валерия Джан, твоя улыбка — мой свет в армии! 😊',
  'Моя любовь, ты — причина моего возвращения! ❤️',
  'Валерия, ты — звезда над Ереваном! 🌟',
  'Родная, твоя сила делает меня непобедимым! 💪',
  'Валерия Джан, ты — моя мечта в погонах! ✨',
  'Королева, наша любовь сильнее времени! 👑',
  'Валерия, ты — мой закат, такой же нежный! 🌅',
  'Любимая, каждая минута службы — ради тебя! 💖',
  'Валерия Джан, моё сердце в Ереване — твоё! 💞',
  'Моя душа, ты — мой талисман в армии! 😘'
];

// Армянские комплименты
const armenianCompliments = [
  'Վալերի Ջան, քո ժպիտը իմ լույսն է բանակում։ 😊',
  'Իմ սեր, դու ամեն օր դարձնում ես հեքիաթ։ ❤️',
  'Վալերի, դու Երևանի աստղն ես։ 🌟',
  'Հարազատս, քո ուժն իմ զորությունն է։ 💪',
  'Վալերի Ջան, դու երազանքս ես։ ✨'
];

// Сюрпризы от Рома
const surprises = [
  '🎉 Гуляем по Каскаду после службы, Джан! 🌆',
  '💌 Напиши мне, я читаю твои слова в сердце! 😘',
  '🌅 Закат для тебя — подумай обо мне! 📸',
  '🍷 Ужин при свечах? Я уже с тобой в мечтах! 🕯️',
  '🎶 Наша песня — мой гимн в армии! 🎵',
  '🌹 Желание под звёздами — для тебя! ✨',
  '💕 Свидание после службы — готовься! 😊',
  '🖼️ Нарисуй нашу любовь — я сохраню! ✍️',
  '🍫 Вкусняшка от Рома — побалуй себя! 😋',
  '💞 Мои объятия уже летят к тебе! 🤗'
];

// Случайные эмодзи
const randomEmojis = ['❤️', '💖', '🌟', '😘', '🌹', '💪', '😊', '✨', '💞', '🔥'];

// Прогресс-бар эмодзи
const progressEmojis = ['🟥', '🟦', '🟨', '🟩'];

// ASCII-арт
const getAsciiArt = (isNight) => {
  return isNight
    ? `
🌌 *Ночь Еревана* 🌌
  🌙   💖   🌙
   ✨ *Рома* ✨
   💞 Валерия 💞
🌌 *Любовь* 🌌
`
    : `
☀️ *День Еревана* ☀️
  🌞   ❤️   🌞
   🔥 *Рома* 🔥
   💞 Валерия 💞
☀️ *Любовь* ☀️
`;
};

// Функция подсчёта службы (Ереван, UTC+4)
function getService() {
  const yerevanOffset = 4 * 60 * 60 * 1000; // UTC+4
  const startDate = new Date('2025-06-09T00:00:00Z'); // 9 июня 2025
  const endDate = new Date('2026-06-09T23:59:59Z'); // 9 июня 2026
  const currentDate = new Date(Date.now() + yerevanOffset);

  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerHour = 60 * 60 * 1000;

  const msPassed = currentDate - startDate;
  const msLeft = endDate - currentDate;
  const msTotal = endDate - startDate;

  const daysPassed = Math.max(0, Math.floor(msPassed / msPerDay));
  const hoursPassed = Math.floor((msPassed % msPerDay) / msPerHour);

  const daysLeft = Math.floor(msLeft / msPerDay);
  const hoursLeft = Math.floor((msLeft % msPerDay) / msPerHour);

  const totalDays = Math.ceil(msTotal / msPerDay); // 365 дней
  const progressPercent = daysPassed >= 0 ? ((daysPassed / totalDays) * 100).toFixed(2) : 0;

  // Прогресс-бар
  const barLength = 15;
  const filled = Math.round((progressPercent / 100) * barLength);
  const progressEmoji = progressEmojis[Math.floor(Math.random() * progressEmojis.length)];
  const progressBar = progressEmoji.repeat(filled) + '⬜'.repeat(barLength - filled);

  // ASCII-арт
  const hours = currentDate.getHours();
  const isNight = hours >= 18 || hours < 6;

  // Комплимент
  let compliment;
  do {
    compliment = russianCompliments[Math.floor(Math.random() * russianCompliments.length)];
  } while (state.sentMessages.includes(compliment) && state.sentMessages.length < russianCompliments.length);
  state.sentMessages.push(compliment);
  if (state.sentMessages.length >= russianCompliments.length) state.sentMessages.shift();

  // Одно объявление emoji
  const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];

  if (currentDate < startDate) {
    const daysToStart = Math.ceil((startDate - currentDate) / msPerDay);
    const hoursToStart = Math.floor(((startDate - currentDate) % msPerDay) / msPerHour);
    return `${getAsciiArt(isNight)}
┳━━━━━━━┳
┃ <b>ЖДЁМ РОМУ</b> ┃
┻━━━━━━━┻
🪖 <b>До службы:</b> ${daysToStart} дн., ${hoursToStart} ч.
📅 <b>Начало:</b> 9 июня 2025
💌 <b>Рома:</b> ${compliment} ${emoji}`;
  } else if (currentDate > endDate) {
    return `${getAsciiArt(isNight)}
┳━━━━━━━┳
┃ <b>РОМА ДОМА!</b> ┃
┻━━━━━━━┻
🎉 Валерия Джан, служба кончилась! 🪖
🔥 Рома ждёт тебя! 😘 ${emoji}
💞 Любовь победила!`;
  } else {
    return `${getAsciiArt(isNight)}
┳━━━━━━━┳
┃ <b>РОМА СЛУЖИТ</b> ┃
┻━━━━━━━┻
🪖 <b>Служба:</b> ${daysPassed} дн., ${hoursPassed} ч.
📅 <b>Осталось:</b> ${daysLeft} дн., ${hoursLeft} ч.
🌟 <b>Всего:</b> ${totalDays} дн.
🔥 <b>Прогресс:</b> ${progressPercent}% 
${progressBar}
💌 <b>Рома:</b> ${compliment} ${emoji}`;
  }
}

// Клавиатура
const keyboard = Markup.keyboard([
  ['🪖 Служба Рома', '🎁 Сюрприз'],
  ['🇦🇴 Հայերեն']
]).resize();

// Команда /start
bot.command('start', (ctx) => {
  try {
    console.log(`Чат ID: ${ctx.chat.id}`);
    ctx.reply(
      `${getAsciiArt(false)}
┳━━━━━━━┳
┃ <b>ВАЛЕРИЯ ДЖАН!</b> ┃
┻━━━━━━━┻
😘 Я @RomaARMY, бот от Рома! 🪖
💕 Он думает о тебе каждую секунду!
🔥 Выбери ниже 👇`,
      { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
    );
  } catch (e) {
    console.error(`Ошибка /start: ${e.message}`);
  }
});

// Команда /menu
bot.command('menu', (ctx) => {
  try {
    ctx.reply(
      `┳━━━━━━━┳
┃ <b>ВАЛЕРИЯ ДЖАН!</b> ┃
┻━━━━━━━┻
😊 Что хочешь? 👇`,
      { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
    );
  } catch (e) {
    console.error(`Ошибка /menu: ${e.message}`);
  }
});

// Обработка текстовых сообщений
bot.on('text', (ctx) => {
  try {
    const text = ctx.message.text;

    switch (text) {
      case '🪖 Служба Рома':
        ctx.reply(
          getService(),
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Прогресс службы отправлен');
        break;
      case '🎁 Сюрприз':
        let surprise;
        do {
          surprise = surprises[Math.floor(Math.random() * surprises.length)];
        } while (state.surpriseHistory.includes(surprise) && state.surpriseHistory.length < surprises.length);
        state.surpriseHistory.push(surprise);
        if (state.surpriseHistory.length >= surprises.length) state.surpriseHistory.shift();
        const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
        ctx.reply(
          `┳━━━━━━━┳
┃ <b>СЮРПРИЗ!</b> ┃
┻━━━━━━━┻
🎁 Валерия Джан, держи! \n${surprise} ${emoji}`,
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Сюрприз отправлен');
        break;
      case '🇦🇴 Հայերեն':
        let armenianCompliment;
        do {
          armenianCompliment = armenianCompliments[Math.floor(Math.random() * armenianCompliments.length)];
        } while (state.sentArmenianMessages.includes(armenianCompliment) && state.sentArmenianMessages.length < armenianCompliments.length);
        state.sentArmenianMessages.push(armenianCompliment);
        if (state.sentArmenianMessages.length >= armenianCompliments.length) state.sentArmenianMessages.shift();
        const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
        ctx.reply(
          `┳━━━━━━━┳
┃ <b>ՀԱՅԵՐԵՆ!</b> ┃
┻━━━━━━━┻
💞 Վալերի Ջան, սիրով! \n${armenianCompliment} ${emoji}`,
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Армянское сообщение отправлено');
        break;
      default:
        ctx.reply(
          `┳━━━━━━━┳
┃ <b>ВАЛЕРИЯ ДЖАН!</b> ┃
┻━━━━━━━┻
😅 Жми кнопки! ❤️`,
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Неверная команда');
        break;
    }
  } catch (e) {
    console.error(`Ошибка обработки: ${e.message}`);
    ctx.reply(
      `┳━━━━━━━┳
┃ <b>ОЙ, ДЖАН!</b> ┃
┻━━━━━━━┻
😔 Что-то сломалось! Попробуй ещё. ❤️`,
      { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
    );
  }
});

// Запуск бота
console.log('🚀 @RomaARMY для Валерии запущен...');
bot.launch({
  dropPendingUpdates: true
}).then(() => {
  console.log('🔥 Программа запущена...');
}).catch((e) => {
  console.error(`Ошибка запуска: ${e.message}`);
  if (e.response && e.response.error_code === 401) {
    console.error('Ошибка 401: Проверь токен в @BotFather.');
  }
  process.exit(1);
});

// Обработка остановки
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log('🛑 Остановка бота...');
    try {
      bot.stop(signal);
      server.close(() => console.log('🔧 HTTP-сервер остановлен'));
      console.log('✅ Бот остановлен');
    } catch (err) {
      console.error(`Ошибка при остановке: ${err.message}`);
    }
    process.exit(0);
  });
});
