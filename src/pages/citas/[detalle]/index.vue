<script setup>
import { VToast } from "@/views/components/index";
import axios from '@axios';
import CryptoJS from 'crypto-js';
import { getDocument } from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/web/pdf_viewer.css';

const descriptar = (id) => {
    const key = 'AVC-57-89'
    const bytes = CryptoJS.AES.decrypt(id.toString(), key)
    const recuperarId = bytes.toString(CryptoJS.enc.Utf8)
    return recuperarId
}

const router = useRouter()
const id = ref(descriptar(router.currentRoute.value.params.detalle))
const peso = ref('')
const medicamento = ref('')
const tratamiento = ref('')
const revisionSistema = ref('')
const motivoConsulta = ref('')
const temp = ref('')
const frecuenciaCardica = ref('')
const frecuenciaRespiratoria = ref('')
const diagnostico = ref('')
const recomendacion = ref('')

//pie de pagina
const currentPage = ref(1)
const totalPage = ref(1)
const rowPerPage = ref(3)
const dataProcesoMedicam = ref([])
const procesarDataMed = ref([])
const total = ref(0)
const datosTriaje = ref([])

const itemsMedicamento = ref([])

const loadings = ref([])
const datosCita = ref([])
let count = 0

const isActiveNav = ref(false)

const dataMedicamento = ref([])
const isActiveMedica = ref(false)
const usuario = ref(JSON.parse(localStorage.getItem('userData')))

//*variables del toast*///
const valueToas = ref({})
const timer = ref(null)

const keyEstado = ref(0)
const isActiveCampos = ref(false)
const urlDocumento = ref('')
const eventoDocumento = ref(0)

const addMedicamento = () => {

    count++
    if (medicamento.value == '' || tratamiento.value == '') {
        return false
    }

    medicamento.value.forEach(row => {
        if (row != '') {
            var medicina = itemsMedicamento.value.find(med => med.id == row)

            if (medicina) {
                var exiteMedicamento = dataMedicamento.value.find(entry => entry.tratamientos === tratamiento.value)

                if (exiteMedicamento) {
                    // Si existe una entrada, agrega el medicamento a esa entrada existente
                    exiteMedicamento.id.push(medicina.id);
                    exiteMedicamento.med.push(medicina.nombre);
                } else {
                    // Si no existe una entrada, crea una nueva entrada
                    dataMedicamento.value.push({
                        cod: count,
                        id: [medicina.id],
                        med: [medicina.nombre],
                        tratamientos: tratamiento.value
                    });
                }
            }
        }
    });

    medicamento.value = []
    tratamiento.value = ''
}

const removerMedicamento = (cod) => {
    dataMedicamento.value = dataMedicamento.value.filter(med => med.cod !== cod)
}

const listarMedicina = async () => {
    itemsMedicamento.value = []

    itemsMedicamento.value = await axios.get(`backend-citas/lista-medicamento/`).then((res) => res.data.data).catch((err) => err);
}
const onGetMedicamento = (params) => {
    const { perPage = 0, currentPage = 1 } = params ?? {}

    const total = dataMedicamento.value.length

    const totalPage = Math.ceil(dataMedicamento.value.length / perPage) ? Math.ceil(dataMedicamento.value.length / perPage) : 1

    return [200, { query: paginateArray(dataMedicamento.value, perPage, currentPage), totalPage, total }]
}

const paginateArray = (array, perPage, page) => array.slice((page - 1) * perPage, page * perPage)

const agregarMedicamento = async () => {
    const expresionRegular = /^\s*$/;

    if (medicamento.value != '' && !expresionRegular.test(medicamento.value)) {
        loadings.value[3] = true

        var data = {
            nombre: medicamento.value,
            key_estado: 1,
            key_usuario: usuario.value.user_id,
        }

        await axios({
            url: "backend-citas/agregar-medicamento/",
            method: "POST",
            data: data
        }).then((res) => {
            if (res.status == 200 && !res.data.is_error) {
                listarMedicina()
                medicamento.value = ''
            } else {
                valueToas.value = {
                    'status': true,
                    'title': 'Operación sin exito 😞!',
                    'menssage': res.data.message,
                    'type': 'warning'
                }
            }
        }).catch((err) => {
            valueToas.value = {
                'status': true,
                'title': 'Operación sin exito 😞!',
                'menssage': err,
                'type': 'warning'
            }
        });

        loadings.value[3] = false
    }

    isActiveMedica.value = false

    eventMause();
}

const obtenerCitaId = async () => {
    loadings.value[0] = true
    datosCita.value = []

    datosCita.value = await axios.get(`backend-citas/lista-citas-id/${id.value}/`).then((res) => res.data.data).catch((err) => err);

    if (datosCita.value[0] != undefined) {
        motivoConsulta.value = datosCita.value[0].motivo_consulta
        revisionSistema.value = datosCita.value[0].observacion_sistema
        diagnostico.value = datosCita.value[0].diagnostico
        recomendacion.value = datosCita.value[0].recomendacion

        if (usuario.value.key_rol != 1) {
            if (![datosCita.value[0].dni_cl, datosCita.value[0].dni_vt].includes(usuario.value.documento)) {
                router.replace({ path: "/not-authorized" });
            }
        }
    }
    loadings.value[0] = false

}

const obtenerTriajeId = async () => {
    datosTriaje.value = []

    datosTriaje.value = await axios.get(`backend-citas/lista-triaje/${id.value}/`).then((res) => res.data.data).catch((err) => err);

    if (datosTriaje.value[0] != undefined) {
        peso.value = datosTriaje.value[0].peso
        temp.value = datosTriaje.value[0].temperatura
        frecuenciaCardica.value = datosTriaje.value[0].frecuencia_cardica
        frecuenciaRespiratoria.value = datosTriaje.value[0].frecuencia_respiratoria
    }
}

//actualizar estado de confirmado
const actualizarEstado = async () => {
    if (datosCita.value[0] != undefined) {
        keyEstado.value = datosCita.value[0].key_estado

        if (keyEstado.value == 6) {
            isActiveCampos.value = true
        } else {
            isActiveCampos.value = false
        }
        //cambiar estado
        if (datosCita.value[0].key_estado == 9) {
            var data = {
                key_estado: 5,
                motivo_cancelacion: null,
                key_usuario: usuario.value.user_id
            }

            await axios({
                method: 'PUT',
                url: `backend-citas/recuperar-eliminar-citas/${id.value}/`,
                data: data
            }).then(res => {
                if (res.status == 200 && !res.data.is_error) {
                    valueToas.value = {
                        'status': true,
                        'title': 'Operacion exitosa',
                        'menssage': 'has iniciado la cita, por tal motivo pasa a confirmado.',
                        'type': 'success'
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
                valueToas.value = {
                    'status': true,
                    'title': 'Operación sin exito 😞!',
                    'menssage': err,
                    'type': 'warning'
                }
            })
        }
    }
}

const finalizarCita = async () => {
    loadings.value[1] = true
    var data = {
        key_cita: id.value,
        motivo_consulta: motivoConsulta.value,
        observacion_sistema: revisionSistema.value,
        diagnostico: diagnostico.value,
        recomendacion: recomendacion.value,
        peso: peso.value,
        temperatura: temp.value,
        frecuencia_cardica: frecuenciaCardica.value,
        frecuencia_respiratoria: frecuenciaRespiratoria.value,
        receta: dataMedicamento.value,
        key_estado: 6
    }

    if (diagnostico.value == '') {
        loadings.value[1] = false
        return false
    }

    await axios({
        url: 'backend-citas/finalizar-citas/',
        method: 'POST',
        data: data
    }).then(res => {
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': '¡Operacion exitosa 🥳!',
                'menssage': res.data.message,
                'type': 'success'
            }
            obtenerCitaId()
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
            'menssage': res.data.message,
            'type': 'warning'
        }
    })

    loadings.value[1] = false

    eventMause();
}
const reporteGeneral = async (event) => {
    eventoDocumento.value = event
    urlDocumento.value = ''
    loadings.value[2] = true
    isActiveNav.value = true
    var data = {
        "key_cita": id.value
    }
    await axios({
        url: event == 1 ? 'backend-citas/reporte-receta/' : 'backend-citas/reporte-historial-clinico/',
        method: 'POST',
        data: data
    }).then(res => {
        if (res.status == 200 && res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': 'Operación sin exito 😞!',
                'menssage': res.data.message,
                'type': 'warning'
            }
        } else {
            var generarBlob = new Blob([res.data])
            urlDocumento.value = URL.createObjectURL(generarBlob)
            visorPdf()
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
}


const descargaDirecta = () => {
    var fileLink = document.createElement("a");
    fileLink.href = urlDocumento.value;
    fileLink.setAttribute("download", `${eventoDocumento.value == 1 ? 'REC' : 'HIST'}-${datosCita.value[0].dni_cl}-${datosCita.value[0].nombre_mascota}.pdf`);
    document.body.appendChild(fileLink);
    fileLink.click();
}

const visorPdf = async () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdfjs-dist/build/pdf.worker.js'

    const cargarTareas = getDocument(urlDocumento.value)

    await cargarTareas.promise.then(pdf => {
        var pdfDoc = null,
            pageNum = 1,
            pageRendering = false,
            pageNumPending = null,
            scale = 4.0,
            canvas = document.getElementById('pdfGeneral'),
            ctx = canvas.getContext('2d');

        function renderPage(num) {
            pageRendering = true;
            pdfDoc.getPage(num).then(function (page) {
                var viewport = page.getViewport({ scale: scale });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);

                // Wait for rendering to finish
                renderTask.promise.then(function () {
                    pageRendering = false;
                    if (pageNumPending !== null) {
                        // New page rendering is pending
                        renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                });
            });

            document.getElementById('page_num').textContent = num;
        }
        function queueRenderPage(num) {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }
        function onPrevPage() {
            if (pageNum <= 1) {
                return;
            }
            pageNum--;
            queueRenderPage(pageNum);
        }

        document.getElementById('prev').addEventListener('click', onPrevPage);
        function onNextPage() {
            if (pageNum >= pdfDoc.numPages) {
                return;
            }
            pageNum++;
            queueRenderPage(pageNum);
        }
        document.getElementById('next').addEventListener('click', onNextPage);

        pdfjsLib.getDocument(urlDocumento.value).promise.then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('page_count').textContent = pdfDoc.numPages;

            // Initial/first page rendering
            renderPage(pageNum);
        });
    })
}

const zoomIn = () => {
    // console.log("Zooming in...");
    var pdfWidth = parseInt(document.getElementById('pdfGeneral').style.width) // 
    var pdfHeight = parseInt(document.getElementById('pdfGeneral').style.height) // 

    if (pdfWidth == 100) {
        pdfWidth += 519
    }

    if (pdfWidth <= 1571 || pdfHeight <= 2222) {

        pdfWidth += 79
        pdfHeight += 110

        document.getElementById('pdfGeneral').style.width = pdfWidth.toString() + 'px'
        document.getElementById('pdfGeneral').style.height = pdfHeight.toString() + 'px'
    }
}
const zoomOut = () => {
    // console.log("Zooming out...");
    var pdfWidth = parseInt(document.getElementById('pdfGeneral').style.width)
    var pdfHeight = parseInt(document.getElementById('pdfGeneral').style.height)

    if (pdfWidth == 100) {
        pdfWidth += 519
    }
    if (pdfWidth >= 222 || pdfHeight >= 314) {
        pdfWidth -= 79
        pdfHeight -= 110

        document.getElementById('pdfGeneral').style.width = pdfWidth.toString() + 'px'
        document.getElementById('pdfGeneral').style.height = pdfHeight.toString() + 'px'
    }
}
onMounted(() => {
    obtenerCitaId()
    obtenerTriajeId()
    listarMedicina()
})

watch(() => {
    procesarDataMed.value = onGetMedicamento({
        perPage: rowPerPage.value,
        currentPage: currentPage.value,
    })

    totalPage.value = procesarDataMed.value[1].totalPage
    total.value = procesarDataMed.value[1].total
    dataProcesoMedicam.value = procesarDataMed.value[1].query
})

watch(() => {
    actualizarEstado()
})
/*======eventos Toast=============*/
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
</script>

<template>
    <div v-if="loadings[0]" class="loadings-detalle">
        <div class="icon-pulse">
            <VIcon icon="tabler-stethoscope" size="90"></VIcon>
        </div>
    </div>
    <div v-else class="position-relative w-100">
        <VToast :icon="valueToas.icon" :title="valueToas.title" :menssage="valueToas.menssage" :status="valueToas.status"
            :type="valueToas.type" @closeToast="closeToast" @mouseover="eventMouseover" @mouseleave="eventMause"> </VToast>
        <div class="header-detalle-cita">
            <div class="breadcrumbs-detalle">
                <div class="d-flex align-center gap-1">
                    <RouterLink :to="{ name: 'index' }" class="d-flex align-center gap-1">

                        <VIcon icon="tabler-home"></VIcon>
                        <span>Inicio</span>

                    </RouterLink>

                    <div>
                        <VIcon icon="tabler-chevron-right"></VIcon>
                    </div>

                    <RouterLink :to="{ name: 'citas' }" class="d-flex align-center gap-1">
                        <VIcon icon="tabler-calendar-search"></VIcon>
                        <span>Citas</span>
                    </RouterLink>

                    <div>
                        <VIcon icon="tabler-chevron-right"></VIcon>
                    </div>

                    <div class="d-flex align-center gap-1">
                        <VIcon icon="tabler-info-circle"></VIcon>
                        <span>Detalle</span>
                    </div>
                </div>
            </div>

            <div
                class="d-flex flex-wrap justify-space-between align-center gap-y-5 flex-column flex-sm-row py-5 px-5 header-main-detalle">
                <div class="header-text panel-header__item">
                    <RouterLink :to="{ name: 'citas' }">
                        <div class="d-flex align-center">
                            <span>
                                <VIcon icon="tabler-chevron-left"></VIcon>
                            </span>
                        </div>
                    </RouterLink>
                    <div>
                        {{ isActiveCampos ? 'Cita completada' : 'Realización de la cita' }}
                    </div>
                </div>
                <div class="">
                    <VBtn v-if="!isActiveCampos" class="btn-header-detalle" variant="outlined" color="secondary"
                        rounded="pill">
                        <VIcon start icon="tabler-lock-off"></VIcon>
                        Cancelar
                    </VBtn>

                    <VBtn v-if="!isActiveCampos" type="submit" :loading="loadings[1]" :disabled="loadings[1]"
                        @click="finalizarCita()" class="ms-3 btn-header-detalle" variant="outlined" color="success"
                        rounded="pill">
                        <VIcon start icon="tabler-check"></VIcon>
                        Finalizar
                    </VBtn>
                </div>
            </div>
        </div>

        <div class="main-detalle-cita">
            <VCard class="w-100 mb-8">
                <VRow v-for="items in datosCita" class=" align-center py-2 px-2">
                    <VCol cols="12" sm="6" md="6">
                        <VRow class=" align-center">
                            <!---INFORMACION DEL CLIENTE-->
                            <VCol cols="12" sm="4" md="4">
                                <VCardTitle class="title-detalle">
                                    <VIcon size="19" icon="tabler-user-pin"></VIcon> Cliente
                                </VCardTitle>
                            </VCol>

                            <VCol cols="12" sm="8" md="8">
                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-friends"></VIcon>
                                    <span class="font-12 ms-2">{{ items.nombre_completo_cliente }}</span>
                                </div>

                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-phone"></VIcon>
                                    <span class="font-12 ms-2">{{ items.num_cel }}</span>
                                </div>

                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-mail-fast"></VIcon>
                                    <span class="font-12 ms-2">{{ items.correo }}</span>
                                </div>

                            </VCol>

                            <!---INFORMACION DE LA MASCOTA-->
                            <VCol cols="12" sm="4" md="4">
                                <VCardTitle class="title-detalle">
                                    <VIcon size="19" icon="tabler-dog"></VIcon> Mascota
                                </VCardTitle>
                            </VCol>

                            <VCol cols="12" sm="8" md="8">
                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-dog-bowl"></VIcon>
                                    <span class="font-12 ms-2">{{ items.nombre_mascota }}</span>
                                </div>

                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-packages"></VIcon>
                                    <span class="font-12 ms-2">{{ items.edad }}</span>
                                </div>

                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-gender-bigender"></VIcon>
                                    <span class="font-12 ms-2">{{ items.sexo_mascota }}</span>
                                </div>

                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-paw"></VIcon>
                                    <span class="font-12 ms-2">{{ items.nombre_raza }}</span>
                                </div>

                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-bone"></VIcon>
                                    <span class="font-12 ms-2">{{ items.especie }}</span>
                                </div>

                            </VCol>
                        </VRow>
                    </VCol>

                    <VCol cols="12" sm="6" md="6">
                        <VRow class=" align-center">
                            <!---INFORMACION DE LA VETERINARIO-->
                            <VCol cols="12" sm="4" md="4">
                                <VCardTitle class="title-detalle">
                                    <VIcon size="19" icon="tabler-stethoscope"></VIcon> Veterinario(a)
                                </VCardTitle>
                            </VCol>

                            <VCol cols="12" sm="8" md="8">
                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-clipboard-heart"></VIcon>
                                    <span class="font-12 ms-2">{{ items.nombre_completo_veterinario }}</span>
                                </div>
                            </VCol>

                            <!---INFORMACION DE LA SERVICIO-->
                            <VCol cols="12" sm="4" md="4">
                                <VCardTitle class="title-detalle">
                                    <VIcon size="19" icon="tabler-hotel-service"></VIcon> Servicio
                                </VCardTitle>
                            </VCol>

                            <VCol cols="12" sm="8" md="8">
                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-servicemark"></VIcon>
                                    <span class="font-12 ms-2">{{ items.nombre_servicio }}</span>
                                </div>

                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-adjustments-bolt"></VIcon>
                                    <span class="font-12 ms-2">{{ items.tipo_servicio }}</span>
                                </div>

                                <div class="mb-2">
                                    <VIcon size="16" icon="tabler-currency-dollar"></VIcon>
                                    <span class="font-12 ms-2">{{ items.precio }}</span>
                                </div>

                            </VCol>
                        </VRow>
                    </VCol>


                </VRow>
            </VCard>

            <VCard class="w-100 py-2 px-2 mb-8">
                <VCardTitle class="title-detalle">
                    <VIcon icon="tabler-forms"></VIcon>
                    <span class="ms-2">Complementos</span>
                </VCardTitle>

                <VCardText style="font-size: 12.5px">
                    <span>En este apartado de complementos podras añadir el diagnostico y una serie de acciones para generar
                        el informe de tu citas.</span>
                </VCardText>

                <VCardText>
                    <div class="container-form-detalle">
                        <div class="form-items">
                            <VCardTitle class="title-detalle-form">
                                <VIcon icon="tabler-clear-formatting"></VIcon>
                                <span class="ms-2">motivo de consulta</span>
                            </VCardTitle>
                            <div style="padding: 0.5rem 1rem">
                                <VTextarea v-model="motivoConsulta" label="" rows="3" variant="outlined"
                                    :disabled="isActiveCampos" />
                            </div>
                        </div>

                        <div class="form-items button-border-items-detalle">
                            <VCardTitle class="title-detalle-form">
                                <VIcon icon="tabler-sort-descending-shapes"></VIcon>
                                <span class="ms-2">REVISION POR SISTEMAS</span>
                            </VCardTitle>
                            <div style="padding: 0.5rem 1rem">
                                <VTextarea v-model="revisionSistema" label="" rows="3" variant="outlined"
                                    :disabled="isActiveCampos" />
                            </div>
                        </div>

                        <div class="form-items button-border-items-detalle">
                            <VCardTitle class="title-detalle-form">
                                <VIcon icon="tabler-pill"></VIcon>
                                <span class="ms-2">Exmanen - Fisico</span>
                            </VCardTitle>
                            <div style="padding: 0.5rem 1rem">
                                <VRow>
                                    <VCol cols="12">
                                        <VRow no-gutters>
                                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                                <label class="v-label text-body-2 text-high-emphasis"
                                                    for="peso">Peso</label>
                                            </VCol>

                                            <VCol cols="12" md="9">
                                                <AppTextField type="number" id="peso" v-model="peso"
                                                    placeholder="Peso de la mascota" persistent-placeholder
                                                    :disabled="isActiveCampos" />
                                            </VCol>
                                        </VRow>
                                    </VCol>

                                    <VCol cols="12">
                                        <VRow no-gutters>
                                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                                <label class="v-label text-body-2 text-high-emphasis"
                                                    for="temp">Temperatura</label>
                                            </VCol>

                                            <VCol cols="12" md="9">
                                                <AppTextField type="number" id="temp" v-model="temp"
                                                    placeholder="Temperatura" persistent-placeholder
                                                    :disabled="isActiveCampos" />
                                            </VCol>
                                        </VRow>
                                    </VCol>

                                    <VCol cols="12">
                                        <VRow no-gutters>
                                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                                <label class="v-label text-body-2 text-high-emphasis" for="fc">Frecuencia
                                                    cardiaca</label>
                                            </VCol>

                                            <VCol cols="12" md="9">
                                                <AppTextField type="number" id="fc" v-model="frecuenciaCardica"
                                                    placeholder="Frecuencia cardiaca" persistent-placeholder
                                                    :disabled="isActiveCampos" />
                                            </VCol>
                                        </VRow>
                                    </VCol>

                                    <VCol cols="12">
                                        <VRow no-gutters>
                                            <VCol cols="12" md="3" class="d-flex align-items-center">
                                                <label class="v-label text-body-2 text-high-emphasis" for="fr">Frecuencia
                                                    respiratoria</label>
                                            </VCol>

                                            <VCol cols="12" md="9">
                                                <AppTextField type="number" id="fr" v-model="frecuenciaRespiratoria"
                                                    placeholder="Frecuencia respiratoria" persistent-placeholder
                                                    :disabled="isActiveCampos" />
                                            </VCol>
                                        </VRow>
                                    </VCol>

                                </VRow>
                            </div>
                        </div>

                        <div class="form-items button-border-items-detalle">
                            <VCardTitle class="title-detalle-form">
                                <VIcon icon="tabler-medical-cross"></VIcon>
                                <span class="ms-2">Diagnostico</span>
                            </VCardTitle>
                            <div style="padding: 0.5rem 1rem">
                                <VTextarea label="" v-model="diagnostico" rows="3" variant="outlined"
                                    :rules="[(v) => !!v || 'Campo requerido']" :disabled="isActiveCampos" />
                            </div>
                        </div>

                        <div class="form-items button-border-items-detalle">
                            <VCardTitle class="title-detalle-form">
                                <VIcon icon="tabler-vaccine-bottle"></VIcon>
                                <span class="ms-2">PLAN DE TRATAMIENTO</span>
                            </VCardTitle>
                            <div style="padding: 0.5rem 1rem">
                                <VRow class-="align-center">
                                    <VCol cols="12" md="6" sm="6">
                                        <VRow>
                                            <VCol cols="12">
                                                <VRow no-gutters>
                                                    <VCol cols="12" md="3" class="d-flex align-items-center">
                                                        <label class="v-label text-body-2 text-high-emphasis"
                                                            for="medicamento">Medicamento</label>
                                                    </VCol>

                                                    <VCol cols="12" md="9">
                                                        <div v-if="!isActiveMedica"
                                                            class="d-flex align-center justify-center ">
                                                            <VBtn :disabled="isActiveCampos" variant="outlined"
                                                                @click="isActiveMedica = true; medicamento = ''" size="38">
                                                                <VIcon icon="tabler-edit" size="22" />
                                                            </VBtn>

                                                            <VAutocomplete class="ms-2" variant="outlined"
                                                                v-model="medicamento" label="" :items="itemsMedicamento"
                                                                item-title="nombre" item-value="id" multiple
                                                                :disabled="isActiveCampos" />
                                                        </div>

                                                        <div v-if="isActiveMedica"
                                                            class="d-flex align-center justify-center ">
                                                            <VBtn variant="outlined" @click="agregarMedicamento();"
                                                                size="38" :loading="loadings[3]" :disabled="loadings[3]">
                                                                <VIcon icon="tabler-plus" size="22" />

                                                                <template #loader>
                                                                    <span class="custom-loader">
                                                                        <VIcon icon="tabler-refresh" />
                                                                    </span>
                                                                </template>
                                                            </VBtn>

                                                            <AppTextField class="ms-2" id="medicamento"
                                                                v-model="medicamento" placeholder="Medicamento"
                                                                persistent-placeholder :disabled="isActiveCampos" />
                                                        </div>
                                                    </VCol>
                                                </VRow>
                                            </VCol>

                                            <VCol cols="12">
                                                <VRow no-gutters>
                                                    <VCol cols="12" md="3" class="d-flex align-items-center">
                                                        <label class="v-label text-body-2 text-high-emphasis"
                                                            for="tratamiento">Tratamiento</label>
                                                    </VCol>

                                                    <VCol cols="12" md="9">
                                                        <AppTextField id="tratamiento" v-model="tratamiento"
                                                            placeholder="Esquema de tratamiento" persistent-placeholder
                                                            :disabled="isActiveCampos" />
                                                    </VCol>
                                                </VRow>
                                            </VCol>

                                            <VCol cols="12">
                                                <VBtn @click="addMedicamento()" class="btn-header-detalle"
                                                    variant="outlined" color="success" rounded="pill"
                                                    :disabled="isActiveCampos">
                                                    <VIcon start icon="tabler-plus"></VIcon>
                                                    añadir
                                                </VBtn>
                                            </VCol>

                                        </VRow>
                                    </VCol>

                                    <!---receta---->
                                    <VCol cols="12" md="6" sm="6" class="position-relative">
                                        <div class="detalle-container-logo-receta">
                                            <svg class="logo-receta-detalle" fill="#000000" version="1.1" id="Capa_1"
                                                xmlns="http://www.w3.org/2000/svg"
                                                xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 235.51 235.511"
                                                xml:space="preserve" stroke="#000000">
                                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round"
                                                    stroke-linejoin="round"></g>
                                                <g id="SVGRepo_iconCarrier">
                                                    <g>
                                                        <g>
                                                            <path
                                                                d="M175.585,148.621c-8.876-4.087-22.064-4.953-31.57-4.953c-3.058,0-5.61,0.076-7.357,0.169l0.084-8.279 c3.991-1.403,5.635-4.601,6.271-6.616c0.697,0.16,1.419,0.232,2.137,0.232c7.554,0,13.465-8.352,13.5-8.412 c11.081-12.984,3.154-36.167,2.785-37.225l-0.965-1.361l-0.862-0.16c-1.454-0.298-3.157-0.449-5.073-0.449 c-12.627,0-31.264,6.578-36.994,8.72c-4.42-3.797-13.52-5.791-14.619-6.045l-1.545,0.104l-0.591,0.557 c-0.938,0.904-2.893,2.777,3.064,14.607c-0.684,0.521-1.311,1.092-1.886,1.675c-5.322-1.579-14.857-2.158-15.943-2.238 l-2.717-0.164l0.072,2.725c0.292,11.499,20.638,26.114,23.417,27.938c1.603,16.246-32.705,32.944-33.035,33.121 c-5.094,2.184-13.251,3.358-23.566,3.358c-7.78,0-14.186-0.706-14.232-0.706l-1.797-0.176l-0.755,1.623 c-0.675,1.475-0.675,3.098,0,4.692c2.395,5.703,14.17,11.101,21.235,13.906c-3.619,6.42-3.194,16.936-2.967,18.799 c-7.927,7.927-11.491,15.088-10.606,21.283c0.89,6.132,5.769,8.724,5.983,8.832l2.464,1.331l1.012-2.605 c2.561-6.5,19.745-23.383,25.396-28.949l0.867-1.227c3.595,0.661,7.079,1.074,10.367,1.227c1.146,0.076,2.263,0.092,3.371,0.092 c32.248,0,41.144-24.686,43.176-32.748c0.344,0.044,0.688,0.06,1.05,0.06c3.054,0,5.811-1.779,7.302-2.945 c1.791,1.259,3.862,1.888,6.115,1.888c5.959,0,11.958-4.433,16.39-7.69c1.122-0.817,2.132-1.555,2.974-2.107 c9.354-5.919,9.923-7.867,9.706-9.65C177.105,149.804,176.383,148.85,175.585,148.621z M164.854,156.288 c-0.934,0.597-2.04,1.395-3.314,2.332c-3.831,2.821-9.076,6.685-13.377,6.685c-1.694,0-3.117-0.63-4.376-1.948l-1.839-1.932 l-1.796,1.977c-0.128,0.132-2.93,2.977-5.414,2.977c-0.564,0-1.086-0.164-1.57-0.477l-3.311-2.132l-0.513,3.911 c-0.156,1.271-4.332,31.37-38.778,31.37c-1.02,0-2.09-0.032-3.158-0.076c-3.291-0.16-6.835-0.613-10.588-1.318l-1.499,0.093 l-0.583,0.536c-0.848,0.81-20.756,19.456-27.272,29.775c-0.587-0.766-1.238-1.903-1.477-3.435 c-0.667-4.601,2.733-10.703,9.836-17.681l0.739-1.178l-0.052-0.705c-0.309-4.096-0.23-15.533,3.791-19.076l3.178-2.805 l-4.003-1.427c-4.765-1.703-17.398-6.9-20.836-11.277c2.442,0.185,6.688,0.453,11.527,0.453c11.152,0,19.774-1.274,25.64-3.787 c1.583-0.766,39.094-18.814,35.812-39.236l-0.487-1.198l-0.551-0.381c-5.042-3.435-18.511-14.018-21.604-22.115 c4.831,0.435,10.576,1.229,12.758,2.225l1.986,0.869l1.152-1.821c0.175-0.24,1.196-1.609,3.489-2.973l2.024-1.227l-1.106-2.09 c-1.733-3.288-3.298-6.789-4.091-9.207c3.879,1.13,8.323,2.921,9.722,4.757l1.146,1.477l1.755-0.691 c0.252-0.099,2.02-0.786,4.703-1.709c0.613,1.771,2.284,3.068,4.264,3.068c2.492,0,4.524-2.032,4.524-4.528 c0-0.471-0.085-0.89-0.205-1.318c7.458-2.238,16.599-4.477,23.42-4.477c0.949,0,1.831,0.056,2.637,0.141 c1.15,3.987,5.534,21.604-2.461,30.995c-0.044,0.054-4.853,6.494-9.59,6.494c-0.949,0-1.831-0.276-2.729-0.842l-3.879-2.5 l0.031,4.645c0.013,0.484-0.1,4.953-4.7,5.643l-2.108,0.324l-0.168,17.736l2.757-0.212c0.722-0.064,4.541-0.325,9.662-0.325 c7.803,0,18.707,0.613,26.83,3.451C169.823,152.945,167.996,154.296,164.854,156.288z">
                                                            </path>
                                                            <path
                                                                d="M202.435,32.18c0.842-7.684-1.35-15.252-6.195-21.315c-4.845-6.053-11.754-9.853-19.456-10.698 C175.718,0.04,174.66,0,173.578,0c-4.171,0-8.219,0.864-12.014,2.607c-4.437,2.032-8.203,5.149-11.068,8.951 c-3.282-1.242-6.785-1.932-10.295-1.932c-4.164,0-8.203,0.886-12.022,2.637c-2.076,0.936-4.044,2.128-5.849,3.559 c-12.593,9.858-14.815,28.12-4.945,40.72c11.876,15.156,31.364,17.41,41.912,17.41c2.705,0,4.745-0.143,5.851-0.243l-1.895,3.853 l8.455,0.638l-1.362-5.777c3.879,0.487,13.413,2.344,17.248,8.774c2.696,4.5,2.168,10.672-1.503,18.33 c-1.455,3.01-2.773,5.707-3.987,8.133c-11.068,22.332-11.47,24.532,7.337,45.754c0.485,0.514,1.143,0.834,1.864,0.834 c0.368,0,0.713-0.093,1.033-0.221c0.209-0.116,0.438-0.232,0.622-0.425c1.033-0.894,1.134-2.488,0.216-3.519 c-17.02-19.18-16.823-19.58-6.597-40.2c1.207-2.451,2.549-5.16,4.004-8.189c4.477-9.271,4.905-17.025,1.303-23.062 c-3.419-5.717-9.742-8.56-14.932-9.979C185.921,63.119,200.303,51.411,202.435,32.18z M121.332,53.447 c-3.948-5.047-5.707-11.319-4.921-17.695c0.765-6.374,3.971-12.066,9.002-16.006c1.499-1.17,3.126-2.166,4.85-2.959 c3.165-1.447,6.508-2.178,9.95-2.178c2.532,0,5.045,0.44,7.605,1.242c-1.578,3.094-2.652,6.436-3.049,9.97 c-2.232,20.33,12.018,36.383,19.059,42.954c-0.981,0.088-2.393,0.154-4.111,0.154C149.902,68.902,131.857,66.894,121.332,53.447z M169.43,67.074c-0.132-0.1-0.292-0.242-0.452-0.376l-0.137-0.597l-0.168,0.329c-5.086-4.544-21.1-20.494-18.932-40.068 c0.914-8.352,6.244-15.731,13.902-19.215c3.134-1.437,6.476-2.154,9.934-2.154c0.891,0,1.779,0.05,2.67,0.168 c6.375,0.705,12.09,3.837,16.089,8.848c4.012,5.014,5.835,11.281,5.114,17.641C195.074,53.203,174.131,64.752,169.43,67.074z">
                                                            </path>
                                                            <path
                                                                d="M153.89,100.492c0.509,0,0.981-0.116,1.426-0.331c1.311-0.667,2.324-3.2,2.762-5.438c0.252-1.365,0.513-3.875-0.661-5.244 c-0.381-0.449-0.994-0.659-1.823-0.659c-2.509,0-7.574,2.126-8.833,4.657c-0.461,0.907-0.396,1.859,0.177,2.661 C147.442,96.812,150.856,100.492,153.89,100.492z">
                                                            </path>
                                                            <path
                                                                d="M124.336,97.375c2.318,0,4.202,1.883,4.202,4.202c0,2.32-1.884,4.202-4.202,4.202c-2.318,0-4.197-1.882-4.197-4.202 C120.139,99.258,122.019,97.375,124.336,97.375z">
                                                            </path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </svg>
                                        </div>
                                        <div class="detalle-receta">
                                            <div v-for="items in dataProcesoMedicam" class="items-receta mb-2">
                                                <div class="d-flex align-center justify-space-between">
                                                    <div>
                                                        <div class="title">{{ items.med.join(',') }}</div>
                                                        <div>{{ items.tratamientos }}</div>
                                                    </div>
                                                    <div>
                                                        <VBtn icon size="x-small" color="default" variant="text"
                                                            @click="removerMedicamento(items.cod)">
                                                            <VIcon color="error" size="19" icon="tabler-trash" />
                                                        </VBtn>
                                                    </div>
                                                </div>
                                            </div>

                                            <VCardText v-if="dataProcesoMedicam.length != 0"
                                                class="d-flex align-center flex-wrap justify-center gap-4 py-3 px-5">

                                                <VPagination v-model="currentPage" size="small" :total-visible="5"
                                                    rounded="circle" :length="totalPage" />
                                            </VCardText>

                                        </div>
                                    </VCol>

                                </VRow>
                            </div>
                        </div>

                        <div class="form-items button-border-items-detalle">
                            <VCardTitle class="title-detalle-form">
                                <VIcon icon="tabler-award"></VIcon>
                                <span class="ms-2">RECOMENDACIONES</span>
                            </VCardTitle>
                            <div style="padding: 0.5rem 1rem">
                                <VTextarea label="" v-model="recomendacion" rows="3" variant="outlined"
                                    :disabled="isActiveCampos" />
                            </div>
                        </div>

                    </div>
                </VCardText>
            </VCard>

            <VCard v-if="isActiveCampos" class="w-100 py-2 px-2">
                <VCardTitle class="title-detalle">
                    <VIcon icon="tabler-forms"></VIcon>
                    <span class="ms-2">Impresión de documentos</span>
                </VCardTitle>

                <VCardText style="font-size: 12.5px">
                    <span>En este apartado puedes vsualizar los documentos y realizar la descarga</span>
                </VCardText>

                <VDivider class="mx-6 ms-6" />

                <VCardText class="p-0 position-relative mx-6 ms-6">
                    <a @click="reporteGeneral(1)" class="d-flex align-center px-6 py-4 container-documentos"
                        href="javascript:;">
                        <div>
                            <VIcon icon="tabler-receipt"></VIcon>
                        </div>
                        <div class="ms-2 w-100">
                            Receta medica
                        </div>
                        <div>
                            <VIcon icon="tabler-chevron-right"></VIcon>
                        </div>
                    </a>
                </VCardText>

                <VDivider class="mb-2 mx-6 ms-6" />

                <VDivider class="mx-6 ms-6" />

                <VCardText class="p-0 position-relative mx-6 ms-6">
                    <a @click="reporteGeneral(2)" class="d-flex align-center px-6 py-4 container-documentos"
                        href="javascript:;">
                        <div>
                            <VIcon icon="tabler-report-medical"></VIcon>
                        </div>
                        <div class="ms-2 w-100">
                            Historia Clinica
                        </div>
                        <div>
                            <VIcon icon="tabler-chevron-right"></VIcon>
                        </div>
                    </a>
                </VCardText>

                <VDivider class="mx-6 ms-6 mb-2" />
            </VCard>

            <VNavigationDrawer temporary location="end" :width="800" v-model="isActiveNav"
                class="app-customizer background-secundary">
                <!-- 👉 Header -->
                <div v-for="items in datosCita"
                    class="customizer-heading d-flex align-center justify-space-between header-documento">
                    <div class="w-100">
                        <h6 class="text-h6 text-uppercase font-weight-bold">
                            {{ eventoDocumento == 1 ? 'REC' : 'HIST' }}-{{ items.dni_cl }}-{{ items.nombre_mascota }}
                        </h6>
                    </div>

                    <div class="d-flex align-center gap-1">
                        <VBtn icon variant="text" color="medium-emphasis" size="small" @click="isActiveNav = false">
                            <VIcon icon="tabler-x" size="22" />
                        </VBtn>
                    </div>
                </div>

                <VDivider />

                <div v-if="loadings[2]" class="loadings-detalle">
                    <div class="icon-pulse">
                        <VIcon icon="tabler-stethoscope" size="90"></VIcon>
                    </div>
                </div>

                <VCard v-else class="container-documento background-secundary position-relative" flat>
                    <div class="w-100 m-auto text-center" style="height: 100%; max-height: 825px; min-height: 825px;">
                        <canvas style="width: 100%; height: 825px;" id="pdfGeneral" class="pdfGeneral"></canvas>
                    </div>

                    <div class="d-flex align-center justify-center menu-documento">
                        <div>
                            <VBtn id="prev" color="none" size="38">
                                <VIcon id="prev" size="22" icon="tabler-chevron-left"></VIcon>
                            </VBtn>

                            <span class="text-body-1 text-uppercase ms-4 mx-4" style="font-size: 11px !important;"><span
                                    id="page_num"></span> / <span id="page_count"></span></span>

                            <VBtn id="next" color="none" size="38">
                                <VIcon size="22" icon="tabler-chevron-right"></VIcon>
                            </VBtn>
                        </div>
                    </div>

                    <div class="container-zoom">
                        <VBtn color="none" @click="descargaDirecta()" size="38" class="mb-3">
                            <VIcon size="22" icon="tabler-download"></VIcon>
                        </VBtn>
                        <VBtn color="none" @click="zoomIn()" size="38" class="mb-3">
                            <VIcon size="22" icon="tabler-plus"></VIcon>
                        </VBtn>
                        <VBtn color="none" @click="zoomOut()" size="38">
                            <VIcon size="22" icon="tabler-minus"></VIcon>
                        </VBtn>
                    </div>

                </VCard>

            </VNavigationDrawer>
        </div>
    </div>
</template>

<route lang="yaml">
    meta:
      action: read
      subject: citas
</route>