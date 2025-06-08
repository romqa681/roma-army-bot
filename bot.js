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
server.listen(8000, () => console.log('HTTP-сервер запущен на порту 8000...'));

// Хранилище данных
const state = {
  sentMessages: [], // История русских комплиментов
  sentArmenianMessages: [], // История армянских комплиментов
  surpriseHistory: [], // История сюрпризов
};

// Русские комплименты
const russianCompliments = [
  'Валерия Джан, твоя улыбка — мой свет в армии. 😊',
  'Моя любовь, ты делаешь каждый мой день особенным. ❤️',
  'Валерия, ты — моя звезда, сияющая над Ереваном. 🌟',
  'Родная, твоя поддержка — моя сила. Жди меня! 💪',
  'Валерия Джан, ты — моя мечта, ради которой я служу. ✨',
  'Моя королева, наша любовь сильнее времени. 👑',
  'Валерия, ты — мой маяк, ведущий меня домой. 🌅',
  'Любимая, я считаю секунды до нашей встречи. 💖',
  'Валерия Джан, ты — моё сердце, бьющееся в Ереване. 💞',
  'Моя душа, ты делаешь мою службу легче. 😘'
];

// Армянские комплименты
const armenianCompliments = [
  'Վալերի Ջան, քո ժպիտը իմ լույսն է բանակում։ 😊',
  'Իմ սեր, դու ամեն օրը դարձնում ես հատուկ։ ❤️',
  'Վալերի, դու Երևանի երկնքում իմ աստղն ես։ 🌟',
  'Հարազատս, քո աջակցությունը իմ ուժն է։ 💪',
  'Վալերի Ջան, դու իմ երազանքն ես, որի համար ծառայում եմ։ ✨'
];

// Сюрпризы от Рома
const surprises = [
  '🎉 Прогулка по Каскаду в Ереване после службы? Как тебе, Джан? 🌆',
  '💌 Напиши мне письмо, прочту в отпуске! Адрес: сердце Валерии. 😘',
  '🌅 Сфоткай закат и подумай обо мне, моя любовь. 📸',
  '🍷 Виртуальный ужин? Зажги свечу и представь меня рядом. 🕯️',
  '🎶 Послушай нашу песню и улыбнись — я думаю о тебе! 🎵',
  '🌹 Загадай желание под звёздами Еревана — я его исполню! ✨',
  '💕 Спланируй наше свидание после армии — я в предвкушении! 😊',
  '🖼️ Нарисуй что-нибудь для меня — повешу в мечтах о тебе! ✍️',
  '🍫 Купи себе вкусняшку и скажи: «Это от Рома!» 😋',
  '💞 Представь мои объятия — скоро они станут реальностью! 🤗'
];

// Случайные эмодзи
const randomEmojis = ['❤️', '💖', '🌟', '😘', '🌹', '💪', '😊', '✨', '💞', '☀️'];

// ASCII-арт
const getAsciiArt = (isNight) => {
  return isNight
    ? `
🌙🌙 *Ночь в Ереване* 🌙🌙
   ✨  
  💖💖
   ✨  
🌙🌙
`
    : `
☀️☀️ *День в Ереване* ☀️☀️
   ❤️  
💞💖💖
   ❤️  
☀️☀️
`;
};

// Функция подсчёта службы (Ереван, UTC+4)
function getService() {
  const startDate = new Date('2025-06-09T00:00:00+04:00'); // Начало: 9 июня 2025, Ереван
  const endDate = new Date('2026-07-09T23:59:59+04:00'); // Конец: 9 июля 2026, Ереван
  const currentDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Yerevan' }));

  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerHour = 60 * 60 * 1000;
  const msPerMinute = 60 * 1000;
  const msPerSecond = 1000;

  const msPassed = currentDate - startDate;
  const msLeft = endDate - currentDate;
  const msTotal = endDate - startDate;

  const daysPassed = Math.floor(msPassed / msPerDay);
  const hoursPassed = Math.floor((msPassed % msPerDay) / msPerHour);
  const minutesPassed = Math.floor((msPassed % msPerHour) / msPerMinute);
  const secondsPassed = Math.floor((msPassed % msPerMinute) / msPerSecond);

  const daysLeft = Math.floor(msLeft / msPerDay);
  const hoursLeft = Math.floor((msLeft % msPerDay) / msPerHour);
  const minutesLeft = Math.floor((msLeft % msPerHour) / msPerMinute);
  const secondsLeft = Math.floor((msLeft % msPerMinute) / msPerSecond);

  const totalDays = Math.ceil(msTotal / msPerDay); // 396 дней
  const progressPercent = daysPassed >= 0 ? ((daysPassed / totalDays) * 100).toFixed(2) : 0;

  // Прогресс-бар
  const barLength = 20; // Укороченный для красоты
  const filled = Math.round((progressPercent / 100) * barLength);
  const progressBar = '🟥'.repeat(filled) + '⬜'.repeat(barLength - filled);

  // ASCII-арт по времени суток
  const hours = currentDate.getHours();
  const isNight = hours >= 18 || hours < 6;

  // Случайный русский комплимент
  let compliment;
  do {
    compliment = russianCompliments[Math.floor(Math.random() * russianCompliments.length)];
  } while (state.sentMessages.includes(compliment) && state.sentMessages.length < russianCompliments.length);
  state.sentMessages.push(compliment);
  if (state.sentMessages.length >= russianCompliments.length) state.sentMessages.shift();

  const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];

  if (currentDate < startDate) {
    const daysToStart = Math.ceil((startDate - currentDate) / msPerDay);
    const hoursToStart = Math.floor(((startDate - currentDate) % msPerDay) / msPerHour);
    return `${getAsciiArt(isNight)}
<b>Валерия Джан, Рома ещё не начал службу!</b> 🪖
📅 <b>До начала службы:</b> ${daysToStart} дн., ${hoursToStart} ч.
💌 <b>Рома говорит:</b> ${compliment} ${emoji}`;
  } else if (currentDate > endDate) {
    return `${getAsciiArt(isNight)}
<b>Валерия Джан, Рома вернулся!</b> 🪖🎖️
🎉 Служба закончилась, беги обнимать Рому! 😘 ${emoji}`;
  } else {
    return `${getAsciiArt(isNight)}
<b>Валерия Джан, вот сколько осталось ждать Рому!</b> 🪖

🟥 <b>Прошло:</b> ${daysPassed} дн., ${hoursPassed} ч., ${minutesPassed} мин.
⬜ <b>Осталось:</b> ${daysLeft} дн., ${hoursLeft} ч., ${minutesLeft} мин.
📅 <b>Всего:</b> ${totalDays} дн.
📊 <b>Прогресс:</b> ${progressPercent}% ${progressBar}

💌 <b>Рома говорит:</b> ${compliment} ${emoji}`;
  }
}

// Клавиатура
const keyboard = Markup.keyboard([
  ['🪖 Сколько ждать Рому?', '🎁 Сюрприз от Рома'],
  ['🇦🇲 Հայերեն']
]).resize();

// Команда /start
bot.command('start', (ctx) => {
  try {
    console.log(`Чат ID: ${ctx.chat.id}`);
    const asciiArt = getAsciiArt(false);
    ctx.reply(
      `${asciiArt}
<b>Валерия Джан, привет!</b> 😘
Я бот @RomaARMY, созданный Ромой, чтобы ты знала, сколько ждать его из армии. 🪖
Он думает о тебе каждую секунду! 💕
Выбери, что хочешь узнать 👇`,
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
      `<b>Валерия Джан, что хочешь узнать?</b> 😊\nВыбери ниже! 👇`,
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
      case '🪖 Сколько ждать Рому?':
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
          `<b>Валерия Джан, вот сюрприз от Рома!</b> 🎁\n${surprise} ${emoji}`,
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Сюрприз отправлен');
        break;
      case '🇦🇲 Հայերեն':
        let armenianCompliment;
        do {
          armenianCompliment = armenianCompliments[Math.floor(Math.random() * armenianCompliments.length)];
        } while (state.sentArmenianMessages.includes(armenianCompliment) && state.sentArmenianMessages.length < armenianCompliments.length);
        state.sentArmenianMessages.push(armenianCompliment);
        if (state.sentArmenianMessages.length >= armenianCompliments.length) state.sentArmenianMessages.shift();
        const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
        ctx.reply(
          `<b>Վալերի Ջան, սիրով հայերեն!</b> 💞\n${armenianCompliment} ${emoji}`,
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Армянское сообщение отправлено');
        break;
      default:
        ctx.reply(
          `<b>Валерия Джан, нажми кнопку!</b> 😅\nУзнай, сколько ждать Рому! ❤️`,
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Неверная команда');
        break;
    }
  } catch (e) {
    console.error(`Ошибка обработки: ${e.message}`);
    ctx.reply(
      '<b>Ой, Валерия Джан, что-то пошло не так!</b> 😔\nПопробуй снова. ❤️',
      { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
    );
  }
});

// Запуск бота
console.log('Бот @RomaARMY для Валерии запущен...');
bot.launch({
  dropPendingUpdates: true
}).then(() => {
  console.log('Программа запущена...');
}).catch((e) => {
  console.error(`Ошибка запуска: ${e.message}`);
  if (e.response && e.response.error_code === 401) {
    console.error('Ошибка 401: Проверьте токен бота в @BotFather.');
  }
  process.exit(1);
});

// Обработка остановки
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log('Остановка бота...');
    try {
      bot.stop(signal);
      server.close(() => console.log('HTTP-сервер остановлен'));
      console.log('Бот успешно остановлен');
    } catch (err) {
      console.error(`Ошибка при остановке бота: ${err.message}`);
    }
    process.exit(0);
  });
});
