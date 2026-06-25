<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 sm:px-6" style="padding-bottom: calc(6rem + var(--safe-bottom))">
      <slot />
    </main>
    <AppTabbar />
  </div>
</template>
