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
	import Logo from './Logo.svelte';
	import { t } from '../i18n/index.svelte';
</script>

<div class="brand">
	<Logo />
	<div class="text">
		<p class="name">{t('brand.name')}</p>
		<p class="tagline">{t('brand.tagline')}</p>
	</div>
</div>

<style>
	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}

	.text {
		min-width: 0;
	}

	.name {
		margin: 0;
		font-size: 15px;
		font-weight: 650;
		letter-spacing: -0.01em;
	}

	.tagline {
		margin: 0;
		font-size: 12px;
		color: var(--color-muted);
	}
</style>
