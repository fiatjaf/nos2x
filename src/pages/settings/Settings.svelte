<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-Cadbos-BSL-1.1

Cadbos Interior Design AI is licensed under the Business Source License 1.1.
Access is limited to automated analysis tools for analysis of this repository.
This code is not open for contribution or usage except under a separate written
agreement with Cadbos company.

Commercial use in Interior Design & AEC Generative AI Services is prohibited
before the Change Date. See LICENSE for complete terms.
-->

<script lang="ts">
	import { Download, Globe, X } from '@lucide/svelte';
	import { nsecEncode } from 'nostr-tools/nip19';
	import PageShell from '../../lib/ui/PageShell.svelte';
	import KeyRows from '../../lib/ui/KeyRows.svelte';
	import PasswordFields from '../../lib/ui/PasswordFields.svelte';
	import UnlockForm from '../../lib/ui/UnlockForm.svelte';
	import { account } from '../../lib/state/account.svelte';
	import { removeAccount, setPassword, signingKey } from '../../lib/keystore';
	import { forgetApprovals, revoke } from '../../lib/approvals';
	import { passwordProblem } from '../../lib/password';
	import { downloadTextFile, formatAccountKeyFile } from '../../lib/account-file';
	import { t } from '../../lib/i18n/index.svelte';

	let editingPassword = $state(false);
	let password = $state('');
	let repeat = $state('');
	let attempted = $state(false);
	let busy = $state(false);
	let saved = $state(false);
	let confirmRemoval = $state(false);

	const rows = $derived(
		account.npub
			? [
					{
						kind: 'public' as const,
						label: t('auth.setup.publicLabel'),
						value: account.npub,
						copy: t('auth.setup.copyPublic'),
						done: t('auth.setup.copiedPublic')
					}
				]
			: []
	);

	function report(action: string): (error: unknown) => void {
		return (error) => console.error(`${action} failed:`, error);
	}

	async function downloadKeys(): Promise<void> {
		const secretKey = await signingKey();
		if (!secretKey || !account.npub) return;
		downloadTextFile(
			t('auth.setup.fileName'),
			formatAccountKeyFile({
				title: t('auth.setup.fileTitle'),
				publicLabel: t('auth.setup.publicLabel'),
				publicKey: account.npub,
				secretLabel: t('auth.setup.secretLabel'),
				secretKey: nsecEncode(secretKey),
				warning: t('auth.setup.fileWarning')
			})
		);
	}

	async function changePassword(next: string | null): Promise<void> {
		if (next !== null) {
			attempted = true;
			if (passwordProblem(password, repeat)) return;
		}
		busy = true;
		saved = false;
		try {
			await setPassword(next);
			editingPassword = false;
			attempted = false;
			password = '';
			repeat = '';
			saved = true;
		} catch (error) {
			report('Changing the password')(error);
		} finally {
			busy = false;
		}
	}

	function submitPassword(event: SubmitEvent): void {
		event.preventDefault();
		void changePassword(password);
	}

	async function remove(): Promise<void> {
		await removeAccount();
		await forgetApprovals();
		confirmRemoval = false;
	}

	function openOnboarding(): void {
		chrome.tabs
			.create({ url: chrome.runtime.getURL('pages/onboarding/index.html') })
			.catch(report('Opening onboarding'));
	}
</script>

<PageShell>
	<div class="settings">
		<h1>{t('settings.title')}</h1>

		{#if account.status?.state === 'none'}
			<section class="stack">
				<p class="muted">{t('popup.noAccount')}</p>
				<button type="button" class="button primary" onclick={openOnboarding}>
					{t('popup.start')}
				</button>
			</section>
		{:else if account.status?.state === 'locked'}
			<section class="stack">
				<p class="notice">{t('settings.locked')}</p>
				<KeyRows {rows} />
				<UnlockForm />
			</section>
		{:else if account.status?.state === 'ready'}
			<section class="stack">
				<h2>{t('settings.account')}</h2>
				<KeyRows {rows} />
				<button
					type="button"
					class="button secondary"
					title={t('auth.setup.downloadHint')}
					onclick={() => downloadKeys().catch(report('Downloading the key file'))}
				>
					<Download size={16} strokeWidth={1.8} aria-hidden="true" />
					{t('auth.setup.download')}
				</button>
			</section>

			<section class="stack">
				<h2>{t('settings.password')}</h2>
				<p class="muted">
					{account.status.passwordProtected ? t('settings.passwordOn') : t('settings.passwordOff')}
				</p>
				{#if editingPassword}
					<form class="stack" onsubmit={submitPassword}>
						<PasswordFields bind:password bind:repeat showProblems={attempted} />
						<div class="actions">
							<button
								type="button"
								class="button secondary"
								disabled={busy}
								onclick={() => (editingPassword = false)}
							>
								{t('common.back')}
							</button>
							<button type="submit" class="button primary" disabled={busy}>
								{busy ? t('password.encrypting') : t('password.save')}
							</button>
						</div>
					</form>
				{:else}
					<div class="row">
						<button
							type="button"
							class="button secondary"
							onclick={() => {
								editingPassword = true;
								saved = false;
							}}
						>
							{account.status.passwordProtected
								? t('settings.changePassword')
								: t('settings.setPassword')}
						</button>
						{#if account.status.passwordProtected}
							<button
								type="button"
								class="button secondary"
								disabled={busy}
								onclick={() => void changePassword(null)}
							>
								{t('settings.removePassword')}
							</button>
						{/if}
					</div>
					{#if saved}
						<p class="saved" role="status">{t('settings.saved')}</p>
					{/if}
				{/if}
			</section>

			<section class="stack">
				<h2>{t('settings.sites')}</h2>
				{#if account.approvedOrigins.length === 0}
					<p class="muted">{t('settings.sitesEmpty')}</p>
				{:else}
					<ul class="sites">
						{#each account.approvedOrigins as origin (origin)}
							<li>
								<Globe size={16} strokeWidth={1.8} aria-hidden="true" />
								<span class="site">{new URL(origin).host}</span>
								<button
									type="button"
									class="icon-button"
									title={t('settings.revoke')}
									onclick={() => {
										if (account.status?.state === 'ready') {
											revoke(account.status.pubkey, origin).catch(report('Revoking access'));
										}
									}}
								>
									<X size={14} strokeWidth={1.8} aria-hidden="true" />
									<span class="visually-hidden">{t('settings.revoke')}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<section class="stack danger-zone">
				<h2>{t('settings.remove')}</h2>
				<p class="muted">{t('settings.removeWarning')}</p>
				<label class="checkbox">
					<input type="checkbox" bind:checked={confirmRemoval} />
					<span>{t('auth.setup.ackSecretSaved')}</span>
				</label>
				<button
					type="button"
					class="button danger"
					disabled={!confirmRemoval}
					onclick={() => remove().catch(report('Removing the key'))}
				>
					{t('settings.removeConfirm')}
				</button>
			</section>
		{/if}
	</div>
</PageShell>

<style>
	.settings {
		display: grid;
		gap: 24px;
	}

	section + section {
		padding-top: 20px;
		border-top: 1px solid var(--color-border);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.saved {
		color: var(--color-accent-text);
		font-size: 13px;
	}

	.sites {
		display: grid;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.sites li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		color: var(--color-muted);
	}

	.site {
		flex: 1;
		min-width: 0;
		color: var(--color-text);
		word-break: break-all;
	}

	.icon-button {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-muted);
		cursor: pointer;
	}

	.icon-button:hover,
	.icon-button:focus-visible {
		border-color: var(--color-danger);
		color: var(--color-danger);
	}

	.danger-zone h2 {
		color: var(--color-danger);
	}
</style>
