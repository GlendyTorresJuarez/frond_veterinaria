<script setup>
import { VToast } from "@/views/components";
import axios from "@axios";
import { VNodeRenderer } from '@layouts/components/VNodeRenderer';
import { themeConfig } from '@themeConfig';

const router = useRouter();
const usuario = ref('')
const correo = ref('')
const password = ref('')
const confirmarPassword = ref('')
const nombre = ref('')
const apellido = ref('')
const numCel = ref('')
const sexo = ref([])
const itemsSexo = ref(['Masculino', 'Femenino'])

const showPassword = ref(false)
const showConfPassword = ref(false)

const rules = ref({
  required: (v) => !!v || 'Campo requerido.',
  min: (v) => v.length >= 8 || 'Min 8 caracteres.'
})

const loadings = ref([])
const numDocumento = ref('')

//*variables del toast*///
const valueToas = ref({})
const timer = ref(null)

const registrarUsuario = async () => {
  loadings.value[1] = true

  var data = {
    document_number: numDocumento.value,
    first_name: nombre.value,
    last_name: apellido.value,
    username: usuario.value,
    password: password.value,
    email: correo.value,
    user_type: 3,
    status: 1,
    key_usuario: null
  }

  var isVerificar = numDocumento.value == '' ||
    nombre.value == '' ||
    apellido.value == '' ||
    usuario.value == '' ||
    password.value == '' ||
    correo.value == '' ||
    numCel.value == '' ||
    password.value.length <= 7 ||
    confirmarPassword.value.length <= 7 ||
    password.value != confirmarPassword.value


  if (isVerificar) {
    loadings.value[1] = false
    return false
  }

  await axios({
    method: 'POST',
    url: "backend-citas/agregar-usuario/",
    data: data
  }).then(res => {
    if (res.status == 200 && !res.data.is_error) {
      var cliente = registrarCliente()
      if (!cliente.is_error) {
        valueToas.value = {
          'status': true,
          'title': '¡Registro Creado 🥳!',
          'menssage': res.data.message,
          'type': 'success'
        }
        limpiar()
        router.replace({ path: "/login" });
      } else {
        valueToas.value = {
          'status': true,
          'title': 'Operación sin exito 😞!',
          'menssage': cliente.message,
          'type': 'warning'
        }
      }
    } else {
      valueToas.value = {
        'status': true,
        'title': 'Operación sin exito 😞!',
        'menssage': res.data.message,
        'type': 'warning'
      }
    }
  }).catch(err => {
    console.log(err);
  })

  loadings.value[1] = false
  eventMause();
}

const registrarCliente = async () => {
  var isError = false
  var message = ""
  var contexto = {}

  var data = {
    dni: numDocumento.value,
    nombre: nombre.value,
    apellido: apellido.value,
    direccion: null,
    num_cel: numCel.value,
    sexo: sexo.value,
    correo: correo.value,
    key_estado: 1,
    key_usuario: null,
  }

  await axios({
    method: 'POST',
    url: "backend-citas/agregar-clientes/",
    data: data
  }).then(res => {
    if (res.status == 200 && !res.data.is_error) {
      isError = false
      message = res.data.message
    } else {
      isError = true
      message = res.data.message
    }

    contexto = { "is_error": isError, "message": message }
  }).catch(err => {
    isError = true
    message = err

    contexto = { "is_error": isError, "message": message }
  })

  return contexto
};

const buscarPersonal = async () => {
  loadings.value[5] = true
  var datos = []
  if (numDocumento.value.length <= 7) {
    loadings.value[5] = false
    return false
  }

  datos = await axios.get(`backend-citas/consultar-dni/${numDocumento.value}`).then(res => res.data.data)

  if (datos.nombres != undefined) {
    nombre.value = datos.nombres
    apellido.value = `${datos.apellidoPaterno} ${datos.apellidoMaterno}`
  } else {
    limpiar()
  }
  loadings.value[5] = false
}

const limpiar = () => {
  usuario.value = ''
  correo.value = ''
  password.value = ''
  confirmarPassword.value = ''
  nombre.value = ''
  apellido.value = ''
  numCel.value = ''
  sexo.value = []
  numDocumento.value = ''
}

const confirmedValidator = (confirmarPassword, password) => {
  return password == confirmarPassword || 'El campo Confirmar contraseña no coincide'
}

/*======eventos Toast=============*/
function closeToast() {
  valueToas.value = {
    'status': false,
  }
}

function eventMause() {
  timer.value = setTimeout(() => closeToast(), 5000);
}

function eventMouseover() {
  clearTimeout(timer.value);
}
</script>

<template>
  <div>
    <VToast :icon="valueToas.icon" :title="valueToas.title" :menssage="valueToas.menssage" :status="valueToas.status"
      :type="valueToas.type" @closeToast="closeToast" @mouseover="eventMouseover" @mouseleave="eventMause"> </VToast>

    <VRow no-gutters class="auth-wrapper bg-surface">
      <VCol lg="8" class="d-none d-lg-flex">
        <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
          <div class="d-flex align-center justify-center w-100 h-100">
            <VImg max-width="441" :src="imageVariant" class="auth-illustration mt-16 mb-2" />
          </div>

          <VImg class="auth-footer-mask" :src="authThemeMask" />
        </div>
      </VCol>

      <VCol cols="12" lg="4" class="d-flex align-center justify-center">
        <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
          <VCardText>
            <VNodeRenderer :nodes="themeConfig.app.logo" class="mb-6" />
            <h5 class="text-h5 mb-1">
              Registrate ahora 🚀
            </h5>
            <p class="mb-0">
              ¡Haz que la gestión de citas sea fácil y divertida!
            </p>
          </VCardText>

          <VCardText>
            <VForm @submit.prevent="registrarUsuario()">
              <VRow>
                <VCol cols="12" sm="12" md="12">
                  <VTextField v-model="numDocumento" label="Documento de identidad"
                    :rules="[(v) => !!v || 'Campo requerido']" type="text" append-inner-icon="tabler-search"
                    @click:append-inner="buscarPersonal()" :loading="loadings[5]" :disabled="loadings[5]" />
                </VCol>

                <VCol cols="12" sm="12" md="12">
                  <VTextField prepend-inner-icon="tabler-signature" v-model="nombre" label="Nombres"
                    :rules="[(v) => !!v || 'Campo requerido']" />
                </VCol>

                <VCol cols="12" sm="12" md="12">
                  <VTextField prepend-inner-icon="tabler-brand-lastfm" v-model="apellido" label="Apellidos"
                    :rules="[(v) => !!v || 'Campo requerido']" />
                </VCol>

                <VCol cols="12" sm="6" md="6">
                  <VTextField prepend-inner-icon="tabler-device-mobile" v-model="numCel" label="Nro. Celular"
                    :rules="[(v) => !!v || 'Campo requerido']" />
                </VCol>

                <VCol cols="12" sm="6" md="6">
                  <VAutocomplete prepend-inner-icon="tabler-friends" variant="outlined" v-model="sexo" label="Sexo"
                    :items="itemsSexo" :rules="[(v) => !!v || 'Campo requerido']" />
                </VCol>

                <VCol cols="12" sm="6" md="6">
                  <VTextField prepend-inner-icon="tabler-mail" v-model="correo" label="Correo"
                    :rules="[(v) => !!v || 'Campo requerido']" />
                </VCol>

                <VCol cols="12" sm="6" md="6">
                  <VTextField prepend-inner-icon="tabler-user-plus" v-model="usuario" label="Usuario"
                    :rules="[(v) => !!v || 'Campo requerido']" />
                </VCol>

                <VCol cols="12" sm="6" md="6">
                  <VTextField v-model="password" spellcheck="false" autocomplete="off"
                    :append-inner-icon="showPassword ? 'tabler-eye-off' : 'tabler-eye'"
                    :rules="[rules.required, rules.min]" :type="showPassword ? 'text' : 'password'" name="input-10-1"
                    label="Contraseña" hint="At least 8 characters" counter
                    @click:append-inner="showPassword = !showPassword" />
                </VCol>
                <VCol cols="12" sm="6" md="6">
                  <VTextField v-model="confirmarPassword" spellcheck="false" autocomplete="off"
                    :append-inner-icon="showConfPassword ? 'tabler-eye-off' : 'tabler-eye'"
                    :rules="[rules.required, rules.min, confirmedValidator(confirmarPassword, password)]"
                    :type="showConfPassword ? 'text' : 'password'" name="input-10-1" label="Confirmar Contraseña"
                    hint="At least 8 characters" counter @click:append-inner="showConfPassword = !showConfPassword" />
                </VCol>

                <!-- BUTTON -->
                <VCol cols="12">
                  <VBtn :loading="loadings[1]" :disabled="loadings[1]" class="mt-2" block type="submit">
                    Inscribirse
                    <template #loader>
                      <span class="custom-loader">
                        <VIcon icon="tabler-refresh" />
                      </span>
                      <span>Cargando...</span>
                    </template>
                  </VBtn>
                </VCol>

                <!-- create account -->
                <VCol cols="12" class="text-center text-base">
                  <span>¿Ya tienes una cuenta? </span>
                  <RouterLink class="text-primary ms-2" :to="{ name: 'login' }">
                    Inicia sesión en su lugar
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
  redirectIfLoggedIn: true
</route>
