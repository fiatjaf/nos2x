<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { Check, Copy } from '@lucide/svelte';
	import { t } from '../i18n/index.svelte';

	interface KeyRow {
		kind: 'public' | 'secret';
		label: string;
		value: string;
		copy: string;
		done: string;
	}

	interface Props {
		rows: KeyRow[];
	}

	let { rows }: Props = $props();

	let copied = $state<KeyRow['kind'] | null>(null);
	let copyFailed = $state(false);

	async function copy(row: KeyRow): Promise<void> {
		copyFailed = false;
		try {
			await navigator.clipboard.writeText(row.value);
			copied = row.kind;
		} catch (error) {
			copied = null;
			copyFailed = true;
			console.error(`Copying the ${row.kind} key failed:`, error);
		}
	}
</script>

<div class="slip">
	{#each rows as row (row.kind)}
		<div class={['key', { secret: row.kind === 'secret' }]}>
			<div class="head">
				<p class="label">{row.label}</p>
				<button
					type="button"
					class="icon-button"
					title={copied === row.kind ? row.done : row.copy}
					onclick={() => void copy(row)}
				>
					{#if copied === row.kind}
						<Check size={14} strokeWidth={2} aria-hidden="true" />
					{:else}
						<Copy size={14} strokeWidth={1.8} aria-hidden="true" />
					{/if}
					<span class="visually-hidden" aria-live="polite">
						{copied === row.kind ? row.done : row.copy}
					</span>
				</button>
			</div>
			<p class="value">{row.value}</p>
		</div>
	{/each}
</div>
{#if copyFailed}
	<p class="error" role="alert">{t('auth.setup.copyFailed')}</p>
{/if}

<style>
	.slip {
		display: grid;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.key {
		display: grid;
		gap: 4px;
		padding: 10px 12px;
	}

	.key + .key {
		border-top: 1px dashed var(--color-border);
	}

	.key.secret {
		background: var(--color-notice-bg);
	}

	.key.secret .label {
		color: var(--color-notice-text);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-muted);
	}

	.value {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 12px;
		word-break: break-all;
		user-select: all;
	}

	.icon-button {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		color: var(--color-text);
		cursor: pointer;
	}

	.icon-button:hover,
	.icon-button:focus-visible {
		border-color: var(--color-border-focus);
	}
</style>
