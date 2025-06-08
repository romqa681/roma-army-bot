const { Telegraf, Markup } = require('telegraf');

// API-токен бота
const BOT_TOKEN = '7646237377:AAH30i_qcrd0ILAD5mJUvXYWjg_w0FLU8Uo';
const bot = new Telegraf(BOT_TOKEN);

// Хранилище данных
const state = {
  sentMessages: [], // История комплиментов
  surpriseHistory: [], // История сюрпризов
};

// Комплименты для Валерии (русский и армянский)
const compliments = [
  'Валерия Джан, твоя улыбка — мой свет в армии. 😊',
  'Моя любовь, ты делаешь каждый мой день особенным. ❤️',
  'Валерия, ты — моя звезда, сияющая над Ереваном. 🌟',
  'Родная, твоя поддержка — моя сила. Жди меня! 💪',
  'Валерия Джан, ты — моя мечта, ради которой я служу. ✨',
  'Моя королева, наша любовь сильнее времени. 👑',
  'Валерия, ты — мой маяк, ведущий меня домой. 🌅',
  'Любимая, я считаю секунды до нашей встречи. 💖',
  'Валерия Джан, ты — моё сердце, бьющееся в Ереване. 💞',
  'Моя душа, ты делаешь мою службу легче. 😘',
  'Վալերիա Ջան, քո ժպիտն իմ լույսն է բանակում։ 😊',
  'Իմ սեր, դու ամեն օրս դարձնում ես հատուկ։ ❤️',
  'Վալերիա, դու Երևանի երկնքում իմ աստղն ես։ 🌟',
  'Հարազատս, քո աջակցությունն իմ ուժն է։ 💪',
  'Վալերիա Ջան, դու երազանքս ես, որի համար ծառայում եմ։ ✨'
];

// Сюрпризы от Рома
const surprises = [
  '🎉 Прогулка по Каскаду в Ереване после моей службы — как тебе идея, Джан? 🌆',
  '💌 Напиши мне письмо, я прочту его в отпуске! Адрес: сердце Валерии. 😘',
  '🌅 Сфоткай закат сегодня и подумай обо мне, моя любовь. 📸',
  '🍷 Давай устроим виртуальный ужин? Зажги свечу и представь меня рядом. 🕯️',
  '🎶 Послушай нашу любимую песню и улыбнись — я думаю о тебе! 🎵',
  '🌹 Загадай желание под звёздами Еревана — я исполню его, когда вернусь! ✨',
  '💕 Спланируй наше первое свидание после армии — я весь в предвкушении! 😊',
  '🖼️ Нарисуй что-нибудь для меня — я повешу это в своей мечте о тебе! ✍️',
  '🍫 Купи себе любимое лакомство и скажи: «Это от Рома!» 😋',
  '💞 Представь, как я обнимаю тебя крепко-крепко — скоро это станет реальностью! 🤗'
];

// Случайные эмодзи
const randomEmojis = ['❤️', '💖', '🌟', '😘', '🌹', '💪', '😊', '✨', '💞', '☀️'];

// ASCII-арт
const getAsciiArt = (isNight) => {
  return isNight
    ? `
    🌙🌙
   ✨  
  💖💖
   ✨  
    🌙🌙
    `
    : `
    ☀️☀️
   ❤️  
💞💖💖
   ❤️  
    ☀️☀️
    `;
};

// Функция подсчёта службы (Ереван, UTC+4)
function getService() {
  const yerevanOffset = 4 * 60 * 60 * 1000; // UTC+4
  const startDate = new Date('2025-06-09T00:00:00Z'); // Начало: 9 июня 2025
  const endDate = new Date('2026-07-09T00:00:00Z'); // Конец: 9 июля 2026
  const currentDate = new Date(Date.now() + yerevanOffset);

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

  const totalDays = Math.floor(msTotal / msPerDay);
  const progressPercent = ((daysPassed / totalDays) * 100).toFixed(2);

  // Прогресс-бар
  const barLength = 30;
  const filled = Math.round((progressPercent / 100) * barLength);
  const progressBar = '🟥'.repeat(filled) + '⬜'.repeat(barLength - filled);

  // ASCII-арт по времени суток
  const hours = currentDate.getHours();
  const isNight = hours >= 18 || hours < 6;

  // Случайный комплимент
  let compliment;
  do {
    compliment = compliments[Math.floor(Math.random() * compliments.length)];
  } while (state.sentMessages.includes(compliment) && state.sentMessages.length < compliments.length);
  state.sentMessages.push(compliment);
  if (state.sentMessages.length >= compliments.length) state.sentMessages.shift();

  const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];

  if (currentDate < startDate) {
    return `${getAsciiArt(isNight)}\n<b>Валерия Джан, Рома ещё не начал службу.</b> 🪖\nДо начала (${startDate.toLocaleDateString('ru-RU')}): ${-daysLeft} дней, ${-hoursLeft} часов, ${-minutesLeft} минут, ${-secondsLeft} секунд\nРома скучает по тебе, моя любовь! ${emoji}`;
  } else if (currentDate > endDate) {
    return `${getAsciiArt(isNight)}\n<b>Валерия Джан, Рома вернулся!</b> 🪖🎖️\nСлужба закончилась, беги обнимать Рому! 😘 ${emoji}`;
  } else {
    return `${getAsciiArt(isNight)}\n<b>Валерия Джан, вот сколько осталось ждать Рому!</b> 🪖\n\n` +
           `🟥 Прошло: ${daysPassed} дней, ${hoursPassed} часов, ${minutesPassed} минут, ${secondsPassed} секунд\n` +
           `⬜ Осталось: ${daysLeft} дней, ${hoursLeft} часов, ${minutesLeft} минут, ${secondsLeft} секунд\n` +
           `Всего: ${totalDays} дней\n` +
           `<b>Прогресс: ${progressPercent}%</b>\n${progressBar}\n\n` +
           `<b>Рома говорит тебе:</b> ${compliment} ${emoji}`;
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
      `${asciiArt}\n<b>Валерия Джан, привет!</b> 😘\nЯ бот @RomaARMY, созданный Ромой, чтобы ты знала, сколько ждать его из армии. 🪖\nОн думает о тебе каждую секунду. 💕\nНажми кнопку ниже! 👇`,
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
      `<b>Валерия Джан, что хочешь узнать?</b> 😊\nНажми кнопку ниже! 👇`,
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
        const armenianCompliment = compliments[Math.floor(Math.random() * 5) + 10]; // Индексы 10-14
        ctx.reply(
          `<b>Վալերիա Ջան, սիրով հայերեն։</b> 💞\n${armenianCompliment}`,
          { parse_mode: 'HTML', reply_markup: keyboard.reply_markup }
        );
        console.log('Армянское сообщение отправлено');
        break;
      default:
        ctx.reply(
          `<b>Валерия Джан, нажми кнопку!</b> 😅\nУзнай, сколько ждать Рому. ❤️`,
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
  dropPendingUpdates: true // Игнорировать старые сообщения
}).then(() => {
  console.log('Программа запущена...');
}).catch((e) => {
  console.error(`Ошибка запуска: ${e.message}`);
  if (e.response && e.response.error_code === 401) {
    console.error('Ошибка 401: Проверьте токен бота в @BotFather. Возможно, он недействителен.');
  }
  process.exit(1);
});

// Обработка остановки
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log('Остановка бота...');
    try {
      bot.stop(signal); // Синхронный вызов, без .catch()
      console.log('Бот успешно остановлен');
    } catch (err) {
      console.error(`Ошибка при остановке бота: ${err.message}`);
    }
    process.exit(0);
  });
});
