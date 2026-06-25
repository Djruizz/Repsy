<template>
  <div class="min-h-full">
    <AppHeader />
    <main class="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6" style="padding-bottom: calc(6rem + var(--safe-bottom))">
      <slot />
    </main>
    <AppTabbar />
  </div>
</template>
