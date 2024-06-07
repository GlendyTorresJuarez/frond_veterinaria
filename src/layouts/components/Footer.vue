<script setup>
import { VBarraNavegacion } from '@/views/components';
import axios from '@axios';
import { onMounted, ref } from 'vue';


const isActive = ref(false);
const dataPreguntaFrecuentes = ref([])
const loadings = ref([])
const headers = ref([
  {
    name: 'Asunto',
    key: 'asunto'
  },
  {
    name: 'Descripcion',
    key: 'descripcion',
  }
])
const getPreguntaFrecuentes = async () => {
  loadings.value[0] = true

  dataPreguntaFrecuentes.value = []
  dataPreguntaFrecuentes.value = await axios.get("backend-citas/lista-preguntas-frecuentes/").then(res => res.data.data).catch(error => error)
  dataPreguntaFrecuentes.value = dataPreguntaFrecuentes.value.filter(x => x.key_estado == 1)
  loadings.value[0] = false

}
onMounted(() => {
  getPreguntaFrecuentes()
})
</script>

<template>
  <div class="h-100 d-flex align-center justify-space-between">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center">
      &copy;
      {{ new Date().getFullYear() }}
      <span class="text-uppercase ms-1">COPYRIGHT Clinica Veterinaria Bamby Vet</span>
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <!--Hecho por ACN <VIcon color="#b9770e " icon="tabler-code"></VIcon>-->
    </span>
  </div>




  <div class="">
    <div class="container-pregunta-frecuente">
      <VBtn @click="isActive = true" class="btn-pregunta-frecuente" color="success">
        <VTooltip location="top" transition="scale-transition" activator="parent">
          <span>Mas información</span>
        </VTooltip>
        <VIcon size="20" icon="tabler-question-mark"></VIcon> Preguntas frecuentes
      </VBtn>
    </div>
    <VBarraNavegacion v-model:isActive="isActive" :headers="headers" :items="dataPreguntaFrecuentes" />
  </div>
</template>
