<script setup>
const router = useRouter()
const usuario = ref(JSON.parse(localStorage.getItem('userData')))

const cerrarSesion = () => {
  localStorage.removeItem('userData')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('userAbilities')
  localStorage.removeItem('refresh')
  router.push('/login');
}
</script>

<template>
  <VBadge dot location="bottom right" offset-x="3" offset-y="3" bordered color="success">
    <div class="d-sm-flex  align-items-center justify-content-center user-nav mr-2">
      <div class="user-text cursor-pointer d-sm-flex  d-none ">
        <VLabel class="font-weight-bold text-uppercase cursor-pointer">{{ usuario.nombre_apellido }}</VLabel>
        <VLabel class="user-status cursor-pointer">{{ usuario.usuario }}</VLabel>
      </div>
      <VAvatar class="cursor-pointer" color="primary" variant="tonal">
        <VIcon color="" size="25" icon="tabler-user" />
      </VAvatar>
      <!-- SECTION Menu -->
      <VMenu class="conteiner-menu" activator="parent" width="230" max-width="230" min-width="230" location="bottom end"
        offset="14px">

        <VList>
          <VListItem class="user-menu">
            <template #prepend>
              <VListItemAction start>
                <VBadge dot location="bottom right" offset-x="3" offset-y="3" color="success">
                  <VAvatar color="primary" variant="tonal">
                    <VIcon color="" size="25" icon="tabler-user" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ usuario.nombre_apellido }}
            </VListItemTitle>
            <VListItemSubtitle>{{ usuario.usuario }}</VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2 user-menu" />

          <!-- 👉 Profile -->
          <VListItem link to="/perfil">

            <template #prepend>
              <VIcon class="me-2" icon="tabler-user" size="22" />
            </template>

            <VListItemTitle>Perfil</VListItemTitle>
          </VListItem>
          <VDivider class="my-2 d-sm-flex  d-none" />
          <!-- 👉 Settings -->
          <!-- <VListItem link>

            <template #prepend>
              <VIcon class="me-2" icon="tabler-settings" size="22" />
            </template>

            <VListItemTitle>Configuración</VListItemTitle>
          </VListItem> -->

          <!-- 👉 Logout -->
          <VListItem @click="cerrarSesion">

            <template #prepend>
              <VIcon class="me-2" icon="tabler-logout" size="22" />
            </template>

            <VListItemTitle>Cerrar Sesión</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </div>
  </VBadge>
</template>
