<script lang="ts">
	import { DatePicker, parseDate, Portal as SkeletonPortal, Dialog } from '@skeletonlabs/skeleton-svelte';
	import { enhance } from '$app/forms';
	import { XIcon, SquarePlus } from '@lucide/svelte';
	import { SHARED_STYLES } from '$lib/shared-styles';

	// Props
	interface Props {
		onScaleResultAdded?: (scaleResults: any[]) => void;
	}

	let { onScaleResultAdded }: Props = $props();

	// Animation configuration
	const animation = 'transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0';

	// Dialog state
	let isDialogOpen = $state(false);

	// Form state
	let value = $state([parseDate(new Date().toISOString().split('T')[0])]);
	let submitting = $state(false);
	let message = $state('');
	let formData = $state({
		weight: '',
		bodyFat: ''
	});
	let formErrors = $state({
		weight: '',
		bodyFat: ''
	});

	// Validation functions
	function validateNumberField(value: string, fieldName: string): string {
		if (!value || value.trim() === '') {
			return `${fieldName} is required`;
		}
		const numValue = parseFloat(value);
		if (isNaN(numValue) || numValue <= 0) {
			return `Please enter a valid positive number for ${fieldName}`;
		}
		return '';
	}

	function validateForm(): boolean {
		formErrors.weight = validateNumberField(formData.weight, 'Weight');
		formErrors.bodyFat = validateNumberField(formData.bodyFat, 'Body Fat');

		return !formErrors.weight && !formErrors.bodyFat;
	}

	function resetForm() {
		formData = { weight: '', bodyFat: '' };
		formErrors = { weight: '', bodyFat: '' };
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
				message = result.data?.message || 'Scale result saved successfully!';

				// Update parent component with new scale data
				if (result.data?.scaleResults && onScaleResultAdded) {
					onScaleResultAdded(result.data.scaleResults);
				}

				// Close dialog and reset form after short delay
				setTimeout(() => {
					resetForm();
					isDialogOpen = false;
				}, 1000);
			} else if (result.type === 'failure') {
				message = result.data?.message || 'Error saving scale result. Please try again.';
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

<Dialog open={isDialogOpen} onOpenChange={(details: { open: boolean }) => (isDialogOpen = details.open)}>
	<Dialog.Trigger class={SHARED_STYLES.buttonGrey}><SquarePlus class={SHARED_STYLES.icon} /></Dialog.Trigger>
	<SkeletonPortal>
		<Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
		<Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 w-full max-w-xl p-4 space-y-4 shadow-xl {animation}">
				<header class="flex justify-between items-center">
					<Dialog.Title class="text-lg font-bold">Add Scale Result</Dialog.Title>
					<Dialog.CloseTrigger class={SHARED_STYLES.buttonIconClose}>
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

						<!-- Weight -->
						<div class="space-y-1">
							<div class="input-group grid-cols-[auto_1fr_auto]" class:border-error-500={formErrors.weight}>
								<div class="ig-cell preset-tonal">kg</div>
								<input class="ig-input" class:border-error-500={formErrors.weight} type="number" step="0.1" name="weight" placeholder="Weight" bind:value={formData.weight} oninput={handleInput('weight')} required />
							</div>
							{#if formErrors.weight}
								<div class="text-error-500 text-sm">{formErrors.weight}</div>
							{/if}
						</div>

						<!-- Body Fat -->
						<div class="space-y-1">
							<div class="input-group grid-cols-[auto_1fr_auto]" class:border-error-500={formErrors.bodyFat}>
								<div class="ig-cell preset-tonal">%</div>
								<input class="ig-input" class:border-error-500={formErrors.bodyFat} type="number" step="0.1" name="bodyFat" placeholder="Body Fat" bind:value={formData.bodyFat} oninput={handleInput('bodyFat')} required />
							</div>
							{#if formErrors.bodyFat}
								<div class="text-error-500 text-sm">{formErrors.bodyFat}</div>
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
							<Dialog.CloseTrigger class={SHARED_STYLES.buttonSecondary} onclick={resetForm} disabled={submitting}>Cancel</Dialog.CloseTrigger>
							<button type="submit" class={SHARED_STYLES.buttonPrimary} disabled={submitting}>
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
