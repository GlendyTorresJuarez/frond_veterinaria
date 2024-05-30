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
const idUsuario = ref(0)
const dataUsuario = ref([])
const loadings = ref([])
const modal = ref([])
const search = ref('')
const numDocumento = ref('')
const nombre = ref('')
const apellido = ref('')
const password = ref('')
const usuario = ref('')
const correo = ref('')
const confirmarPassword = ref('')
const tipo = ref([])

const dataTipoUsuario = ref([])

const titleCrud = ref('')
const btnTextoCrud = ref('')
const showPassword = ref(false)
const showConfPassword = ref(false)
const rules = ref({
    required: (v) => !!v || 'Campo requerido.',
    min: (v) => v.length >= 8 || 'Min 8 caracteres.'
})

const iconConf = ref("");
const menssageConf = ref("");
const colorConf = ref("");
const confEvent = ref("");
const dataLog = ref([]);

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
        title: "Nro. Documento",
        key: "document_number",
    },
    {
        title: "Usuario",
        key: "usuario",
    },
    {
        title: "Apellidos y nombres",
        key: "nombres_apellido",
    },
    {
        title: "Correo",
        key: "correo",
    },
    {
        title: "Fecha y hora registro",
        key: "fecha_registro"
    },
    {
        title: "Ultima conexion",
        key: "ultimo_acceso"
    },
    {
        title: "Tipo de usuario",
        key: "tipo_usuario",
    },
])

const listaUsuarios = async () => {
    loadings.value[0] = true
    dataUsuario.value = []

    dataUsuario.value = await axios.get("backend-citas/lista-usuario/").then(res => res.data.data).catch(error => error)

    loadings.value[0] = false
}

const listaTipoUsuario = async () => {
    dataTipoUsuario.value = []

    dataTipoUsuario.value = await axios.get("backend-citas/lista-tipo-usuario/").then(res => res.data.data).catch(error => error)
}

const eventoNuevo = () => {
    modal.value[0] = true;

    titleCrud.value = "Registrar usuario";
    btnTextoCrud.value = "Guardar";
    limpiar()
}

const limpiar = () => {
    idUsuario.value = 0

    numDocumento.value = ''
    nombre.value = ''
    apellido.value = ''
    password.value = ''
    usuario.value = ''
    correo.value = ''
    confirmarPassword.value = ''
    tipo.value = []
}

const eventoEditar = (items) => {
    modal.value[0] = true;

    titleCrud.value = "Actualizar usuario";
    btnTextoCrud.value = "Actualizar";
    itemsCampos(items)
}

const itemsCampos = (items) => {
    idUsuario.value = items.id
    numDocumento.value = items.document_number
    nombre.value = items.nombre
    apellido.value = items.apellido
    usuario.value = items.usuario
    correo.value = items.correo
    tipo.value = items.key_tipo_usuario
}

const eventoCrud = async () => {
    loadings.value[1] = true

    var data = {
        document_number: numDocumento.value,
        first_name: nombre.value,
        last_name: apellido.value,
        username: usuario.value,
        password: password.value,
        email: correo.value,
        user_type: tipo.value,
        status: 1,
        key_usuario: null
    }

    var isVerificar = numDocumento.value == '' ||
        nombre.value == '' ||
        apellido.value == '' ||
        usuario.value == '' ||
        password.value == '' ||
        correo.value == '' ||
        tipo.value.length == 0 ||
        password.value.length <= 7


    if (isVerificar && idUsuario.value == 0) {
        loadings.value[1] = false
        return false
    }

    if (password.value.length <= 7) {
        loadings.value[1] = false
        return false
    }

    await axios({
        method: idUsuario.value == 0 ? 'POST' : 'PUT',
        url: idUsuario.value == 0 ? "backend-citas/agregar-usuario/" : `backend-citas/actualizar-usuario/${idUsuario.value}/`,
        data: data
    }).then(res => {
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': idUsuario.value == 0 ? '¡Registro Creado 🥳!' : '¡Registro Actualizado 🥳!',
                'menssage': res.data.message,
                'type': 'success'
            }

            modal.value[0] = false
            listaUsuarios()
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
        menssageConf.value = 'Estas seguro de anular al usuario?'
        colorConf.value = 'warning'
        confEvent.value = 1
    }
    if (event == 2) {
        iconConf.value = 'tabler-checks'
        menssageConf.value = 'Desea activar o restaurar el usuario?'
        colorConf.value = 'success'
        confEvent.value = 2
    }
    if (event == 3) {
        iconConf.value = 'tabler-trash'
        menssageConf.value = 'Estas seguro de eliminar por completo los datos?'
        colorConf.value = 'error'
        confEvent.value = 3
    }
    idUsuario.value = id
}

const eventoConfirmacion = async () => {
    loadings.value[2] = true
    var data = {
        key_estado: confEvent.value == 1 ? 2 : 1,
        key_usuario: null,
    }

    await axios({
        method: confEvent.value == 1 || confEvent.value == 2 ? 'PUT' : 'DELETE',
        url: `backend-citas/recuperar-eliminar-usuario/${idUsuario.value}/`,
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
            listaUsuarios()
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
        nombre_tabla: 'usuario'
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
        url: 'backend-citas/exportar-preguntas-frecuentes/',
        method: 'POST',
        responseType: "arraybuffer"
    }).then(res => {
        if (res.status == 200) {

            var fileURL = window.URL.createObjectURL(new Blob([res.data]));

            var fileLink = document.createElement("a");
            fileLink.href = fileURL;
            fileLink.setAttribute("download", "Preguntas frecuentes.xlsx");
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

onMounted(() => {
    listaUsuarios();
    listaTipoUsuario()
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
        <v-breadcrumbs class="mb-5" :items="['Inicio', 'Preguntas frecuente']">
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
                                @click="listaUsuarios()">
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

                        <!-- <div class="content-btn primary">
                            <VBtn class="btn-action" @click="exportDoc()" :loading="loadings[4]" :disabled="loadings[4]"
                                width="100%" height="100%" icon color="default" variant="text">
                                <VIcon color="primary" size="20" icon="tabler-download" />
                            </VBtn>
                            <div class="tooltip-btn primary tooltip-btn-top">
                                <span>Exportar</span>
                            </div>
                        </div> -->

                    </div>
                </div>
            </VCol>
        </VRow>

        <VRow>
            <VCol>
                <div class="table">
                    <VDataTable :type="'full'" :headers="header" :items="dataUsuario" :loadings="loadings[0]"
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

                        <template #nombres_apellido="{ item }">
                            <div class="d-flex align-center">
                                <div class="">
                                    <VAvatar color="success" variant="tonal" rounded="50">
                                        <VIcon icon="tabler-user-bolt"></VIcon>
                                    </VAvatar>
                                </div>
                                <div class="ml-2"><span>{{ item.nombre }} {{ item.apellido }}</span></div>
                            </div>

                        </template>

                        <template #fecha_registro="{ item }">
                            <div class="d-flex align-center justify-center flex-column">
                                <div class="text-center"><span>{{ moment(item.fecha_registro).format(`DD [de] MMM YYYY`)
                                        }}
                                    </span></div>
                                <div>
                                    {{ moment(item.fecha_registro).format('h:mm:ss a') }}
                                </div>
                            </div>

                        </template>

                        <template #ultimo_acceso="{ item }">
                            <div class="d-flex align-center justify-center flex-column">
                                <div class="text-center"><span>{{ moment(item.ultimo_acceso, 'DD/MM/YYYY').format(`DD
                                        [de]
                                        MMM YYYY`) }}
                                    </span></div>
                                <div>
                                    {{ moment(item.ultimo_acceso, 'DD/MM/YYYY h:mm:ss').format('h:mm:ss a') }}
                                </div>
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
                                <VTextField v-model="numDocumento" label="Documento de identidad"
                                    :rules="[(v) => !!v || 'Campo requerido']" type="number"
                                    append-inner-icon="tabler-search" @click:append-inner="buscarPersonal()"
                                    :loading="loadings[5]" :disabled="loadings[5]" maxlength="8"
                                    oninput="if(this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VTextField prepend-inner-icon="tabler-signature" v-model="nombre" label="Nombres"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VTextField prepend-inner-icon="tabler-brand-lastfm" v-model="apellido"
                                    label="Apellidos" :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                            <VCol cols="12" sm="6" md="6">
                                <VTextField prepend-inner-icon="tabler-mail" v-model="correo" label="Correo"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                            <VCol cols="12" sm="6" md="6">
                                <VTextField prepend-inner-icon="tabler-user-plus" v-model="usuario" label="Usuario"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>
                            <VCol cols="12">
                                <VTextField v-model="password" spellcheck="false" autocomplete="off"
                                    :append-inner-icon="showPassword ? 'tabler-eye-off' : 'tabler-eye'"
                                    :rules="[rules.required, rules.min]" :type="showPassword ? 'text' : 'password'"
                                    name="input-10-1" label="Contraseña" hint="At least 8 characters" counter
                                    @click:append-inner="showPassword = !showPassword" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VAutocomplete prepend-inner-icon="tabler-users-group" variant="outlined" v-model="tipo"
                                    label="Tipo usuario" :items="dataTipoUsuario" item-title="tipo_usuario"
                                    item-value="id" :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>
                        </VRow>
                    </VCardText>

                    <VCardText class="d-flex justify-center flex-wrap gap-3">
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