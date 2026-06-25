<template>
  <div class="min-h-full">
    <AppHeader />
    <main class="mx-auto w-full max-w-5xl px-4 pt-6 pb-[calc(6rem+var(--safe-bottom))] sm:px-6">
      <slot />
    </main>
    <AppTabbar />
  </div>
</template>
