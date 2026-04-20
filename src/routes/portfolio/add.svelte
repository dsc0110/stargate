<script lang="ts">
	import { DatePicker, parseDate, Portal as SkeletonPortal, Dialog } from '@skeletonlabs/skeleton-svelte';
	import { enhance } from '$app/forms';
	import { XIcon, SquarePlus } from '@lucide/svelte';

	// The following animation is optional.
	// This may also be included inline.
	const animation = 'transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0';
	//let value = $state([parseDate('2025-10-15')]);
	let value = $state([parseDate(new Date().toISOString().split('T')[0])]);
	let submitting = $state(false);
	let message = $state('');

	const handleSubmit = () => {
		submitting = true;
		message = '';

		return async ({ result }: { result: any }) => {
			console.log('Form result:', result);

			if (result.type === 'success') {
				message = result.data.message || 'portfolio item saved successfully!';
			} else if (result.type === 'failure') {
				message = result.data?.message || 'Error saving portfolio item. Please try again.';
			} else {
				message = 'An unexpected error occurred.';
			}

			submitting = false;
		};
	};
</script>

<Dialog>
	<Dialog.Trigger class="btn preset-filled"><SquarePlus /></Dialog.Trigger>
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
					<form method="POST" class="w-full space-y-4 p-4" use:enhance={handleSubmit}>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal">Date</div>
							<DatePicker locale="de-DE" {value} onValueChange={(e: any) => (value = e.value)}>
								<DatePicker.Control>
									<DatePicker.Input placeholder="mm/dd/yyyy" />
									<DatePicker.Trigger />
								</DatePicker.Control>
								<SkeletonPortal>
									<DatePicker.Positioner>
										<DatePicker.Content>
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
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal">EUR</div>
							<input class="ig-input" type="number" step="0.01" name="dkbAll" placeholder="DKB All" required />
						</div>

						<!-- Depot -->
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal">EUR</div>
							<input class="ig-input" type="number" step="0.01" name="dkbDepot" placeholder="DKB Depot" required />
						</div>

						<!-- ZKB -->
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal">CHF</div>
							<input class="ig-input" type="number" step="0.01" name="zkbAll" placeholder="ZKB All" required />
						</div>

						{#if message}
							<div class="alert alert-glass variant-filled-{message.includes('success') ? 'success' : 'error'}">
								<div class="alert-message">
									<p>{message}</p>
								</div>
							</div>
						{/if}

						<fieldset class="flex justify-end">
							<Dialog.CloseTrigger class="btn preset-tonal">Cancel</Dialog.CloseTrigger>
							<Dialog.CloseTrigger type="submit" class="btn preset-outlined-surface-300-700" disabled={submitting}>
								{submitting ? 'Saving...' : 'Submit'}
							</Dialog.CloseTrigger>
							<!-- <button type="submit" class="btn preset-outlined-surface-300-700" disabled={submitting}> -->
							<!-- {submitting ? 'Saving...' : 'Submit'} -->
							<!-- </button> -->
						</fieldset>
					</form>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</SkeletonPortal>
</Dialog>
