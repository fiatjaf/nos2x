# Store listing

Fields of the **Store listing** tab in the Chrome Web Store Developer Dashboard. The name and the
summary come from the extension itself (`public/_locales/*/messages.json`); everything else is
entered in the dashboard, separately for each language.

## Common fields

| Field              | Value                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Name               | AI Design Singer                                                                               |
| Category           | Tools (if the dashboard offers a newer taxonomy: Productivity → Tools)                         |
| Languages          | English (default), Russian                                                                     |
| Homepage URL       | https://app.cadbos.com                                                                         |
| Support URL        | https://github.com/cadbos/nostr-signer-browser_extension/issues (or a support page in the app) |
| Store icon         | `icons/icon-128.png` (the same file as `public/icons/128.png`)                                 |
| Small promo tile   | `images/promo-small-440x280.png`                                                               |
| Marquee promo tile | `images/promo-marquee-1400x560.png` (optional)                                                 |
| Screenshots (EN)   | `screenshots/en/01-sign-in.png` … `05-settings.png`                                            |
| Screenshots (RU)   | `screenshots/ru/01-sign-in.png` … `05-settings.png`                                            |

## English

**Summary** (from the manifest, at most 132 characters):

> Sign in to AI design with your Nostr keys. The secret key stays in your browser.

**Description:**

```
AI Design Singer signs you in to AI design (app.cadbos.com) with your Nostr keys. Your secret key stays in this browser: the site only ever receives your public key and a signed login event.

ONE-CLICK SIGN-IN
Choose "Sign in with AI Design Singer" in the AI design sign-in menu. You approve the first sign-in from the site once; after that, signing in takes a single click.

ADD YOUR AI DESIGN KEY
• Create an account in AI design, then add its key to the extension: paste the nsec, a password-protected ncryptsec, or upload the key file AI design produces.
• Creating the account with the extension installed? AI design hands the key over after you approve it in the extension.

YOUR KEY, YOUR CONTROL
• Optional password: the secret key is encrypted in the browser (NIP-49).
• Lock the key from the toolbar with one click; unlocking only needs your password.
• Settings: download the key file, change or remove the password, revoke site permissions, remove the key.

BUILT FOR SAFETY
• Works only on AI design sites and signs nothing but AI design login events.
• The secret key never leaves the extension: it is not sent to any server or shown to web pages.
• No analytics, no tracking, no third parties.
• Russian and English interface, light and dark theme.

The source code is public: https://github.com/cadbos/nostr-signer-browser_extension
```

## Русский

**Краткое описание** (из манифеста, не больше 132 символов):

> Вход в ИИ дизайн с вашими Nostr-ключами. Секретный ключ остаётся в вашем браузере.

**Описание:**

```
AI Design Singer выполняет вход в ИИ дизайн (app.cadbos.com) с вашими Nostr-ключами. Секретный ключ остаётся в этом браузере: сайт получает только публичный ключ и подписанное событие входа.

ВХОД В ОДИН КЛИК
Выберите «Войти через AI Design Singer» в меню входа ИИ дизайн. Первый вход с сайта вы подтверждаете один раз, дальше вход занимает одно нажатие.

ДОБАВЬТЕ КЛЮЧ ИЗ ИИ ДИЗАЙН
• Создайте аккаунт в ИИ дизайн и добавьте его ключ в расширение: вставьте nsec, защищённый паролем ncryptsec или загрузите файл ключа из ИИ дизайн.
• Создаёте аккаунт с установленным расширением? ИИ дизайн передаст ключ, как только вы подтвердите это в расширении.

ВАШ КЛЮЧ ПОД ВАШИМ КОНТРОЛЕМ
• Пароль по желанию: секретный ключ шифруется прямо в браузере (NIP-49).
• Блокировка ключа одним нажатием на панели браузера; для разблокировки нужен только пароль.
• Настройки: скачать файл ключа, сменить или убрать пароль, отозвать разрешения сайтов, удалить ключ.

СОЗДАНО С ЗАБОТОЙ О БЕЗОПАСНОСТИ
• Работает только на сайтах ИИ дизайн и подписывает только события входа в ИИ дизайн.
• Секретный ключ не покидает расширение: он не отправляется на серверы и не передаётся веб-страницам.
• Никакой аналитики, отслеживания и третьих сторон.
• Интерфейс на русском и английском, светлая и тёмная тема.

Исходный код открыт: https://github.com/cadbos/nostr-signer-browser_extension
```

## Screenshot captions

The captions are part of the images. To change them, edit the scene list and re-render.

| #   | EN                                   | RU                                 |
| --- | ------------------------------------ | ---------------------------------- |
| 1   | One-click sign-in to AI design       | Вход в ИИ дизайн в один клик       |
| 2   | Your AI design key                   | Ключ из ИИ дизайн                  |
| 3   | Always at hand                       | Всегда под рукой                   |
| 4   | Your secret key stays in the browser | Секретный ключ не покидает браузер |
| 5   | Full control                         | Полный контроль                    |
