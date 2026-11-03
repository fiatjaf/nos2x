/*
 * Copyright (c) 2026 Cadbos company. All rights reserved.
 *
 * SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1
 *
 * AI Design Signer is licensed under the Business Source License 1.1.
 * Production use is limited to signing in to AI design services operated by
 * Cadbos company. See LICENSE for complete terms.
 */

export const ru = {
	'brand.name': 'AI Design Signer',
	'brand.tagline': 'Вход в ИИ дизайн',
	'locale.switch': 'English',
	'common.back': 'Назад',
	'common.next': 'Далее',
	'common.close': 'Закрыть',

	'welcome.title': 'Добро пожаловать',
	'welcome.description':
		'Расширение хранит ваш Nostr-ключ и подписывает вход в ИИ дизайн. Секретный ключ не покидает браузер.',
	'welcome.create': 'Создать аккаунт в ИИ дизайн',
	'welcome.createHint': 'Ключ создаётся на сайте, затем его можно добавить сюда',
	'welcome.import': 'Добавить ключ',
	'welcome.importHint': 'Введите секретный ключ nsec или загрузите файл',

	'auth.setup.progress': 'Шаг {current} из {total}',
	'auth.setup.publicLabel': 'Публичный ключ',
	'auth.setup.secretLabel': 'Секретный ключ',
	'auth.setup.copyPublic': 'Скопировать публичный ключ',
	'auth.setup.copiedPublic': 'Публичный ключ скопирован',
	'auth.setup.copyFailed': 'Не удалось скопировать. Выделите ключ вручную или скачайте файл.',
	'auth.setup.download': 'Скачать файл',
	'auth.setup.downloadHint': 'Будет скачан файл с парой ключей: публичным и секретным',
	'auth.setup.ackSecretSaved': 'Я сохранил секретный ключ вне этого браузера',
	'done.signIn': 'Вернуться в ИИ дизайн',
	'auth.setup.fileName': 'ИИ дизайн-ключ-аккаунта.txt',
	'auth.setup.fileTitle': 'Ключ аккаунта ИИ дизайн',
	'auth.setup.fileWarning':
		'Секретный ключ — единственный способ войти в этот аккаунт. ИИ дизайн не может его восстановить.',

	'import.title': 'Добавление ключа',
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
	'password.saveFailed': 'Не удалось сохранить ключ. Попробуйте ещё раз.',

	'done.title': 'Аккаунт готов',
	'done.description': 'Ключ сохранён в расширении. Вход в ИИ дизайн теперь занимает один клик.',
	'done.openApp': 'Откройте ИИ дизайн и выберите вход через расширение.',

	'unlock.label': 'Введите пароль, чтобы разблокировать ключ',
	'unlock.submit': 'Разблокировать',
	'unlock.failed': 'Не удалось разблокировать ключ. Попробуйте ещё раз.',

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
	'settings.sites': 'Разрешения',
	'settings.sitesEmpty': 'Сайты, которым вы подтвердили вход, появятся здесь.',
	'settings.revoke': 'Отозвать разрешение',
	'settings.remove': 'Удалить ключ из расширения',
	'settings.removeWarning':
		'Без сохранённого секретного ключа вернуть этот аккаунт будет невозможно.',
	'settings.removeConfirm': 'Удалить ключ',
	'settings.locked': 'Разблокируйте ключ, чтобы изменить настройки.',

	'prompt.connectTitle': 'Подтверждение входа в ИИ дизайн',
	'prompt.connectText': 'Сайт просит ваш публичный ключ и подпись для входа:',
	'prompt.connectSafe':
		'Секретный ключ не передаётся сайту. Разрешение запомнится для этого адреса.',
	'prompt.unlockTitle': 'Разблокировка ключа',
	'prompt.unlockText': 'Введите пароль, чтобы подписать вход:',
	'prompt.approve': 'Подтвердить',
	'prompt.reject': 'Отклонить',
	'prompt.expired': 'Этот запрос уже не актуален.',
	'prompt.importTitle': 'Сохранить ключ в расширении',
	'prompt.importText':
		'ИИ дизайн создал для вас ключ. Сохраните его в расширении, чтобы входить в один клик:',
	'prompt.importPassword': 'Пароль необязателен. Без него ключ хранится в браузере без шифрования.',
	'prompt.importSave': 'Сохранить и войти'
};

export type Dictionary = Record<keyof typeof ru, string>;

export const en: Dictionary = {
	'brand.name': 'AI Design Signer',
	'brand.tagline': 'Sign in to AI design',
	'locale.switch': 'Русский',
	'common.back': 'Back',
	'common.next': 'Next',
	'common.close': 'Close',

	'welcome.title': 'Welcome',
	'welcome.description':
		'The extension keeps your Nostr key and signs your sign-in to AI design. The secret key never leaves the browser.',
	'welcome.create': 'Create an account in AI design',
	'welcome.createHint': 'The key is created on the site, then you can add it here',
	'welcome.import': 'Add a key',
	'welcome.importHint': 'Enter an nsec secret key or upload the key file',

	'auth.setup.progress': 'Step {current} of {total}',
	'auth.setup.publicLabel': 'Public key',
	'auth.setup.secretLabel': 'Secret key',
	'auth.setup.copyPublic': 'Copy public key',
	'auth.setup.copiedPublic': 'Public key copied',
	'auth.setup.copyFailed':
		'Could not copy. Select the key and copy it yourself, or download the file.',
	'auth.setup.download': 'Download file',
	'auth.setup.downloadHint': 'Downloads a file with the key pair: the public and the secret key',
	'auth.setup.ackSecretSaved': 'I saved the secret key outside this browser',
	'done.signIn': 'Back to AI design',
	'auth.setup.fileName': 'AI design-account-key.txt',
	'auth.setup.fileTitle': 'AI design account key',
	'auth.setup.fileWarning':
		'The secret key is the only way into this account. AI design cannot restore it.',

	'import.title': 'Add a key',
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
	'password.saveFailed': 'Could not save the key. Try again.',

	'done.title': 'Your account is ready',
	'done.description':
		'The key is saved in the extension. Signing in to AI design now takes one click.',
	'done.openApp': 'Open AI design and choose to sign in with the extension.',

	'unlock.label': 'Enter your password to unlock the key',
	'unlock.submit': 'Unlock',
	'unlock.failed': 'Could not unlock the key. Try again.',

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
	'settings.sites': 'Permissions',
	'settings.sitesEmpty': 'Sites you approve for sign-in appear here.',
	'settings.revoke': 'Revoke permission',
	'settings.remove': 'Remove the key from the extension',
	'settings.removeWarning': 'Without a saved secret key this account cannot be recovered.',
	'settings.removeConfirm': 'Remove key',
	'settings.locked': 'Unlock the key to change settings.',

	'prompt.connectTitle': 'Approve sign-in to AI design',
	'prompt.connectText': 'This site asks for your public key and a sign-in signature:',
	'prompt.connectSafe':
		'The secret key is never shared with the site. The permission is remembered for this address.',
	'prompt.unlockTitle': 'Unlock your key',
	'prompt.unlockText': 'Enter your password to sign in:',
	'prompt.approve': 'Approve',
	'prompt.reject': 'Reject',
	'prompt.expired': 'This request is no longer active.',
	'prompt.importTitle': 'Save the key in the extension',
	'prompt.importText':
		'AI design created a key for you. Save it in the extension to sign in with one click:',
	'prompt.importPassword':
		'The password is optional. Without it, the key is stored in the browser unencrypted.',
	'prompt.importSave': 'Save and sign in'
};
