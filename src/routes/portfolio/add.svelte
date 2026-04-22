<script lang="ts">
	import { DatePicker, parseDate, Portal as SkeletonPortal, Dialog } from '@skeletonlabs/skeleton-svelte';
	import { enhance } from '$app/forms';
	import { XIcon, SquarePlus } from '@lucide/svelte';

	// Props
	interface Props {
		onPortfolioAdded?: (portfolio: any[]) => void;
	}

	let { onPortfolioAdded }: Props = $props();

	// Animation configuration
	const animation = 'transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0';

	// Style constants
	const buttonStyle = 'btn rounded-lg px-3 py-2 transition-all duration-200 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800';
	const iconStyle = 'w-4 h-4';

	// Dialog state
	let isDialogOpen = $state(false);

	// Form state
	let value = $state([parseDate(new Date().toISOString().split('T')[0])]);
	let submitting = $state(false);
	let message = $state('');
	let formData = $state({
		dkbAll: '',
		dkbDepot: '',
		zkbAll: ''
	});
	let formErrors = $state({
		dkbAll: '',
		dkbDepot: '',
		zkbAll: ''
	});

	// Validation functions
	function validateCurrencyField(value: string, fieldName: string): string {
		if (!value || value.trim() === '') {
			return `${fieldName} is required`;
		}
		const numValue = parseFloat(value);
		if (isNaN(numValue) || numValue <= 0) {
			return `Please enter a valid positive amount for ${fieldName}`;
		}
		return '';
	}

	function validateForm(): boolean {
		formErrors.dkbAll = validateCurrencyField(formData.dkbAll, 'DKB All');
		formErrors.dkbDepot = validateCurrencyField(formData.dkbDepot, 'DKB Depot');
		formErrors.zkbAll = validateCurrencyField(formData.zkbAll, 'ZKB All');

		// Cross-field validation
		if (formData.dkbAll && formData.dkbDepot) {
			const dkbAll = parseFloat(formData.dkbAll);
			const dkbDepot = parseFloat(formData.dkbDepot);
			if (dkbDepot > dkbAll) {
				formErrors.dkbDepot = 'Depot amount cannot exceed total DKB amount';
			}
		}

		return !formErrors.dkbAll && !formErrors.dkbDepot && !formErrors.zkbAll;
	}

	function resetForm() {
		formData = { dkbAll: '', dkbDepot: '', zkbAll: '' };
		formErrors = { dkbAll: '', dkbDepot: '', zkbAll: '' };
		message = '';
		value = [parseDate(new Date().toISOString().split('T')[0])];
	}

	function handleInput(field: keyof typeof formData) {
		return (event: Event) => {
			const target = event.target as HTMLInputElement;
			formData[field] = target.value;
			// Clear error when user starts typing
			if (formErrors[field]) {
				formErrors[field] = '';
			}
		};
	}

	const handleSubmit = () => {
		return async ({ result }: { result: any }) => {
			console.log('Form result:', result);

			if (result.type === 'success') {
				message = result.data?.message || 'portfolio item saved successfully!';

				// Update parent component with new portfolio data
				if (result.data?.portfolio && onPortfolioAdded) {
					onPortfolioAdded(result.data.portfolio);
				}

				// Close dialog and reset form after short delay
				setTimeout(() => {
					resetForm();
					isDialogOpen = false;
				}, 1000);
			} else if (result.type === 'failure') {
				message = result.data?.message || 'Error saving portfolio item. Please try again.';
			} else {
				message = 'An unexpected error occurred.';
			}

			submitting = false;
		};
	};

	function onSubmit(event: Event) {
		if (!validateForm()) {
			event.preventDefault();
			return false;
		}
		submitting = true;
		message = '';
		return true;
	}
</script>

<Dialog open={isDialogOpen} onOpenChange={(details) => (isDialogOpen = details.open)}>
	<Dialog.Trigger class={buttonStyle}><SquarePlus class={iconStyle} /></Dialog.Trigger>
	<SkeletonPortal>
		<Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
		<Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 w-full max-w-xl p-4 space-y-4 shadow-xl {animation}">
				<header class="flex justify-between items-center">
					<Dialog.Title class="text-lg font-bold">Add portfolio item</Dialog.Title>
					<Dialog.CloseTrigger class="btn-icon hover:preset-tonal">
						<XIcon class="size-4" />
					</Dialog.CloseTrigger>
				</header>
				<Dialog.Description>
					<form method="POST" class="w-full space-y-4 p-4" use:enhance={handleSubmit} onsubmit={onSubmit}>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal">Date</div>
							<DatePicker locale="de-DE" {value} onValueChange={(e: any) => (value = e.value)}>
								<DatePicker.Control>
									<DatePicker.Input placeholder="mm/dd/yyyy" />
									<DatePicker.Trigger />
								</DatePicker.Control>
								<SkeletonPortal>
									<DatePicker.Positioner class="!z-[9999]">
										<DatePicker.Content class="!z-[9999]">
											<DatePicker.View view="day">
												<DatePicker.Context>
													{#snippet children(datePicker: any)}
														<DatePicker.ViewControl>
															<DatePicker.PrevTrigger />
															<DatePicker.ViewTrigger>
																<DatePicker.RangeText />
															</DatePicker.ViewTrigger>
															<DatePicker.NextTrigger />
														</DatePicker.ViewControl>
														<DatePicker.Table>
															<DatePicker.TableHead>
																<DatePicker.TableRow>
																	{#each datePicker().weekDays as weekDay, id (id)}
																		<DatePicker.TableHeader>{weekDay.short}</DatePicker.TableHeader>
																	{/each}
																</DatePicker.TableRow>
															</DatePicker.TableHead>
															<DatePicker.TableBody>
																{#each datePicker().weeks as week, id (id)}
																	<DatePicker.TableRow>
																		{#each week as day, id (id)}
																			<DatePicker.TableCell value={day}>
																				<DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
																			</DatePicker.TableCell>
																		{/each}
																	</DatePicker.TableRow>
																{/each}
															</DatePicker.TableBody>
														</DatePicker.Table>
													{/snippet}
												</DatePicker.Context>
											</DatePicker.View>
											<DatePicker.View view="month">
												<DatePicker.Context>
													{#snippet children(datePicker: any)}
														<DatePicker.ViewControl>
															<DatePicker.PrevTrigger />
															<DatePicker.ViewTrigger>
																<DatePicker.RangeText />
															</DatePicker.ViewTrigger>
															<DatePicker.NextTrigger />
														</DatePicker.ViewControl>
														<DatePicker.Table>
															<DatePicker.TableBody>
																{#each datePicker().getMonthsGrid({ columns: 4, format: 'short' }) as months, id (id)}
																	<DatePicker.TableRow>
																		{#each months as month, id (id)}
																			<DatePicker.TableCell value={month.value}>
																				<DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
																			</DatePicker.TableCell>
																		{/each}
																	</DatePicker.TableRow>
																{/each}
															</DatePicker.TableBody>
														</DatePicker.Table>
													{/snippet}
												</DatePicker.Context>
											</DatePicker.View>
											<DatePicker.View view="year">
												<DatePicker.Context>
													{#snippet children(datePicker: any)}
														<DatePicker.ViewControl>
															<DatePicker.PrevTrigger />
															<DatePicker.ViewTrigger>
																<DatePicker.RangeText />
															</DatePicker.ViewTrigger>
															<DatePicker.NextTrigger />
														</DatePicker.ViewControl>
														<DatePicker.Table>
															<DatePicker.TableBody>
																{#each datePicker().getYearsGrid({ columns: 4 }) as years, id (id)}
																	<DatePicker.TableRow>
																		{#each years as year, id (id)}
																			<DatePicker.TableCell value={year.value}>
																				<DatePicker.TableCellTrigger>{year.label}</DatePicker.TableCellTrigger>
																			</DatePicker.TableCell>
																		{/each}
																	</DatePicker.TableRow>
																{/each}
															</DatePicker.TableBody>
														</DatePicker.Table>
													{/snippet}
												</DatePicker.Context>
											</DatePicker.View>
										</DatePicker.Content>
									</DatePicker.Positioner>
								</SkeletonPortal>
							</DatePicker>
						</div>

						<!-- Hidden input for date -->
						<input type="hidden" name="date" value={value.at(0)?.toString()} />

						<!-- DKB -->
						<div class="space-y-1">
							<div class="input-group grid-cols-[auto_1fr_auto]" class:border-error-500={formErrors.dkbAll}>
								<div class="ig-cell preset-tonal">EUR</div>
								<input class="ig-input" class:border-error-500={formErrors.dkbAll} type="number" step="0.01" name="dkbAll" placeholder="DKB All" bind:value={formData.dkbAll} oninput={handleInput('dkbAll')} required />
							</div>
							{#if formErrors.dkbAll}
								<div class="text-error-500 text-sm">{formErrors.dkbAll}</div>
							{/if}
						</div>

						<!-- Depot -->
						<div class="space-y-1">
							<div class="input-group grid-cols-[auto_1fr_auto]" class:border-error-500={formErrors.dkbDepot}>
								<div class="ig-cell preset-tonal">EUR</div>
								<input class="ig-input" class:border-error-500={formErrors.dkbDepot} type="number" step="0.01" name="dkbDepot" placeholder="DKB Depot" bind:value={formData.dkbDepot} oninput={handleInput('dkbDepot')} required />
							</div>
							{#if formErrors.dkbDepot}
								<div class="text-error-500 text-sm">{formErrors.dkbDepot}</div>
							{/if}
						</div>

						<!-- ZKB -->
						<div class="space-y-1">
							<div class="input-group grid-cols-[auto_1fr_auto]" class:border-error-500={formErrors.zkbAll}>
								<div class="ig-cell preset-tonal">CHF</div>
								<input class="ig-input" class:border-error-500={formErrors.zkbAll} type="number" step="0.01" name="zkbAll" placeholder="ZKB All" bind:value={formData.zkbAll} oninput={handleInput('zkbAll')} required />
							</div>
							{#if formErrors.zkbAll}
								<div class="text-error-500 text-sm">{formErrors.zkbAll}</div>
							{/if}
						</div>

						{#if message}
							<div class="alert alert-glass variant-filled-{message.includes('success') ? 'success' : 'error'}">
								<div class="alert-message">
									<p>{message}</p>
								</div>
							</div>
						{/if}

						<fieldset class="flex justify-end gap-2">
							<Dialog.CloseTrigger class="btn preset-tonal" on:click={resetForm} disabled={submitting}>Cancel</Dialog.CloseTrigger>
							<button type="submit" class="btn preset-outlined-surface-300-700" disabled={submitting}>
								{submitting ? 'Saving...' : 'Submit'}
							</button>
						</fieldset>
					</form>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</SkeletonPortal>
</Dialog>

<style>
	.border-error-500 {
		border-color: rgb(var(--color-error-500)) !important;
	}

	.text-error-500 {
		color: rgb(var(--color-error-500));
	}
</style>
