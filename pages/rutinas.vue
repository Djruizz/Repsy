<template>
  <div class="space-y-6">
    <section class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white">Rutinas</h1>
        <p class="mt-1 text-sm text-slate-400">
          Rutinas libres — córrelas cuando quieras, sin día fijo
        </p>
      </div>
      <button class="px-4 py-2.5 text-sm btn-primary" @click="createRoutine">
        <AppIcon name="plus" class="w-4 h-4" /> Nueva rutina
      </button>
    </section>

    <div v-if="routines.length" class="space-y-2.5">
      <div
        v-for="r in routines"
        :key="r.id"
        class="flex items-center gap-4 p-4 transition surface group"
      >
        <div class="flex-1 min-w-0 cursor-pointer" @click="openRoutine(r)">
          <p class="text-base font-semibold text-white truncate">
            {{ r.routineName || "Rutina sin nombre" }}
          </p>
          <p v-if="r.description" class="mt-0.5 line-clamp-1 text-xs text-slate-400">
            {{ r.description }}
          </p>
          <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span v-if="exCount(r)" class="inline-flex items-center gap-1.5">
              <AppIcon name="dumbbell" class="h-3.5 w-3.5" />
              {{ exCount(r) }} ejercicios
            </span>
            <span v-if="restCount(r)" class="inline-flex items-center gap-1.5">
              <AppIcon name="clock" class="h-3.5 w-3.5" />
              {{ restCount(r) }}
            </span>
            <span v-if="!r.items.length" class="text-slate-500">Sin ejercicios</span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span
            v-if="runToday(r)"
            class="chip bg-lime/15 text-lime"
            title="Ya corriste esta rutina hoy"
          >
            <AppIcon name="check" class="h-3.5 w-3.5" :stroke-width="3" />
            Completada hoy
          </span>
          <button
            v-else-if="r.items.length"
            class="px-3 py-2 text-xs btn-primary"
            @click="navigateTo(`/correr/${r.id}`)"
          >
            <AppIcon name="play" class="w-4 h-4" /> Correr
          </button>
          <button
            class="grid h-9 w-9 place-items-center text-slate-400 transition rounded-lg hover:bg-white/5 hover:text-white"
            title="Eliminar rutina"
            @click="onDelete(r)"
          >
            <AppIcon name="trash" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <UiEmptyState
      v-else
      icon="dumbbell"
      title="Aún no tienes rutinas libres."
      subtitle="Crea rutinas sin día fijo para correrlas cuando quieras."
    />
  </div>
</template>

<script setup lang="ts">
import type { Day } from "~/types";
import { localDayKey, todayKey } from "~/composables/useCalendar";

const { routines, sessions, addRoutine, removeRoutine } = useGymData();

function exCount(r: Day): number {
  return r.items.filter((i) => i.type === "exercise").length;
}

function restCount(r: Day): number {
  return r.items.filter((i) => i.type === "rest").length;
}

function runToday(r: Day): boolean {
  return sessions.value.some(
    (s) =>
      s.dayId === r.id &&
      s.completed &&
      localDayKey(s.date) === todayKey(),
  );
}

function createRoutine() {
  const r = addRoutine();
  navigateTo(`/dia/${r.id}?edit`);
}

function openRoutine(r: Day) {
  navigateTo(`/dia/${r.id}`);
}

function onDelete(r: Day) {
  const name = r.routineName || "Rutina sin nombre";
  if (
    window.confirm(
      `¿Eliminar "${name}" y sus sesiones registradas? Esta acción no se puede deshacer.`,
    )
  ) {
    removeRoutine(r.id);
  }
}
</script>
