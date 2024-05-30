<script setup>
import { VDataTable, VToast } from "@/views/components/index";
import axios from "@axios";
import moment from 'moment';

moment.lang("es", {
    months:
        "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
            "_"
        ),
    monthsShort: "Ene._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.".split(
        "_"
    ),
    weekdays: "Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado".split("_"),
    weekdaysShort: "Dom._Lun._Mar._Mier._Jue._Vier._Sab.".split("_"),
    weekdaysMin: "Do_Lu_Ma_Mi_Ju_Vi_Sa".split("_"),
});

const loadings = ref([])
const search = ref()
const idRaza = ref(0)
const dataRaza = ref([])
const modal = ref([])
const raza = ref('')
const descripcion = ref('')

const titleCrud = ref('')
const btnTextoCrud = ref('')

const iconConf = ref("");
const menssageConf = ref("");
const colorConf = ref("");
const confEvent = ref("");
const dataLog = ref([]);
const usuario = ref(JSON.parse(localStorage.getItem('userData')))

//*variables del toast*///
const valueToas = ref({})
const timer = ref(null)

const headerLog = ref([
    {
        title: 'evento',
        key: 'nombre'
    },
    {
        title: 'observación',
        key: 'descripcion'
    },
    {
        title: 'fecha y hora',
        key: 'date'
    },
    {
        title: 'usuario',
        key: 'usuario'
    },
]);

const header = ref([
    {
        title: "Acciones",
        key: "actions",
    },
    {
        title: "Estados",
        key: "status",
    },
    {
        title: "Razas",
        key: "nombre_raza",
    },
    {
        title: "Descripcion",
        key: "descripcion",
    },
])

const listaRaza = async () => {
    loadings.value[0] = true;
    dataRaza.value = []

    dataRaza.value = await axios.get('backend-citas/lista-razas/').then(res => res.data.data).catch(err => err)

    loadings.value[0] = false;
}

const eventoNuevo = () => {
    modal.value[0] = true;

    titleCrud.value = "Registrar razas";
    btnTextoCrud.value = "Guardar";
    limpiar()
}

const limpiar = () => {
    idRaza.value = 0
    raza.value = ''
    descripcion.value = ''
}

const eventoEditar = (items) => {
    modal.value[0] = true;

    titleCrud.value = "Actualizar razas";
    btnTextoCrud.value = "Actualizar";
    itemsCampos(items)
}

const itemsCampos = (items) => {
    idRaza.value = items.id
    raza.value = items.nombre_raza
    descripcion.value = items.descripcion
}

const eventoCrud = async () => {
    loadings.value[1] = true

    var data = {
        nombre_raza: raza.value,
        descripcion: descripcion.value,
        key_estado: 1,
        key_usuario: usuario.value.user_id,
    }

    var isVerificar = raza.value == ''

    if (isVerificar && idRaza.value == 0) {
        loadings.value[1] = false
        return false
    }

    await axios({
        method: idRaza.value == 0 ? 'POST' : 'PUT',
        url: idRaza.value == 0 ? "backend-citas/agregar-razas/" : `backend-citas/actualizar-razas/${idRaza.value}/`,
        data: data
    }).then(res => {
        console.log(res);
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': idRaza.value == 0 ? '¡Registro Creado 🥳!' : '¡Registro Actualizado 🥳!',
                'menssage': res.data.message,
                'type': 'success'
            }

            modal.value[0] = false
            listaRaza()
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
};

const eventoDialogo = (id, event) => {
    modal.value[1] = true

    if (event == 1) {
        iconConf.value = 'tabler-discount-off'
        menssageConf.value = 'Estas seguro de anular la raza?'
        colorConf.value = 'warning'
        confEvent.value = 1
    }
    if (event == 2) {
        iconConf.value = 'tabler-checks'
        menssageConf.value = 'Desea restaurar los datos ?'
        colorConf.value = 'success'
        confEvent.value = 2
    }
    if (event == 3) {
        iconConf.value = 'tabler-trash'
        menssageConf.value = 'Estas seguro de eliminar por completo los datos?'
        colorConf.value = 'error'
        confEvent.value = 3
    }
    idRaza.value = id
}

const eventoConfirmacion = async () => {
    loadings.value[2] = true
    var data = {
        key_estado: confEvent.value == 1 ? 2 : 1,
        key_usuario: usuario.value.user_id,
    }

    await axios({
        method: confEvent.value == 1 || confEvent.value == 2 ? 'PUT' : 'DELETE',
        url: `backend-citas/recuperar-eliminar-razas/${idRaza.value}/`,
        data: data
    }).then(res => {
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': confEvent.value == 1 ? '¡Registro anulado 😞!' : confEvent.value == 2 ? '¡Registro Restaurado 🥳!' : '¡Registro Eliminados 😞!',
                'menssage': res.data.message,
                'type': 'success'
            }
            modal.value[1] = false
            listaRaza()
        } else {
            valueToas.value = {
                'status': true,
                'title': 'Operación sin exito 😞!',
                'menssage': res.data.message,
                'type': 'warning'
            }
        }
    }).catch(err => {
        valueToas.value = {
            'status': true,
            'title': 'Operación sin exito 😞!',
            'menssage': err,
            'type': 'warning'
        }
    })

    loadings.value[2] = false
    eventMause()
}

const listaHistorial = async (items) => {
    modal.value[2] = true
    loadings.value[3] = true;
    dataLog.value = [];

    var data = {
        key_tabla: items.id,
        nombre_tabla: 'raza'
    }

    await axios({
        method: 'POST',
        url: 'backend-citas/lista-log/',
        data: data
    }).then(res => {
        dataLog.value = res.data.data
    }).catch(err => {
        console.log(err);
    })

    loadings.value[3] = false;
}

const exportDoc = async () => {
    loadings.value[4] = true;

    await axios({
        url: 'backend-citas/exportar-razas/',
        method: 'POST',
        responseType: "arraybuffer"
    }).then(res => {
        if (res.status == 200) {

            var fileURL = window.URL.createObjectURL(new Blob([res.data]));

            var fileLink = document.createElement("a");
            fileLink.href = fileURL;
            fileLink.setAttribute("download", "Razas.xlsx");
            document.body.appendChild(fileLink);
            fileLink.click();
            valueToas.value = {
                'status': true,
                'title': '¡Excel exportado 🥳!',
                'menssage': 'Los datos se exportaron correctamente',
                'type': 'success'
            }
        }
    })

    loadings.value[4] = false;
    eventMause()
}

onMounted(() => {
    listaRaza();
});

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
        <v-breadcrumbs class="mb-5" :items="['Inicio', 'Razas']">
            <template v-slot:prepend>
                <v-icon size="small" icon="tabler-home"></v-icon>
            </template>
        </v-breadcrumbs>

        <VToast :icon="valueToas.icon" :title="valueToas.title" :menssage="valueToas.menssage"
            :status="valueToas.status" :type="valueToas.type" @closeToast="closeToast" @mouseover="eventMouseover"
            @mouseleave="eventMause"> </VToast>

        <VRow class="mt-5">
            <VCol cols="12">
                <div class="button-compone">

                    <div class="container-btn">

                        <div class="content-btn primary">
                            <VBtn class="btn-action" width="100%" height="100%" icon color="default" variant="text"
                                @click="listaRaza()">
                                <VIcon color="primary" size="20" icon="tabler-refresh" />
                            </VBtn>
                            <div class="tooltip-btn primary tooltip-btn-top">
                                <span>Actualizar</span>
                            </div>
                        </div>

                        <div class="content-btn success">
                            <VBtn class="btn-action" width="100%" height="100%" icon color="default" variant="text"
                                @click="eventoNuevo()">
                                <VIcon color="success" size="20" icon="tabler-plus" />
                            </VBtn>
                            <div class="tooltip-btn success tooltip-btn-top">
                                <span>Nuevo</span>
                            </div>
                        </div>

                        <div class="content-btn primary">
                            <VBtn class="btn-action" @click="exportDoc()" :loading="loadings[4]" :disabled="loadings[4]"
                                width="100%" height="100%" icon color="default" variant="text">
                                <VIcon color="primary" size="20" icon="tabler-download" />
                            </VBtn>
                            <div class="tooltip-btn primary tooltip-btn-top">
                                <span>Exportar</span>
                            </div>
                        </div>

                    </div>
                </div>
            </VCol>
        </VRow>

        <VRow>
            <VCol>
                <div class="table">
                    <VDataTable :type="'full'" :headers="header" :items="dataRaza" :loadings="loadings[0]"
                        :search="search">
                        <template #actions="{ item }">
                            <div class="d-flex align-center justify-center">
                                <VBtn icon size="x-small" color="default" variant="text" @click="eventoEditar(item);">
                                    <VIcon color="info" size="19" icon="tabler-edit" />
                                </VBtn>

                                <VBtn v-if="item.key_estado == 1" icon size="x-small" color="default" variant="text"
                                    @click="eventoDialogo(item.id, 1)">
                                    <VIcon color="warning " size="19" icon="tabler-discount-off" />
                                </VBtn>

                                <VBtn v-else icon size="small" color="default" variant="text"
                                    @click="eventoDialogo(item.id, 2)">
                                    <VIcon color="success " size="19" icon="tabler-checks" />
                                </VBtn>

                                <VBtn icon size="x-small" color="default" variant="text"
                                    @click="eventoDialogo(item.id, 3)">
                                    <VIcon color="error" size="19" icon="tabler-trash" />
                                </VBtn>

                                <VBtn icon size="x-small" color="default" variant="text" @click="listaHistorial(item)">
                                    <VIcon color="primary" size="19" icon="tabler-history-toggle" />
                                </VBtn>
                            </div>
                        </template>

                        <template #status="{ item }">
                            <VChip label :color="item.color" size="small" class="text-capitalize">
                                {{ item.estado }}
                            </VChip>
                        </template>

                    </VDataTable>
                </div>
            </VCol>
        </VRow>

        <VDialog v-model="modal[0]" max-width="600">
            <!-- Dialog close btn -->
            <DialogCloseBtn @click="modal[0] = !modal[0]" />

            <!-- Dialog Content -->
            <VCard :title="titleCrud">
                <VForm @submit.prevent="eventoCrud()">
                    <VCardText>
                        <VRow>
                            <VCol cols="12" sm="12" md="12">
                                <VTextField prepend-inner-icon="tabler-paw" v-model="raza" label="Raza"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VTextarea prepend-inner-icon="tabler-message" v-model="descripcion"
                                    label="Descripción" />
                            </VCol>
                        </VRow>
                    </VCardText>

                    <VCardText class="d-flex justify-end flex-wrap gap-3">
                        <VBtn variant="tonal" color="secondary" @click="modal[0] = false">
                            Cerrar
                        </VBtn>
                        <VBtn :loading="loadings[1]" :disabled="loadings[1]" type="submit">
                            {{ btnTextoCrud }}
                            <template #loader>
                                <span class="custom-loader">
                                    <VIcon icon="tabler-refresh" />
                                </span>
                                <span>Cargando...</span>
                            </template>
                        </VBtn>
                    </VCardText>
                </VForm>
            </VCard>
        </VDialog>

        <VDialog v-model="modal[1]" persistent class="v-dialog-sm">
            <!-- Dialog Content -->
            <VCard>
                <VCardText>
                    <div class="d-flex justify-center align-center mt-3 mb-3 flex-column">
                        <VIcon size="90" :icon="iconConf" :color="colorConf" />
                        <h6 class="text-lg font-weight-medium">{{ menssageConf }}</h6>
                    </div>
                </VCardText>
                <VCardText class="d-flex justify-center gap-3 flex-wrap mb-5">
                    <VBtn @click="eventoConfirmacion()" :loading="loadings[2]" :disabled="loadings[2]">
                        Confirmar
                        <template #loader>
                            <span class="custom-loader">
                                <VIcon icon="tabler-refresh" />
                            </span>
                            <span>Cargando...</span>
                        </template>
                    </VBtn>
                    <VBtn color="secondary" variant="tonal" @click="modal[1] = false">
                        Cancelar
                    </VBtn>
                </VCardText>
            </VCard>
        </VDialog>

        <VDialog v-model="modal[2]" :width="1200">
            <!-- Dialog close btn -->
            <DialogCloseBtn @click="modal[2] = false" />

            <VCard class="pa-sm-14 pa-5">
                <VCardItem class="text-center">
                    <VCardTitle class="text-h5 mb-3">
                        Historial
                    </VCardTitle>
                    <p class="mb-0">
                        Detalle de las acciones realizadas por el usuario
                    </p>
                </VCardItem>

                <VCardText>
                    <VDataTable :headers="headerLog" :items="dataLog" :loadings="loadings[3]" :type="'standard'">
                        <template #nombre="{ item }">
                            <VChip label :color="item.color" size="small" class="text-capitalize">
                                <VIcon start size="16" :icon="item.icon" />
                                <span>{{ item.nombre }}</span>
                            </VChip>
                        </template>
                        <template #date="{ item }">
                            <div class="text-center">
                                <span class="text-medium-emphasis">{{ moment(item.date).format('dddd, D') }} de
                                    {{
            moment(item.date).format('MMMM') }} de {{ moment(item.date).format('YYYY')
                                    }}
                                    <br> {{
            moment(item.date).format('h:mm:ss a') }}</span>
                            </div>
                        </template>
                        <template #usuario="{ item }">
                            <span>a.castillo</span>
                        </template>
                    </VDataTable>
                    <VCardText class="d-flex flex-wrap justify-center gap-4">
                        <VBtn color="secondary" variant="tonal" @click="modal[2] = false">
                            Cancelar
                        </VBtn>
                    </VCardText>
                </VCardText>
            </VCard>
        </VDialog>

    </div>
</template>