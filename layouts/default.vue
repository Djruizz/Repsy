<template>
  <div class="min-h-full">
    <AppHeader />
    <main class="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6" style="padding-top: calc(1.5rem + var(--safe-top))">
      <slot />
    </main>
    <AppTabbar />
  </div>
</template>
