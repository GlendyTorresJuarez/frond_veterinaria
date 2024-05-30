<script setup>
import vdFondo from "@/assets/video/vdFondoVeterinaria.mp4";
import { useAppAbility } from "@/plugins/casl/useAppAbility";
import { VToast } from "@/views/components";
import axios from '@axios';
import { themeConfig } from "@themeConfig";

const usuario = ref(JSON.parse(localStorage.getItem('userData')))
const isPasswordVisible = ref(false);
const user = ref("");
const password = ref("");
const router = useRouter();
const rememberMe = ref(false);
const loadings = ref([]);
const ability = useAppAbility();
const valueToas = ref({});
const timer = ref(null);

const login = () => {
  loadings.value[0] = true;

  const userAbilities = [];

  var data = JSON.stringify({
    username: user.value,
    password: password.value,
  });

  if (user.value == "" || password.value == "") {
    loadings.value[0] = false;
    return false;
  }

  axios({
    method: "post",
    url: "backend-citas/obtener-token/",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  })
    .then((res) => {
      if (res.status == 200) {
        const { access, refresh } = res.data
        localStorage.setItem("accessToken", JSON.stringify(access));
        localStorage.setItem("refresh", JSON.stringify(refresh));

        var token = localStorage.getItem("accessToken");

        var usuario = JSON.parse(decodeURIComponent(escape(window.atob(token.split('.')[1]))))

        localStorage.setItem("userData", JSON.stringify(usuario));

        let menu = ''
        const userAbilities = []
        let permisos = []
        let pos = 0

        for (let value of usuario.permisos) {
          if (pos !== 0) {
            if (value.smenu !== menu) {
              userAbilities.push({ action: permisos, subject: menu });
              permisos = [];
            }
          }

          permisos = value.permiso;
          menu = value.menu

          pos++

          if (pos === usuario.permisos.length) {
            userAbilities.push({ action: value.permiso, subject: menu });
          }
        }

        userAbilities.push({ action: "read", subject: "Auth" });

        localStorage.setItem("userAbilities", JSON.stringify(userAbilities));
        ability.update(userAbilities);

        router.replace({ path: "/" });
      }
      loadings.value[0] = false;
    })
    .catch((err) => {
      console.log(err);
      valueToas.value = {
        status: true,
        title: "Datos incorrectos!",
        menssage: "Usuario o contraseña incorrecta!",
        type: "error",
      };
      loadings.value[0] = false;
    });

  eventMause();
};

function closeToast() {
  valueToas.value = {
    status: false,
  };
}

function eventMause() {
  timer.value = setTimeout(() => closeToast(), 5000);
}

function eventMouseover() {
  clearTimeout(timer.value);
}

onMounted(() => {
  // if (usuario.value != null) {
  //   router.push('/');
  // }
})
</script>

<template>
  <div>
    <VToast :icon="valueToas.icon" :title="valueToas.title" :menssage="valueToas.menssage" :status="valueToas.status"
      :type="valueToas.type" @closeToast="closeToast" @mouseover="eventMouseover" @mouseleave="eventMause">
    </VToast>
    <VRow no-gutters class="auth-wrapper login">
      <video class="video-silde active" :src="vdFondo" autoplay muted loop />
      <VCol lg="8" class="d-none d-lg-flex align-center justify-center"
        style="z-index: 8888; padding-right: 8rem; padding-left: 8rem">
        <div class="col-lg-6 mb-4 mb-lg-0 conteiner-externo w-50" style="z-index: 10">
          <div class="d-flex align-center">
            <img src="/logo.svg" class="icon" alt="Logo" style="width: 80px;" />
          </div>
          <h1 class="my-3 display-5 fw-bold ls-tight text-uppercase" style="color: hsl(218deg, 81%, 95%)">
            {{ themeConfig.app.title }}<br />
            <span style="color: rgb(180 255 111)"> CLINICA VETERINARIA CHAMPAGNAT</span>
          </h1>
          <p class="mb-4 opacity-90 text-justify" style="color: #fff">
            Tenemos como único propósito brindar la mejor atención veterinaria profesional, personalizada, atenta y
            llena
            de mucho amor para sus mascotas, que son miembros especiales de sus familias, asegurando su bienestar y
            recuperación. Contamos con la más alta tecnología médica y profesionalismo que siempre nos ha caracterizado.
            Priorizando siempre el bienestar de tu pequeño/a.
          </p>

          <VCol cols="12" class="d-flex align-center icon-dark">
            <VDivider style="color: #fff !important" />
            <NavbarThemeSwitcher class="me-2" />
            <VDivider />
          </VCol>
        </div>
      </VCol>

      <VCol cols="12" lg="4" class="d-flex align-center justify-center">
        <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4 bg-glass" style="z-index: 888">
          <VCardText>
            <h5 class="text-h5 font-weight-semibold mb-1">
              Bienvenido(a) al {{ themeConfig.app.title }}! 👋🏻
            </h5>
            <p class="mb-0">
              Ingresa tus datos y conoce nuestra experiencia web.
            </p>
          </VCardText>

          <VCardText class="mt-5">
            <VForm @submit.prevent="login">
              <VRow>
                <VCol cols="12">
                  <VTextField prepend-inner-icon="tabler-user" v-model="user" label="Usuario" type="text"
                    :rules="[(v) => !!v || 'El campo Usuario es obligatorio']" />
                </VCol>

                <VCol cols="12">
                  <VTextField prepend-inner-icon="tabler-brand-samsungpass" v-model="password" label="Contraseña"
                    :rules="[
      (v) => !!v || 'El campo Contraseña es obligatorio',
    ]" :type="isPasswordVisible ? 'text' : 'password'" :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
      " @click:append-inner="isPasswordVisible = !isPasswordVisible" />

                  <div class="d-flex align-center flex-wrap justify-space-between mt-2 mb-4">
                    <VCheckbox v-model="rememberMe" label="Recordar contraseña" />
                    <RouterLink class="text-primary ms-2  mb-1" :to="{ name: 'forgot-password' }">
                      ¿Olvidaste tu contraseña?
                    </RouterLink>

                  </div>

                  <VBtn v-if="!loadings[0]" variant="outlined" type="submit" class="d-block mb-2 bt-login">
                    Ingresar
                    <VIcon end icon="tabler-checkbox" />
                  </VBtn>
                  <VBtn v-else variant="outlined" type="botton" class="d-block mb-2 bt-load" disabled>
                    <box-icon color="#7367f0" name="refresh" animation="spin"></box-icon>
                    Accediendo...  
                  </VBtn>
                </VCol>

                <VCol cols="12" class="text-center">
                  <span>¿Nuevo en nuestra plataforma?</span>
                  <RouterLink class="text-primary ms-2" :to="{ name: 'register' }">
                    Crear una cuenta
                  </RouterLink>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
</route>
