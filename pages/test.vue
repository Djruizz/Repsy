<script setup lang="ts">
import { collection, getDocs } from "firebase/firestore";

const { $db } = useNuxtApp();

const testConnection = async () => {
  try {
    const querySnapshot = await getDocs(collection($db as any, "test"));
    console.log(
      "Conexión exitosa a Firestore. Documentos:",
      querySnapshot.size,
    );
  } catch (error) {
    console.error("Error al conectar con Firestore:", error);
  }
};

onMounted(() => {
  testConnection();
});
</script>

<template>
  <div>
    <h1>Firebase + Nuxt listo</h1>
  </div>
</template>
