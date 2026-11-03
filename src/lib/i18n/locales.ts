/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1
 *
 * AI Design Singer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

export const ru = {
	'brand.name': 'AI Design Singer',
	'brand.tagline': 'Вход в ИИ дизайн',
	'locale.switch': 'English',
	'common.back': 'Назад',
	'common.next': 'Далее',
	'common.close': 'Закрыть',
	'common.copied': 'Скопировано',

	'welcome.title': 'Добро пожаловать',
	'welcome.description':
		'Расширение хранит ваши Nostr-ключи и подписывает вход в ИИ дизайн. Секретный ключ не покидает браузер.',
	'welcome.create': 'Создать аккаунт',
	'welcome.createHint': 'Сгенерируем новую пару ключей',
	'welcome.import': 'У меня есть ключ',
	'welcome.importHint': 'Введите секретный ключ nsec или загрузите файл',

	'auth.setup.title': 'Новая учётная запись',
	'auth.setup.progress': 'Шаг {current} из {total}',
	'auth.setup.introTitle': 'Создание пары ключей',
	'auth.setup.introPublic':
		'Публичный ключ — это логин (уникальный идентификатор) для взаимодействия с пользователями.',
	'auth.setup.introSecret':
		'Секретный ключ — это пароль, который нельзя изменить или восстановить в случае утери.',
	'auth.setup.createKeys': 'Сгенерировать ключи',
	'auth.setup.keysTitle': 'Сгенерирована пара ключей. Сохранение:',
	'auth.setup.publicLabel': 'Публичный ключ',
	'auth.setup.secretLabel': 'Секретный ключ',
	'auth.setup.keysDescription':
		'Сейчас публичный и секретный ключи созданы и сохранены только в вашем браузере.',
	'auth.setup.keysWarning':
		'Система не имеет доступа к секретному ключу. Не отправляйте ваш секретный ключ в чат и не вставляйте на чужие сайты.',
	'auth.setup.copyPublic': 'Скопировать публичный ключ',
	'auth.setup.copiedPublic': 'Публичный ключ скопирован',
	'auth.setup.copySecret': 'Скопировать секретный ключ',
	'auth.setup.copiedSecret': 'Секретный ключ скопирован',
	'auth.setup.copyFailed': 'Не удалось скопировать. Выделите ключ вручную или скачайте файл.',
	'auth.setup.download': 'Скачать файл',
	'auth.setup.downloadHint': 'Будет скачан файл с парой ключей: публичным и секретным',
	'auth.setup.ackDownloaded': 'Я скачал файл с парой ключей и убрал его в секретное место',
	'auth.setup.ackSecretSaved': 'Я сохранил секретный ключ вне этого браузера',
	'auth.setup.ackProtected': 'Я принял все меры для защиты нового аккаунта',
	'auth.setup.finish': 'Войти с этим ключом',
	'auth.setup.fileName': 'ИИ дизайн-ключ-аккаунта.txt',
	'auth.setup.fileTitle': 'Ключ аккаунта ИИ дизайн',
	'auth.setup.fileWarning':
		'Секретный ключ — единственный способ войти в этот аккаунт. ИИ дизайн не может его восстановить.',

	'import.title': 'Вход с существующим ключом',
	'import.description': 'Вставьте секретный ключ nsec или загрузите файл с парой ключей.',
	'import.label': 'Секретный ключ',
	'import.upload': 'Загрузить файл',
	'import.invalid': 'Не удалось распознать ключ. Нужен секретный ключ nsec, а не публичный npub.',
	'import.fileFailed': 'Не удалось прочитать файл.',
	'import.encrypted': 'Этот ключ защищён паролем. Введите пароль, чтобы его расшифровать.',
	'import.decrypt': 'Расшифровать',

	'password.title': 'Защита паролем',
	'password.description':
		'Пароль шифрует секретный ключ в этом браузере. Его нужно будет ввести после перезапуска браузера.',
	'password.hint': 'Пароль нельзя восстановить, но секретный ключ останется в вашем файле.',
	'password.new': 'Пароль',
	'password.repeat': 'Повторите пароль',
	'password.tooShort': 'Пароль должен быть не короче {min} символов',
	'password.mismatch': 'Пароли не совпадают',
	'password.wrong': 'Неверный пароль',
	'password.save': 'Защитить паролем',
	'password.skip': 'Без пароля',
	'password.encrypting': 'Шифрование…',

	'done.title': 'Аккаунт готов',
	'done.description': 'Ключ сохранён в расширении. Вход в ИИ дизайн теперь занимает один клик.',
	'done.openApp': 'Откройте ИИ дизайн и выберите вход через расширение.',

	'unlock.label': 'Введите пароль, чтобы разблокировать ключ',
	'unlock.submit': 'Разблокировать',

	'popup.noAccount': 'Аккаунт ещё не добавлен',
	'popup.start': 'Начать',
	'popup.locked': 'Ключ заблокирован',
	'popup.ready': 'Ключ готов для входа',
	'popup.lock': 'Заблокировать',
	'popup.settings': 'Настройки',

	'settings.title': 'Настройки',
	'settings.account': 'Аккаунт',
	'settings.password': 'Пароль',
	'settings.passwordOn': 'Секретный ключ зашифрован паролем.',
	'settings.passwordOff': 'Пароль не установлен: ключ хранится в браузере без шифрования.',
	'settings.setPassword': 'Установить пароль',
	'settings.changePassword': 'Сменить пароль',
	'settings.removePassword': 'Убрать пароль',
	'settings.saved': 'Сохранено',
	'settings.sites': 'Разрешённые сайты',
	'settings.sitesEmpty': 'Сайты появятся здесь после первого входа.',
	'settings.revoke': 'Отозвать доступ',
	'settings.remove': 'Удалить ключ из расширения',
	'settings.removeWarning':
		'Без сохранённого секретного ключа вернуть этот аккаунт будет невозможно.',
	'settings.removeConfirm': 'Удалить ключ',
	'settings.locked': 'Разблокируйте ключ, чтобы изменить настройки.',

	'prompt.connectTitle': 'Вход в ИИ дизайн',
	'prompt.connectText': 'Сайт просит ваш публичный ключ и подпись для входа:',
	'prompt.connectSafe':
		'Секретный ключ не передаётся сайту. Разрешение запомнится для этого адреса.',
	'prompt.unlockTitle': 'Разблокировка ключа',
	'prompt.unlockText': 'Введите пароль, чтобы подписать вход:',
	'prompt.allow': 'Разрешить и войти',
	'prompt.deny': 'Отклонить',
	'prompt.expired': 'Этот запрос уже не актуален.',
	'prompt.importTitle': 'Сохранить ключ в расширении',
	'prompt.importText':
		'ИИ дизайн создал для вас ключ. Сохраните его в расширении, чтобы входить в один клик:',
	'prompt.importPassword': 'Пароль необязателен. Без него ключ хранится в браузере без шифрования.',
	'prompt.importSave': 'Сохранить и войти'
};

export type Dictionary = Record<keyof typeof ru, string>;

export const en: Dictionary = {
	'brand.name': 'AI Design Singer',
	'brand.tagline': 'Sign in to AI design',
	'locale.switch': 'Русский',
	'common.back': 'Back',
	'common.next': 'Next',
	'common.close': 'Close',
	'common.copied': 'Copied',

	'welcome.title': 'Welcome',
	'welcome.description':
		'The extension keeps your Nostr keys and signs your sign-in to AI design. The secret key never leaves the browser.',
	'welcome.create': 'Create account',
	'welcome.createHint': 'We will generate a new key pair',
	'welcome.import': 'I have a key',
	'welcome.importHint': 'Enter an nsec secret key or upload the key file',

	'auth.setup.title': 'New account',
	'auth.setup.progress': 'Step {current} of {total}',
	'auth.setup.introTitle': 'Creating a key pair',
	'auth.setup.introPublic':
		'The public key is your login (a unique identifier) for interacting with other users.',
	'auth.setup.introSecret':
		'The secret key is your password. It cannot be changed or restored if lost.',
	'auth.setup.createKeys': 'Generate keys',
	'auth.setup.keysTitle': 'A key pair has been generated. Saving:',
	'auth.setup.publicLabel': 'Public key',
	'auth.setup.secretLabel': 'Secret key',
	'auth.setup.keysDescription': 'The public and secret keys now exist only in your browser.',
	'auth.setup.keysWarning':
		'The system has no access to the secret key. Do not send your secret key in a chat or paste it into someone else’s site.',
	'auth.setup.copyPublic': 'Copy public key',
	'auth.setup.copiedPublic': 'Public key copied',
	'auth.setup.copySecret': 'Copy secret key',
	'auth.setup.copiedSecret': 'Secret key copied',
	'auth.setup.copyFailed':
		'Could not copy. Select the key and copy it yourself, or download the file.',
	'auth.setup.download': 'Download file',
	'auth.setup.downloadHint': 'Downloads a file with the key pair: the public and the secret key',
	'auth.setup.ackDownloaded': 'I downloaded the key pair file and stored it in a secret place',
	'auth.setup.ackSecretSaved': 'I saved the secret key outside this browser',
	'auth.setup.ackProtected': 'I took every step to protect my new account',
	'auth.setup.finish': 'Sign in with this key',
	'auth.setup.fileName': 'AI design-account-key.txt',
	'auth.setup.fileTitle': 'AI design account key',
	'auth.setup.fileWarning':
		'The secret key is the only way into this account. AI design cannot restore it.',

	'import.title': 'Sign in with an existing key',
	'import.description': 'Paste your nsec secret key or upload the key pair file.',
	'import.label': 'Secret key',
	'import.upload': 'Upload file',
	'import.invalid':
		'This is not a key we recognise. We need the nsec secret key, not the npub public key.',
	'import.fileFailed': 'Could not read the file.',
	'import.encrypted': 'This key is password-protected. Enter the password to decrypt it.',
	'import.decrypt': 'Decrypt',

	'password.title': 'Password protection',
	'password.description':
		'The password encrypts the secret key in this browser. You will enter it after the browser restarts.',
	'password.hint': 'The password cannot be restored, but your secret key stays in your file.',
	'password.new': 'Password',
	'password.repeat': 'Repeat the password',
	'password.tooShort': 'The password must be at least {min} characters',
	'password.mismatch': 'The passwords do not match',
	'password.wrong': 'Wrong password',
	'password.save': 'Protect with password',
	'password.skip': 'No password',
	'password.encrypting': 'Encrypting…',

	'done.title': 'Your account is ready',
	'done.description':
		'The key is saved in the extension. Signing in to AI design now takes one click.',
	'done.openApp': 'Open AI design and choose to sign in with the extension.',

	'unlock.label': 'Enter your password to unlock the key',
	'unlock.submit': 'Unlock',

	'popup.noAccount': 'No account added yet',
	'popup.start': 'Get started',
	'popup.locked': 'The key is locked',
	'popup.ready': 'The key is ready for sign-in',
	'popup.lock': 'Lock',
	'popup.settings': 'Settings',

	'settings.title': 'Settings',
	'settings.account': 'Account',
	'settings.password': 'Password',
	'settings.passwordOn': 'The secret key is encrypted with a password.',
	'settings.passwordOff': 'No password: the key is stored in the browser unencrypted.',
	'settings.setPassword': 'Set password',
	'settings.changePassword': 'Change password',
	'settings.removePassword': 'Remove password',
	'settings.saved': 'Saved',
	'settings.sites': 'Allowed sites',
	'settings.sitesEmpty': 'Sites appear here after your first sign-in.',
	'settings.revoke': 'Revoke access',
	'settings.remove': 'Remove the key from the extension',
	'settings.removeWarning': 'Without a saved secret key this account cannot be recovered.',
	'settings.removeConfirm': 'Remove key',
	'settings.locked': 'Unlock the key to change settings.',

	'prompt.connectTitle': 'Sign in to AI design',
	'prompt.connectText': 'This site asks for your public key and a sign-in signature:',
	'prompt.connectSafe':
		'The secret key is never shared with the site. The permission is remembered for this address.',
	'prompt.unlockTitle': 'Unlock your key',
	'prompt.unlockText': 'Enter your password to sign in:',
	'prompt.allow': 'Allow and sign in',
	'prompt.deny': 'Deny',
	'prompt.expired': 'This request is no longer active.',
	'prompt.importTitle': 'Save the key in the extension',
	'prompt.importText':
		'AI design created a key for you. Save it in the extension to sign in with one click:',
	'prompt.importPassword':
		'The password is optional. Without it, the key is stored in the browser unencrypted.',
	'prompt.importSave': 'Save and sign in'
};
