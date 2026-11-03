<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { t } from '../../lib/i18n/index.svelte';
	import StepHeader from './StepHeader.svelte';

	interface Props {
		progress: { current: number; total: number };
		onback: () => void;
		oncreate: () => void;
	}

	let { progress, onback, oncreate }: Props = $props();
</script>

<section class="stack">
	<StepHeader {progress} title={t('auth.setup.title')} />
	<h2>{t('auth.setup.introTitle')}</h2>
	<p>{t('auth.setup.introPublic')}</p>
	<p>{t('auth.setup.introSecret')}</p>
	<div class="actions">
		<button type="button" class="button secondary" onclick={onback}>{t('common.back')}</button>
		<button type="button" class="button primary" onclick={oncreate}>
			{t('auth.setup.createKeys')}
		</button>
	</div>
</section>
