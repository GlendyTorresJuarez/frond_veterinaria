<script setup>
import page401 from '@/assets/images/authorized.svg';
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant';
import miscMaskDark from '@images/pages/misc-mask-dark.png';
import miscMaskLight from '@images/pages/misc-mask-light.png';

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)
</script>

<template>
  <div class="d-flex  justify-center align-center" style="height: 100vh;">

    <div class="d-flex  justify-center" style="width: 30%;">
      <VImg :src="page401" alt="Coming Soon" :max-width="700" class="" />
    </div>

    <div class="text-center ms-5">
      <h4 class="text-h4 font-weight-medium mb-3">
        No estas autorizado! 🔐
      </h4>
      <p>No tienes permiso para acceder a esta página. ¡Volver atras!</p>
      <VBtn to="/" class="mb-12">
        ir ala pagina principal
      </VBtn>
    </div>
    <VImg :src="authThemeMask" class="misc-footer-img d-none d-md-block" />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
</route>
