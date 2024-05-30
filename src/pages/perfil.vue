<script setup>
import { VBreadcrumbs, VToast } from "@/views/components/index";
import axios from "@axios";
import { onMounted } from "vue";


const itemsHeader = ref([
    {
        name: 'Inicio',
        path: 'citas',
        icon: 'tabler-calendar-search',
        isActiveUrl: true
    },
    {
        name: 'Perfil',
        path: '',
        icon: 'tabler-user',
        isActiveUrl: false
    }
])

const dataUsuario = ref([])
const loadings = ref([])
const usuario = ref(JSON.parse(localStorage.getItem('userData')))
const nombre = ref("")
const dni = ref("")
const direccion = ref("")
const sexo = ref("")
const numCel = ref("")
const correo = ref("")
const isActive = ref(true)
const apellido = ref('')


//*variables del toast*///
const valueToas = ref({})
const timer = ref(null)

const fetchGet = async (url, keyData, load) => {
    keyData.value = []
    load = true
    keyData.value = await axios.get(url).then(res => res.data.data).catch(error => [])
    load = false
}

const fetchPut = async (url, load, data) => {
    load = true
    const result = await axios.put(url, data).then(res => res).catch(error => [])

    if (result.status == 200 && !result.data.is_error) {
        valueToas.value = {
            'status': true,
            'title': '¡Operacion con exito 🥳!',
            'menssage': result.data.message,
            'type': 'success'
        }
    } else {
        valueToas.value = {
            'status': true,
            'title': 'Operación sin exito 😞!',
            'menssage': result.data.message,
            'type': 'warning'
        }
    }
    load = false

    eventMause()
}

const listaUsuarios = async () => await fetchGet(`backend-citas/lista-usuario-id/${usuario.value.documento}/`, dataUsuario, loadings.value[0])

const items = () => {
    if (dataUsuario.value[0] != undefined) {
        nombre.value = dataUsuario.value[0].nombre
        apellido.value = dataUsuario.value[0].apellido
        dni.value = dataUsuario.value[0]?.document_number
        direccion.value = dataUsuario.value[0]?.direccion
        sexo.value = dataUsuario.value[0]?.sexo
        numCel.value = dataUsuario.value[0]?.num_cel
        correo.value = dataUsuario.value[0]?.correo
    }
}

const updateUsuario = async () => {
    var data = {
        document_number: dni.value,
        first_name: nombre.value,
        last_name: apellido.value,
        direccion: direccion.value,
        email: correo.value,
        sexo: sexo.value,
        num_cel: numCel.value,
    }

    await fetchPut(`backend-citas/actualizar-perfil/${usuario.value.user_id}/`, loadings.value[1], data)

    isActive.value = true
}
onMounted(() => {
    listaUsuarios()
})

watch(dataUsuario, items)

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
        <VToast :icon="valueToas.icon" :title="valueToas.title" :menssage="valueToas.menssage"
            :status="valueToas.status" :type="valueToas.type" @closeToast="closeToast" @mouseover="eventMouseover"
            @mouseleave="eventMause"> </VToast>
        <VBreadcrumbs :items="itemsHeader"></VBreadcrumbs>

        <div v-if="dataUsuario[0] != undefined" class="d-flex  align-center gap-5 w-100">
            <div class="container-perfil-logo">
                <svg v-if="['Masculino', ''].includes(dataUsuario[0].sexo)" fill="#000000" height="256px" width="256px"
                    version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 485 485" xml:space="preserve">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <g>
                            <g>
                                <g>
                                    <path
                                        d="M340.4,360.552c-8.931-4.704-30.922-17.164-40.4-26.105v-24.298c30.418-17.386,51.203-48.561,57.822-86.708 C375.028,218.505,390,202.356,390,187.5c0-15.043-11.308-25.026-30-27.094V52.06l-0.052-0.438C359.7,49.515,352.603,0,242.5,0 S125.3,49.515,125.052,51.623L125,52.06v108.346c-18.692,2.068-30,12.051-30,27.094c0,14.856,14.972,31.005,32.178,35.94 c6.619,38.146,27.405,69.322,57.822,86.708v24.299c-9.483,8.947-31.496,21.416-40.416,26.114 c-97.483,31.626-99.543,89.368-99.583,91.816L45,485h395v-32.541C439.986,449.996,438.545,391.89,340.4,360.552z M360,175.482 c13.367,1.874,15,8.786,15,12.018c0,6.131-6.637,14.48-15.286,19.081C359.899,203.496,360,175.482,360,175.482z M110,187.5 c0-3.232,1.633-10.144,15-12.018c0,0,0.102,28.014,0.286,31.099C116.637,201.98,110,193.631,110,187.5z M140.001,53.169 c0.404-1.796,2.797-9.92,14.213-18.287C166.59,25.812,191.953,15,242.5,15s75.91,10.812,88.286,19.882 c11.416,8.367,13.809,16.491,14.214,18.287v71.286c-6.431-1.002-11.355-3.389-14.679-7.144 c-6.676-7.54-5.396-18.744-5.388-18.813L326.074,90H158.926l1.141,8.498c0.015,0.11,1.289,11.181-5.314,18.73 c-3.326,3.802-8.274,6.218-14.752,7.227V53.169z M140,139.595c11.141-1.259,19.88-5.445,26.042-12.491 c6.313-7.216,8.357-15.847,8.927-22.104h135.063c0.569,6.257,2.614,14.887,8.927,22.104c6.162,7.046,14.901,11.232,26.042,12.491 V165h-15v-15H255v18.638c-4.012-2.036-8.455-3.638-12.5-3.638s-8.488,1.603-12.5,3.638V150h-75v15h-15V139.595z M315,165v17.5 c0,6.893-5.607,12.5-12.5,12.5h-20c-6.893,0-12.5-5.607-12.5-12.5V165H315z M215,165v17.5c0,6.893-5.607,12.5-12.5,12.5h-20 c-6.893,0-12.5-5.607-12.5-12.5V165H215z M141.3,216.777l-0.058-0.507c-0.836-6.688-1.242-12.827-1.242-18.77V180h15v2.5 c0,15.164,12.337,27.5,27.5,27.5h20c13.834,0,25.311-10.271,27.217-23.586c4.586-3.319,10.246-6.414,12.783-6.414 c2.518,0,8.185,3.1,12.784,6.42C257.193,199.733,268.668,210,282.5,210h20c15.163,0,27.5-12.336,27.5-27.5V180h15v17.5 c0,5.943-0.406,12.083-1.242,18.77l-0.037,0.359c-5.226,37.115-25.136,67.138-54.666,82.409l-1.03,0.533l-0.066,0.066 C274.213,306.514,258.923,310,242.5,310c-16.408,0-31.687-3.48-45.458-10.363l-1.097-0.599 C166.455,283.788,146.559,253.823,141.3,216.777z M198.093,342.497l1.907-2.135v-23.049c13.218,5.099,27.464,7.687,42.5,7.687 c15.043,0,29.295-2.59,42.5-7.685v23.047l1.907,2.135c8.658,9.691,29.001,21.693,40.031,27.818 c-2.833,3.856-7.421,9.115-14.265,14.333C295.207,397.962,270.941,405,242.5,405c-28.441,0-52.707-7.038-70.173-20.353 c-6.847-5.22-11.436-10.482-14.266-14.332C169.09,364.191,189.434,352.188,198.093,342.497z M425,470L425,470H60v-17.362 c0.048-0.88,0.904-12.937,11.582-28.015c17.421-24.602,47.985-39.528,72.51-48.069C152.818,389.75,179.673,420,242.5,420 c62.868,0,89.717-30.289,98.424-43.471c24.673,8.46,55.39,23.31,72.708,47.956c10.718,15.254,11.344,27.458,11.368,28.096V470z">
                                    </path>
                                    <path d="M242.5,235h20v-15H250v-17.5h-15v25C235,231.642,238.357,235,242.5,235z">
                                    </path>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>

                <svg v-else fill="#000000" height="256px" width="256px" version="1.1" id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 485 485"
                    xml:space="preserve">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <g>
                            <g>
                                <g>
                                    <path
                                        d="M340.386,360.548c-0.549-0.291-3.186-1.781-3.186-1.781c-3.458-1.825-15.102-8.654-15.568-8.899 c-2.77-1.707-5.312-3.328-7.645-4.867H390V117.5c0-26.125-10.432-55.357-27.906-78.195C342.701,13.959,317.985,0,292.5,0h-100 c-25.485,0-50.201,13.959-69.594,39.305C105.432,62.143,95,91.375,95,117.5V345h76.101c-3.378,2.243-6.402,4.119-8.178,5.217 c-1.16,0.638-16.538,9.403-18.328,10.339C47.112,392.182,45.04,449.929,45,452.376V485h395v-32.541 C439.986,449.996,438.548,391.884,340.386,360.548z M110,330V117.5c0-22.944,9.278-48.769,24.819-69.08 C151.308,26.869,171.793,15,192.5,15h100c20.707,0,41.191,11.869,57.681,33.42C365.722,68.731,375,94.556,375,117.5V330h-75 v-19.843c17.823-10.189,32.659-25.413,43.089-44.278C354.152,245.868,360,222.223,360,197.5V145h-7.5 c-46.592,0-104.933-43.077-105.515-43.511L235,92.545v14.671c-0.555,1.136-6.129,9.691-52.489,24.101 c-25.934,8.061-51.4,13.808-51.654,13.865L125,146.498V197.5c0,24.723,5.848,48.368,16.912,68.379 c10.43,18.865,25.265,34.089,43.088,44.278V330H110z M255,170v18.638c-4.012-2.036-8.455-3.638-12.5-3.638 s-8.488,1.603-12.5,3.638V170h-75v15h-15v-26.555c9.647-2.313,29.802-7.358,49.765-13.683 c33.569-10.635,48.771-19.127,55.41-26.207C261.952,129.926,305.091,156.58,345,159.7V185h-15v-15H255z M315,185v17.5 c0,6.893-5.607,12.5-12.5,12.5h-20c-6.893,0-12.5-5.607-12.5-12.5V185H315z M215,185v17.5c0,6.893-5.607,12.5-12.5,12.5h-20 c-6.893,0-12.5-5.607-12.5-12.5V185H215z M155,200v2.5c0,15.164,12.336,27.5,27.5,27.5h20c13.835,0,25.311-10.271,27.217-23.586 c4.586-3.319,10.246-6.414,12.783-6.414c2.518,0,8.185,3.1,12.784,6.42C257.193,219.733,268.668,230,282.5,230h20 c15.163,0,27.5-12.336,27.5-27.5V200h14.963c-0.376,21.275-5.534,41.497-15.001,58.621 c-9.771,17.673-23.915,31.648-40.901,40.414l-1.034,0.534l-0.068,0.069C274.213,306.514,258.923,310,242.5,310 c-16.408,0-31.687-3.48-45.458-10.363l-1.103-0.602c-16.986-8.766-31.129-22.741-40.901-40.414 c-9.468-17.125-14.626-37.346-15.002-58.621H155z M292.735,348.057c3.535,2.961,8.061,6.237,13.682,9.919L250,414.394v-44.873 C269.807,367.039,285.03,355.308,292.735,348.057z M60,470v-17.409c0.055-1.472,2.632-47.243,82.668-75.54L172.243,470H60z M235,470h-47.016l-31.446-98.83c2.442-1.339,5.523-3.066,8.95-5.076L235,435.606V470z M235,414.393L178.606,358 c5.607-3.697,10.132-6.984,13.659-9.943c7.706,7.251,22.929,18.982,42.735,21.464V414.393z M200,334.596v-17.283 c13.219,5.099,27.465,7.687,42.5,7.687c15.043,0,29.295-2.59,42.5-7.685v17.296C279.87,339.974,263.614,355,242.5,355 C221.523,355,205.154,339.945,200,334.596z M250,470v-34.394l69.491-69.49c3.278,1.894,6.293,3.555,8.758,4.877L292.247,470H250z M425,470H308.208l33.848-93.081c24.474,8.524,54.523,23.296,71.576,47.566c10.718,15.254,11.344,27.458,11.368,28.096V470z">
                                    </path>
                                    <path d="M242.5,255h20v-15H250v-17.5h-15v25C235,251.642,238.358,255,242.5,255z">
                                    </path>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>

                <div class="mb-2 mt-4">
                    <VChip color="success">
                        <VIcon start icon="tabler-star" />
                        {{ dataUsuario[0].tipo_usuario }}
                    </VChip>
                </div>
            </div>

            <div class="conteiner-perfil-articulo">

                <div class="w-100" :class="{ 'mb-2': !isActive }">
                    <input class="title-user w-100" type="text" v-model="nombre" :class="{ active: !isActive }"
                        :disabled="isActive">
                </div>

                <div class="mb-2 w-100">
                    <input class="title-user w-100" type="text" v-model="apellido" :class="{ active: !isActive }"
                        :disabled="isActive">
                </div>

                <div class="mb-2  d-flex align-center conteiner-input" :class="{ active: !isActive }">
                    <div class="input-icon">
                        <VIcon icon="tabler-certificate"></VIcon>
                    </div>
                    <input class="text-normal" type="text" v-model="dni" :disabled="isActive">
                </div>

                <div v-if="dataUsuario[0].direccion" class="mb-2 w-100 d-flex align-center conteiner-input"
                    :class="{ active: !isActive }">
                    <div class="input-icon">
                        <VIcon icon="tabler-map-pins"></VIcon>
                    </div>
                    <input class="text-normal" type="text" v-model="direccion" :disabled="isActive">
                </div>

                <div v-if="dataUsuario[0].sexo" class="mb-2 w-100 d-flex align-center conteiner-input"
                    :class="{ active: !isActive }">
                    <div class="input-icon">
                        <VIcon :icon="sexo == 'Masculino' ? 'tabler-man' : 'tabler-woman'"></VIcon>
                    </div>
                    <input class="text-normal" type="text" v-model="sexo" :disabled="isActive">
                </div>

                <div v-if="dataUsuario[0].num_cel" class="mb-2 w-100 d-flex align-center conteiner-input"
                    :class="{ active: !isActive }">
                    <div class="input-icon">
                        <VIcon icon="tabler-phone"></VIcon>
                    </div>
                    <input class="text-normal" type="text" v-model="numCel" :disabled="isActive">
                </div>

                <div v-if="dataUsuario[0].correo" class="mb-2 w-100 d-flex align-center conteiner-input"
                    :class="{ active: !isActive }">
                    <div class="input-icon">
                        <VIcon icon="tabler-send"></VIcon>
                    </div>
                    <input class="text-normal" type="text" v-model="correo" :disabled="isActive">
                </div>
            </div>
        </div>

        <div class="btn-container">
            <VBtn v-if="isActive" variant="outlined" color="info" type="submit" class="d-block mb-2 bt-login"
                @click="isActive = false">
                <VIcon start icon="tabler-edit" />
                editar
            </VBtn>

            <div v-else class="" style="display: ruby-text;">
                <VBtn variant="outlined" color="success" type="submit" class="d-block mb-2 bt-login"
                    @click="updateUsuario()">
                    <VIcon start icon="tabler-reload" />
                    Actualizar
                </VBtn>

                <VBtn variant="outlined" color="secundary" type="submit" class="d-block mb-2 bt-login ms-5"
                    @click="isActive = true">
                    <VIcon start icon="tabler-circle-off" />
                    Cancelar
                </VBtn>
            </div>

        </div>
        <div>

        </div>
    </div>
</template>

<route lang="yaml">
    meta:
      action: read
      subject: Inicio
  </route>