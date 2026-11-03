<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 36 }: Props = $props();
</script>

<svg
	class="logo"
	width={size}
	height={size}
	viewBox="-34 0 579 579"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<path
		class="green"
		d="M228.403 100.79L83.337 188.395V389.981L228.403 477.585V578.378L-0.499908 435.197V143.18L228.403 -0.00268555V100.79Z"
	/>
	<path
		class="slate"
		d="M511 143.18V243.973L427.163 294.84V294.809L422.453 297.665V355.127L338.616 308.97V252.45L427.163 198.495V188.395L282.097 100.79V-0.00268555L511 143.18Z"
	/>
	<path
		class="slate"
		d="M511 436.138V335.346L427.163 284.477V284.509L422.453 281.652V224.19L338.616 255.276V326.867L427.163 380.822V390.923L282.5 478.5V578.5L511 436.138Z"
	/>
	<path
		class="grey"
		d="M511 243.972V143.18L282.097 286.362L282.5 578.5L365.934 526.875V332.519L511 243.972Z"
	/>
</svg>

<style>
	.logo {
		flex: none;
	}

	.green {
		fill: var(--logo-green);
	}

	.slate {
		fill: var(--logo-slate);
	}

	.grey {
		fill: var(--logo-grey);
	}
</style>
