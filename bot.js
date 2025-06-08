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
  'Валерия Джан, твоя улыбка — мой маяк в армии! 😊',
  'Моя любовь, ты — причина, почему я спешу домой! ❤️',
  'Валерия, ты — звезда Еревана, сияешь ярче всех! 🌟',
  'Родная, твоя поддержка — мой бронежилет! 💪',
  'Валерия Джан, ты — мечта, ради которой я служу! ✨',
  'Королева моя, наша любовь сильнее любой разлуки! 👑',
  'Валерия, ты — мой закат в Ереване, такой же красивый! 🌅',
  'Любимая, каждая секунда в армии — ради тебя! 💖',
  'Валерия Джан, моё сердце бьётся в ритме твоего имени! 💞',
  'Моя душа, ты делаешь службу легче своими мыслями! 😘'
];

// Армянские комплименты
const armenianCompliments = [
  'Վալերի Ջան, քո ժպիտը բանակում իմ լույսն է։ 😊',
  'Իմ սեր, դու ամեն օր դարձնում ես անմոռանալի։ ❤️',
  'Վալերի, դու Երևանի ամենապայծառ աստղն ես։ 🌟',
  'Հարազատս, քո աջակցությունը իմ զորությունն է։ 💪',
  'Վալերի Ջան, դու երազանքս ես, որի համար ծառայում եմ։ ✨'
];

// Сюрпризы от Рома
const surprises = [
  '🎉 После службы гуляем по Каскаду, Джан! Готовься! 🌆',
  '💌 Напиши мне письмо, я прочту его под звёздами! 😘',
  '🌅 Сфоткай закат и подумай обо мне, моя любовь! 📸',
  '🍷 Виртуальный ужин? Свечи, вино и я в мыслях! 🕯️',
  '🎶 Включи нашу песню — я пою её в сердце! 🎵',
  '🌹 Загадай желание под звёздами — я его исполню! ✨',
  '💕 Планируй наше свидание — я уже в предвкушении! 😊',
  '🖼️ Нарисуй нам мечту — я сохраню её в сердце! ✍️',
  '🍫 Вкусняшка от Рома — побалуй себя, Джан! 😋',
  '💞 Закрой глаза и почувствуй мои объятия! 🤗'
];

// Случайные эмодзи
const randomEmojis = ['❤️', '💖', '🌟', '😘', '🌹', '💪', '😊', '✨', '💞', '🔥'];

// Прогресс-бар эмодзи
const progressEmojis = ['🟥', '🟦', '🟨', '🟩'];

// ASCII-арт
const getAsciiArt = (isNight) => {
  return isNight
    ? `
🌌 *Ночь в Ереване* 🌌
  🌙      🌙
   💖   💖
  ✨  *Рома*  ✨
🌌 *Валерия* 🌌
`
    : `
☀️ *День в Ереване* ☀️
  🌞      🌞
   ❤️   ❤️
  🔥  *Рома*  🔥
☀️ *Валерия* ☀️
`;
};

// Функция подсчёта службы (Ереван, UTC+4)
function getService() {
  const yerevanOffset = 4 * 60 * 60 * 1000; // UTC+4
  const startDate = new Date('2025-06-08T00:00:00Z'); // Начало: 8 июня 2025
  const endDate = new Date('2026-07-09T23:59:59Z'); // Конец: 9 июля 2026
  const currentDate = new Date(Date.now() + yerevanOffset);

  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerHour = 60 * 60 * 1000;
  const msPerMinute = 60 * 1000;

  const msPassed = currentDate - startDate;
  const msLeft = endDate - currentDate;
  const msTotal = endDate - startDate;

  const daysPassed = Math.max(0, Math.floor(msPassed / msPerDay));
  const hoursPassed = Math.floor((msPassed % msPerDay) / msPerHour);
  const minutesPassed = Math.floor((msPassed % msPerHour) / msPerMinute);

  const daysLeft = Math.floor(msLeft / msPerDay);
  const hoursLeft = Math.floor((msLeft % msPerDay) / msPerHour);
  const minutesLeft = Math.floor((msLeft % msPerHour) / msPerMinute);

  const totalDays = Math.ceil(msTotal / msPerDay); // ~397 дней
  const progressPercent = ((daysPassed / totalDays) * 100).toFixed(2);

  // Прогресс-бар
  const barLength = 15; // Компактный и стильный
  const filled = Math.round((progressPercent / 100) * barLength);
  const progressEmoji = progressEmojis[Math.floor(Math.random() * progressEmojis.length)];
  const progressBar = progressEmoji.repeat(filled) + '⬜'.repeat(barLength - filled);

  // ASCII-арт по времени суток
  const hours = currentDate.getHours();
  const isNight = hours >= 18 || hours < 6;

  // Случайный комплимент
  let compliment;
  do {
    compliment = russianCompliments[Math.floor(Math.random() * russianCompliments.length)];
  } while (state.sentMessages.includes(compliment) && state.sentMessages.length < russianCompliments.length);
  state.sentMessages.push(compliment);
  if (state.sentMessages.length >= russianCompliments.length) state.sentMessages.shift();

  const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];

  if (currentDate > endDate) {
    return `${getAsciiArt(isNight)}
┳━━━━━━━━━━━━━━━━┳
┃ <b>РОМА ВЕРНУЛСЯ!</b> ┃
┻━━━━━━━━━━━━━━━━┻
🎉 Валерия Джан, служба закончилась! 🪖
🔥 Беги обнимать Рому, он ждёт! 😘 ${emoji}
💞 Любовь победила время!`;
  } else {
    return `${getAsciiArt(isNight)}
┳━━━━━━━━━━━━━━━━┳
┃ <b>РОМА В АРМИИ</b> ┃
┻━━━━━━━━━━━━━━━━┻
🪖 <b>Служба:</b> ${daysPassed} дн., ${hoursPassed} ч., ${minutesPassed} мин.
📅 <b>Осталось:</b> ${daysLeft} дн., ${hoursLeft} ч., ${minutesLeft} мин.
🌟 <b>Всего:</b> ${totalDays} дн.
🔥 <b>Прогресс:</b> ${progressPercent}% 
${progressBar}
💌 <b>Рома шепчет:</b> ${compliment} ${emoji}`;
  }
}

// Клавиатура
const keyboard = Markup.keyboard([
  ['🪖 Служба Рома', '🎁 Сюрприз от Рома'],
  ['🇦🇴 Հայերեն']
]).resize();

// Команда /start
bot.command('start', (ctx) => {
  try {
    console.log(`Чат ID: ${ctx.chat.id}`);
    const asciiArt = getAsciiArt(false);
    ctx.reply(
      `${asciiArt}
┳━━━━━━━━━━━━━━━━┳
┃ <b>ВАЛЕРИЯ ДЖАН!</b> ┃
┻━━━━━━━━━━━━━━━━┻
😘 Привет от @RomaARMY! Я твой бот, созданный Ромой, чтобы ты знала, сколько его ждать из армии! 🪖
💕 Он думает о тебе 24/7!
🔥 Выбери, что хочешь узнать 👇`,
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
      `┳━━━━━━━━━━━━━━━━┳
┃ <b>ВАЛЕРИЯ ДЖАН!</b> ┃
┻━━━━━━━━━━━━━━━━┻
😊 Что хочешь узнать? Выбери! 👇`,
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
      case '🎁 Сюрприз от Рома':
        let surprise;
        do {
          surprise = surprises[Math.floor(Math.random() * surprises.length)];
        } while (state.surpriseHistory.includes(surprise) && state.surpriseHistory.length < surprises.length);
        state.surpriseHistory.push(surprise);
        if (state.surpriseHistory.length >= surprises.length) state.surpriseHistory.shift();
        const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
        ctx.reply(
          `┳━━━━━━━━━━━━━━━━┳
┃ <b>СЮРПРИЗ ОТ РОМА</b> ┃
┻━━━━━━━━━━━━━━━━┻
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
          `┳━━━━━━━━━━━━━━━━┳
┃ <b>ՀԱՅԵՐԵՆ ՍԵՐ</b> ┃
┻━━━━━━━━━━━━━━━━┻
💞 Վալերի Ջան, սիրով հայերեն! \n${armenianCompliment} ${emoji}`,
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Армянское сообщение отправлено');
        break;
      default:
        ctx.reply(
          `┳━━━━━━━━━━━━━━━━┳
┃ <b>ВАЛЕРИЯ ДЖАН!</b> ┃
┻━━━━━━━━━━━━━━━━┻
😅 Нажми кнопку, чтобы узнать про Рому! ❤️`,
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Неверная команда');
        break;
    }
  } catch (e) {
    console.error(`Ошибка обработки: ${e.message}`);
    ctx.reply(
      `┳━━━━━━━━━━━━━━━━┳
┃ <b>ОЙ, ДЖАН!</b> ┃
┻━━━━━━━━━━━━━━━━┻
😔 Что-то пошло не так! Попробуй снова. ❤️`,
      { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
    );
  }
});

// Запуск бота
console.log('🚀 Бот @RomaARMY для Валерии запущен...');
bot.launch({
  dropPendingUpdates: true
}).then(() => {
  console.log('🔥 Программа запущена...');
}).catch((e) => {
  console.error(`Ошибка запуска: ${e.message}`);
  if (e.response && e.response.error_code === 401) {
    console.error('Ошибка 401: Проверь токен бота в @BotFather.');
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
      console.log('✅ Бот успешно остановлен');
    } catch (err) {
      console.error(`Ошибка при остановке: ${err.message}`);
    }
    process.exit(0);
  });
});
