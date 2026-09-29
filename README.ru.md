<p align="center">
  <img src="docs/icon.png" width="128" height="128" alt="Иконка Shinobi Launcher">
</p>

<h1 align="center">Shinobi Launcher</h1>

<p align="center">
  <a href="README.md">English</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português</a> · <a href="README.de.md">Deutsch</a> · <b>Русский</b>
</p>

<p align="center">
  <b>Играйте в Naruto Online на Mac.</b><br>
  Неофициальный бесплатный лаунчер с открытым кодом для Flash-MMO <i>Naruto Online</i> на macOS:
  настоящий Adobe Flash Player, запуск в один клик и полезные дополнения.
</p>

<p align="center">
  <a href="https://github.com/kenoleeee/shinobi-launcher/releases/latest"><img alt="Последняя версия" src="https://img.shields.io/github/v/release/kenoleeee/shinobi-launcher?label=%D1%81%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C&color=ff7a1a"></a>
  <img alt="macOS 11+" src="https://img.shields.io/badge/macOS-11%2B-black?logo=apple">
  <img alt="Apple Silicon и Intel" src="https://img.shields.io/badge/Apple%20Silicon%20%26%20Intel-%D0%BF%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%B8%D0%B2%D0%B0%D1%8E%D1%82%D1%81%D1%8F-555">
  <a href="LICENSE"><img alt="Лицензия MIT" src="https://img.shields.io/badge/%D0%BB%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F-MIT-blue"></a>
</p>

---

Naruto Online до сих пор работает на Adobe Flash, который не поддерживает ни один современный браузер,
а официальный лаунчер есть только для Windows. Эмуляторы вроде Ruffle пока не справляются с игрой:
загрузка останавливается примерно на 17%. Shinobi Launcher запускает игру на **настоящем Flash Player**,
поэтому она работает так же, как на Windows.

## Возможности

- 🎮 **Настоящий Flash Player.** Игра работает на оригинальном Adobe Flash Player 32, а не на эмуляторе.
- 🚀 **Игра в один клик.** Лаунчер сразу открывает сервер, на котором вы играли в прошлый раз.
- 🔐 **Вход сохраняется.** Вход хранится 30 дней, работает и вход через Google.
- 👥 **Несколько аккаунтов.** Каждый аккаунт открывается в своём окне, например основной и твинк одновременно.
- 🖥 **Чистый режим.** Панель сайта скрыта, и игра занимает всё окно или весь экран.
- ⚡ **Быстрая загрузка.** Постоянный кэш игры на 2 ГБ, реклама и трекеры заблокированы.
- 😴 **Мак не засыпает.** Пока открыто окно игры, Mac не уходит в сон. Удобно, если оставляете персонажа фармить.
- 📸 **Горячие клавиши.** Скриншоты сразу сохраняются в *Изображения → Naruto Online*, звук выключается одной клавишей.
- 🩹 **Исправлено частое зависание.** Загрузка больше не встаёт на 14–15%, когда игра выбирает недоступный резервный сервер.
- 🔄 **Уведомления об обновлениях**, когда выходит новая версия.

## Установка

1. Скачайте **`Shinobi-Launcher-x.y.z.dmg`** со страницы [последней версии](https://github.com/kenoleeee/shinobi-launcher/releases/latest).
2. Откройте файл и перетащите **Shinobi Launcher** в папку **Программы**.
3. Запустите Shinobi Launcher. В первый раз macOS заблокирует его, потому что он не из App Store:
   - Откройте **Системные настройки → Конфиденциальность и безопасность**, пролистайте вниз и нажмите **Все равно открыть** рядом с *Shinobi Launcher*.
   - Или один раз выполните в Терминале:
     ```sh
     xattr -dr com.apple.quarantine "/Applications/Shinobi Launcher.app"
     ```
4. **Apple Silicon (M1/M2/M3/M4):** если macOS предложит установить **Rosetta**, нажмите *Установить*.
   Adobe так и не выпустил Flash для процессоров Apple, поэтому без Rosetta не обойтись.
5. При первом запуске лаунчер скачает Flash Player (около 20 МБ), это займёт примерно минуту.
   Потом откроется игра.

**Требования:** macOS 11 Big Sur или новее, Apple Silicon или Intel.

## Как пользоваться

Меню в приложении на английском:

| Действие | Меню / клавиши |
|---|---|
| Войти через Google (или по email) | **Account → Sign In with Google / Email…** · `⌘⇧L` |
| Добавить второй аккаунт (новое окно) | **Account → Add Another Account** · `⌘⇧N` |
| Переключиться между аккаунтами | `⌘1`, `⌘2`, … |
| Вернуться к списку серверов | `⌘H` |
| Скриншот | `⌘⇧S` |
| Выключить / включить звук | `⌘⇧M` |
| Включить / выключить чистый режим | `⌘⇧C` |
| Полный экран | `⌃⌘F` |

Вход по email и паролю работает прямо на сайте игры. **Вход через Google** сам Google блокирует
в браузерах с поддержкой Flash, поэтому используйте **Account → Sign In with Google / Email…**.
Откроется небольшое окно на движке Safari. После входа оно закроется само, и лаунчер войдёт в ваш аккаунт.

## Как устроена установка Flash

Adobe Flash Player нельзя распространять, поэтому **его нет ни в приложении, ни в этом репозитории.**
При первом запуске лаунчер:

1. Скачивает официальный установщик Adobe *Flash Player 32.0.0.330 для Mac* с
   [зеркала официального архива Flash Player от Adobe в Internet Archive](https://archive.org/details/fp_32.0.0.330_archive).
2. Сверяет его SHA-256 с известным выпуском Adobe.
3. Проверяет, что пакет установщика подписан **Adobe Systems, Inc. (JQ525L2MZD)**.
4. Распаковывает только плагин браузера в `~/Library/Application Support/Shinobi Launcher/`.
   В систему ничего не устанавливается.
5. Проверяет цифровую подпись самого плагина: она тоже должна быть от Adobe.

Код лежит в [`src/flash-setup.js`](src/flash-setup.js).

## Безопасность

Adobe больше не выпускает обновления Flash Player 32. Чтобы он был изолирован:

- Лаунчер открывает только сайты игры и страницы входа Google/Facebook. Все остальные ссылки открываются в вашем обычном браузере.
- Flash есть только внутри лаунчера, в ваших браузерах его нет.
- Лаунчер не собирает данные. Журнал отладки хранится только на вашем Mac и никогда не содержит паролей и токенов входа.

## Решение проблем

<details>
<summary><b>«Shinobi Launcher повреждён / не может быть открыт»</b></summary>

Карантин macOS блокирует приложения, скачанные не из App Store. Выполните:

```sh
xattr -dr com.apple.quarantine "/Applications/Shinobi Launcher.app"
```
</details>

<details>
<summary><b>Кнопка Login ничего не делает / «The login server is temporarily limiting attempts»</b></summary>

После слишком большого числа попыток входа подряд сервер входа игры блокирует ваш IP примерно на 5 минут.
Подождите и нажмите **Login** один раз.
</details>

<details>
<summary><b>Чёрный экран или игра не загружается</b></summary>

Попробуйте **Game → Force Reload**. Если не помогло, откройте **Help → Open Debug Log** и приложите
журнал к [новому issue](https://github.com/kenoleeee/shinobi-launcher/issues/new/choose).
</details>

<details>
<summary><b>Не удалась первоначальная настройка</b></summary>

Для загрузки Flash нужен доступ к `archive.org`. Нажмите **Try again**. Если ошибка повторяется,
[откройте issue](https://github.com/kenoleeee/shinobi-launcher/issues/new/choose) и приложите текст ошибки.
</details>

## Сборка из исходного кода

См. раздел [*Building from source*](README.md#building-from-source) в английском README.

## Поддержать проект

Shinobi Launcher бесплатный и всегда таким останется. Если он вернул вам Naruto Online на Mac,
вы можете поддержать разработку:

| Монета | Адрес |
|---|---|
| **ETH / ERC-20** (USDT, USDC) | `0x92277bbeb48218dee7e6fc1248a1cfa768d83850` |
| **BTC** | `1Nsq5PtU8YueBTxpRWXo1BUvihyaRLuaG4` |

⚠️ Токены ERC-20 отправляйте на адрес ETH **только в сети Ethereum**, а на адрес BTC только BTC.
Эти адреса есть и в приложении: **Help → Support the Project**.

⭐ на GitHub тоже очень помогает!

## Отказ от ответственности

Shinobi Launcher — **неофициальный фанатский проект**. Он не связан с Oasis Games, Mars Era, Tencent,
Bandai Namco, Масаси Кисимото / Shueisha или Adobe и не одобрен ими. *Naruto* и *Naruto Online* —
товарные знаки их владельцев. Adobe Flash Player © Adobe; он скачивается из собственного установщика
Adobe при первом запуске и здесь не распространяется.

Лаунчер не изменяет игру, не даёт преимуществ и ничего не автоматизирует. Он только позволяет
запускать официальную игру на macOS.

## Лицензия

[MIT](LICENSE) © 2026 kenoleeee
