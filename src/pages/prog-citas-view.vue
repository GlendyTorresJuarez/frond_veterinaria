<script setup>
import { VCardTable, VToast } from "@/views/components/index";
import axios from "@axios";
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import VueDatePicker from '@vuepic/vue-datepicker';

import Datepicker from 'vuejs3-datepicker';

import '@vuepic/vue-datepicker/dist/main.css';
import moment from 'moment';
import { ref, watch } from 'vue';

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

const refCalendar = ref()
const fechaActual = ref(moment().format('YYYY/MM/DD'))

const modal = ref([])

const loadings = ref([])

const titleCrud = ref('')
const btnTextoCrud = ref('')
const dataVeterinario = ref([])
const dataClientes = ref([])
const itemsMascota = ref([])
const dataMascota = ref([])
const dataTipoCita = ref([])
const dataServicios = ref([])
const dataCitas = ref([])
const itemsCitasId = ref([])
const accion = ref(0)

const fechaCita = ref(moment().format('DD/MM/YYYY'))
const veterinario = ref([])
const cliente = ref([])
const duracion = ref(0)
const horaCita = ref(moment().format('HH:mm'))
const mascota = ref([])
const tipoCita = ref([])
const servicio = ref([])
const motivoConsulta = ref('')
const idCita = ref(0)
const motivoCancelacion = ref('')

const isMenuCalender = ref(false)

const iconConf = ref("");
const menssageConf = ref("");
const colorConf = ref("");
const confEvent = ref("");
const subMenssage = ref("")
const dataLog = ref([]);

/*
 variables del cliente 
 */
const dni = ref('')
const nombre = ref('')
const apellido = ref('')
const direccion = ref('')
const sexo = ref([])
const numCel = ref('')
const correo = ref('')
const itemsSexo = ref(['Masculino', 'Femenino'])

/*
 variables de la mascota
 */
const nombre_mascota = ref('')
const fechaNacimiento = ref('')
const sexoMascota = ref([])
const color = ref()
const tipo = ref([])
const raza = ref([])
const itemsSexoMascota = ref(['Macho', 'Hembra'])
const dataTipoMascota = ref([])
const dataRaza = ref([])


const dataDuracion = ref([5, 10, 15, 20, 30, 40, 45, 50, 60])

//*variables del toast*///
const valueToas = ref({})
const timer = ref(null)


const buscarPersona = async () => {
    loadings.value[1] = true
    var datos = []
    if (dni.value.length <= 7) {
        return false
    }

    datos = await axios.get(`backend-citas/consultar-dni/${dni.value}`).then(res => res.data.data)

    if (datos.nombres != undefined) {
        nombre.value = datos.nombres
        apellido.value = `${datos.apellidoPaterno} ${datos.apellidoMaterno}`
    } else {
        limpiarCliente()
    }
    loadings.value[1] = false
}

const limpiarCliente = () => {
    dni.value = ''
    nombre.value = ''
    apellido.value = ''
    direccion.value = ''
    sexo.value = []
    numCel.value = ''
    correo.value = ''
}

const listaTipoMascota = async () => {
    dataTipoMascota.value = []

    dataTipoMascota.value = await axios.get("backend-citas/lista-tipo-mascota/").then(res => res.data.data).catch(error => error)
}

const listaRaza = async () => {
    dataRaza.value = []

    dataRaza.value = await axios.get('backend-citas/lista-razas/').then(res => res.data.data).catch(err => err)
}

const listaVeterinarios = async () => {
    dataVeterinario.value = []

    dataVeterinario.value = await axios.get('backend-citas/lista-veterinarios/').then(res => res.data.data).catch(err => err)
}

const listaClientes = async () => {
    dataClientes.value = []

    dataClientes.value = await axios.get('backend-citas/lista-clientes/').then(res => res.data.data).catch(err => err)
}

const listaMascotas = async () => {
    dataMascota.value = []

    dataMascota.value = await axios.get("backend-citas/lista-mascota/").then(res => res.data.data).catch(error => error)
}

const listaTipoCitas = async () => {
    dataTipoCita.value = []

    dataTipoCita.value = await axios.get("backend-citas/lista-tipo-citas/").then(res => res.data.data).catch(error => error)
}

const listaServicios = async () => {
    dataServicios.value = [];

    dataServicios.value = await axios.get('backend-citas/lista-servicios/').then(res => res.data.data).catch(err => err)

};

const listaCitas = async () => {
    loadings.value[0] = true
    dataCitas.value = []

    dataCitas.value = await axios.get('backend-citas/lista-citas/').then(res => res.data.data).catch(err => err)

    loadings.value[0] = false
}

const sidebarToggle = () => {
    const body = document.querySelector("body"),
        sildebar = body.querySelector(".sidebar");
    sildebar.classList.toggle("active");
};

const configCalendar = computed(() => {
    var datos = []
    if (dataCitas.value.length > 0) {
        dataCitas.value.forEach(res => {
            // console.log(res);
            // console.log(moment(`${res.fecha_inicio} ${res.hora_inicio}`).format('YYYY-MM-DD HH:mm:ss a'));

            if (res.key_estado != 7) {
                datos.push({
                    id: res.id,
                    title: res.nombre_servicio,
                    start: moment(`${res.fecha_inicio} ${res.hora_inicio}`).format('YYYY-MM-DD HH:mm:ss'),
                    end: moment(`${res.fecha_inicio} ${res.hora_fin}`).format('YYYY-MM-DD HH:mm:ss'),
                    color: res.color
                })
            }
        })
    }
    return {
        plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
        initialView: 'timeGridWeek',
        headerToolbar: {
            start: 'drawerToggler,prev,next title',
            end: 'timeGridWeek,dayGridMonth,timeGridDay,listMonth',
        },
        locale: esLocale,
        events: datos,

        navLinks: true,
        selectable: true,
        unselectAuto: true,
        eventOverlap: false,
        slotDuration: '00:15',
        allDaySlot: false,
        eventStartEditable: false,
        eventDurationEditable: false,
        slotLabelInterval: "00:15",
        longPressDelay: 0,
        nowIndicator: "true", //indicator of current time
        slotMinTime: '08:30',
        slotMaxTime: '19:30',
        views: {
            timeGridWeek: {
                dayHeaderContent: function (arg) {
                    var dayOfWeek = arg.date.toLocaleDateString('es-ES', { weekday: 'short' });
                    var dayOfMonth = arg.date.getDate();


                    var conteinerFechas = document.querySelectorAll('.fc-scrollgrid-sync-inner')
                    if (conteinerFechas.length > 0) {
                        conteinerFechas.forEach(element => {
                            var fechaElemento = element.querySelector('.date-text');

                            if (fechaElemento != null) {
                                if (fechaElemento.textContent == moment().format('D')) {
                                    element.classList.add('active-fecha')
                                }
                            }
                        });
                    }


                    var container = `<span class="text-dia">${dayOfWeek.substring(0, 2)}</span> <div class="date-text ${dayOfWeek === 'dom' ? 'active-do' : ''}">${dayOfMonth}</div>`
                    return { html: container };
                },
                dayHeaderFormat: { weekday: 'short', day: 'numeric' }
            }
        },

        // eventContent: function (arg) {
        //     return { html: arg.event.title };
        // },

        forceEventDuration: true,
        editable: true,
        eventResizableFromStart: true,
        dayMaxEvents: 4,
        eventClassNames(info) {

            var status = dataCitas.value.find(x => x.id == info.event.id);

            return [
                // Background Color
                `bg-light-${status.color} text-${status.color}`,
            ]
        },

        eventClick: (info) => {
            itemsCitasId.value = dataCitas.value.filter(items => items.id == info.event.id)
            mostrarMenu(info)
        },
        //informacon de la fecha
        dateClick(info) {
            isMenuCalender.value = false
            fechaCita.value = moment(info.dateStr).format('DD/MM/YYYY')
            horaCita.value = {
                hours: new Date(info.dateStr).getHours(),
                minutes: new Date(info.dateStr).getMinutes()
            }
            eventoNuevo()
        }
    }
})

const mostrarMenu = (info) => {
    isMenuCalender.value = true

    var ejeX = info.jsEvent.clientX
    var ejeY = info.jsEvent.clientY

    var menu = document.getElementById('menu-calender')
    menu.style.position = 'absolute'
    menu.style.left = `${ejeX}px`
    menu.style.top = `${ejeY}px`
}

// const obtenerFechas = () => {
//     // Fecha específica seleccionada
//     const fechaSeleccionada = moment(fechaActual.value);

//     // Obtén el primer día de la semana de la fecha seleccionada
//     const primerDiaDeLaSemana = fechaSeleccionada.clone().startOf('isoWeek');

//     // Crea un array con todas las fechas de la semana
//     const fechasDeLaSemana = [];
//     let diaActual = primerDiaDeLaSemana.clone();

//     while (diaActual.isBefore(primerDiaDeLaSemana.clone().endOf('isoWeek'))) {
//         fechasDeLaSemana.push(diaActual.clone());
//         diaActual.add(1, 'day');
//     }

//     // Imprime el array de fechas de la semana
//     fechas.value = fechasDeLaSemana.map(fecha => fecha.format('YYYY-MM-DD'));
// }
const eventoNuevoCliente = () => {
    modal.value[1] = true
    limpiarCliente()
}

const eventoNuevaMascota = () => {
    modal.value[2] = true
    limpiarMascota()
}

const limpiarMascota = () => {
    nombre_mascota.value = ''
    fechaNacimiento.value = ''
    sexo.value = []
    color.value = null
    tipo.value = []
    raza.value = []
}

const eventoNuevo = () => {
    isMenuCalender.value = false
    modal.value[0] = true
    titleCrud.value = "Agregar cita"
    btnTextoCrud.value = 'Guardar'
    limpiar()
}

const eventoEditar = (items) => {
    isMenuCalender.value = false
    titleCrud.value = "Editar cita"
    btnTextoCrud.value = 'Actualizar'
    modal.value[0] = true

    idCita.value = items.id
    veterinario.value = items.key_veterinario
    cliente.value = items.key_cliente
    duracion.value = items.duracion
    mascota.value = items.key_mascota
    tipoCita.value = items.key_tipo_cita
    servicio.value = items.key_servicio
    motivoConsulta.value = items.motivo_consulta
    fechaCita.value = moment(items.fecha_inicio).format("DD/MM/YYYY")
    horaCita.value = {
        hours: new Date(`${items.fecha_inicio} ${items.hora_inicio}`).getHours(),
        minutes: new Date(`${items.fecha_inicio} ${items.hora_inicio}`).getMinutes()
    }
}
const limpiar = () => {
    idCita.value = 0

    veterinario.value = []
    cliente.value = []
    duracion.value = 0
    mascota.value = []
    tipoCita.value = []
    servicio.value = []
    motivoConsulta.value = ''
}

const eventoCrud = async () => {
    loadings.value[1] = true


    if (isValidarCampos() && idCita.value == 0) {
        loadings.value[1] = false
        return false
    }

    const formatHoraCita = horaCita.value.hours != undefined ? `${horaCita.value.hours}:${horaCita.value.minutes}` : horaCita.value
    const horaFin = moment(formatHoraCita, 'HH:mm').add(duracion.value, 'minutes').format('HH:mm');
    var isValidFecha = isValidarFechas(formatHoraCita)


    var data = {
        key_servicio: servicio.value,
        key_tipo_cita: tipoCita.value,
        key_veterinario: veterinario.value,
        key_cliente: cliente.value,
        key_mascota: mascota.value,
        fecha_inicio: moment(fechaCita.value, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        hora_inicio: formatHoraCita,
        hora_fin: horaFin,
        motivo_consulta: motivoConsulta.value,
        key_estado: 9,
        key_usuario: null,
    }

    if (isValidFecha.is_error && idCita.value == 0) {
        valueToas.value = {
            'status': true,
            'title': 'Horario no disponible 😞!',
            'menssage': isValidFecha.menssage,
            'type': 'warning'
        }
        loadings.value[1] = false
        return false
    }

    await axios({
        method: idCita.value == 0 ? 'POST' : 'PUT',
        url: idCita.value == 0 ? "backend-citas/agregar-citas/" : `backend-citas/actualizar-citas/${idCita.value}/`,
        data: data
    }).then(res => {
        console.log(res);
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': idCita.value == 0 ? '¡Registro Creado 🥳!' : '¡Registro Actualizado 🥳!',
                'menssage': res.data.message,
                'type': 'success'
            }

            modal.value[0] = false
            listaCitas()
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

const nuevoCliente = async () => {
    loadings.value[2] = true

    var data = {
        dni: dni.value,
        nombre: nombre.value,
        apellido: apellido.value,
        direccion: direccion.value,
        num_cel: numCel.value,
        sexo: sexo.value,
        correo: correo.value,
        key_estado: 1,
        key_usuario: null,
    }

    var isVerificar = dni.value == '' || nombre.value == '' || apellido.value == '' || numCel.value == '' || sexo.value.length == 0

    if (isVerificar) {
        loadings.value[2] = false
        return false
    }

    await axios({
        method: 'POST',
        url: "backend-citas/agregar-clientes/",
        data: data
    }).then(res => {
        console.log(res);
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': '¡Registro Creado 🥳!',
                'menssage': res.data.message,
                'type': 'success'
            }
            //agregamos la id al cliente para que automaticamente se agrege al combo 
            cliente.value = res.data.key_cliente
            modal.value[1] = false
            listaClientes()
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

    loadings.value[2] = false
    eventMause();
}

const nuevaMascota = async () => {
    loadings.value[3] = true

    var data = {
        key_cliente: cliente.value,
        key_raza: raza.value,
        nombre: nombre_mascota.value.toUpperCase(),
        fecha_nacimiento: fechaNacimiento.value,
        key_tipo_mascota: tipo.value,
        sexo: sexoMascota.value,
        color: color.value,
        key_estado: 1,
        key_usuario: null,
    }

    var isVerificar = cliente.value.length == 0 ||
        raza.value.length == 0 || tipo.value.length == 0 || sexoMascota.value.length == 0
        || nombre_mascota.value == '' || fechaNacimiento.value == ''

    if (isVerificar) {
        loadings.value[3] = false
        return false
    }

    await axios({
        method: 'POST',
        url: "backend-citas/agregar-mascota/",
        data: data
    }).then(res => {
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': '¡Registro Creado 🥳!',
                'menssage': res.data.message,
                'type': 'success'
            }
            mascota.value = res.data.key_mascota

            modal.value[2] = false
            listaMascotas()
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

    loadings.value[3] = false
    eventMause();
};

const isValidarCampos = () => {
    return veterinario.value.length > 0 ||
        cliente.value.length > 0 ||
        duracion.value == 0 ||
        mascota.value.length ||
        tipoCita.value.length > 0 ||
        servicio.value.length > 0 ||
        fechaCita.value == '' ||
        horaCita.value == '' ||
        motivoConsulta.value == ''
}

const isValidarFechas = (formatHoraCita) => {
    var fechaActualVal = moment()
    var horarioApertura = moment().set({ hour: 8, minute: 29, second: 0 });
    var horarioCierre = moment().set({ hour: 19, minute: 0, second: 0 });

    var fechaCitas = moment(fechaCita.value, 'DD/MM/YYYY')

    var menssage = ''
    var isError = false

    if (!fechaCitas.isSameOrAfter(fechaActualVal, 'day')) {
        menssage = 'No es posible programar la cita ya que debe ser mayor o igual a la fecha actual'
        isError = true;
    }

    var horarioCita = moment(formatHoraCita, 'HH:mm')

    if (!horarioCita.isBetween(horarioApertura, horarioCierre, 'HH:mm')) {
        menssage = 'La hora de la cita debe estar entre las 8:30 AM y las 7:00 PM.'
        isError = true;
    }

    return { 'is_error': isError, 'menssage': menssage }

}

const eventoDialogo = (id, event) => {
    isMenuCalender.value = false
    modal.value[3] = true

    if (event == 1) {
        motivoCancelacion.value = ""
        iconConf.value = 'tabler-report-off'
        menssageConf.value = 'Estas seguro de cancelar la cita?'
        subMenssage.value = "¡Advertencia! Está a punto de cancelar esta cita. Después de haber confirmado esto, la cita tendrá el estado Cancelada. Todavía estará disponible en la parte superior izquierdo y la historia del paciente, sin embargo, no será posible modificarlo."
        colorConf.value = 'warning'
        confEvent.value = 1
    }
    if (event == 2) {
        iconConf.value = 'tabler-checks'
        menssageConf.value = 'Desea activar al personal?'
        colorConf.value = 'success'
        confEvent.value = 2
    }
    if (event == 3) {
        iconConf.value = 'tabler-trash'
        menssageConf.value = 'Estas seguro de eliminar por completo los datos?'
        colorConf.value = 'error'
        confEvent.value = 3
    }
    idCita.value = id
}

const eventoConfirmacion = async () => {
    loadings.value[4] = true

    var data = {
        key_estado: confEvent.value == 1 ? 7 : 1,
        motivo_cancelacion: motivoCancelacion.value,
        key_usuario: null,
    }

    await axios({
        method: confEvent.value == 1 || confEvent.value == 2 ? 'PUT' : 'DELETE',
        url: `backend-citas/recuperar-eliminar-citas/${idCita.value}/`,
        data: data
    }).then(res => {
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': confEvent.value == 1 ? '¡Registro anulado 😞!' : confEvent.value == 2 ? '¡Registro Restaurado 🥳!' : '¡Registro Eliminados 😞!',
                'menssage': res.data.message,
                'type': 'success'
            }
            modal.value[3] = false
            listaCitas()
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

    loadings.value[4] = false
    eventMause()
}

const eventoReprogramarDuplicar = (items, event) => {

    isMenuCalender.value = false
    modal.value[4] = true

    if (event == 1) {
        titleCrud.value = "Reprogramar cita"
        fechaCita.value = moment(items.fecha_inicio)
        idCita.value = items.id

        horaCita.value = {
            hours: new Date(`${items.fecha_inicio} ${items.hora_inicio}`).getHours(),
            minutes: new Date(`${items.fecha_inicio} ${items.hora_inicio}`).getMinutes()
        }
        veterinario.value = items.key_veterinario
        duracion.value = parseInt(items.duracion)
        accion.value = 1
    }

    if (event == 2) {
        idCita.value = 0
        titleCrud.value = "Duplicar cita"

        duracion.value = parseInt(items.duracion)
        accion.value = 2
        servicio.value = items.key_servicio
        tipoCita.value = items.key_tipo_cita
        veterinario.value = items.key_veterinario
        cliente.value = items.key_cliente
        mascota.value = items.key_mascota
        fechaCita.value = moment()
        motivoConsulta.value = items.motivo_consulta
    }
}

const cargarReprogramacionDuplicar = async () => {
    loadings.value[5] = true
    if (accion.value == 1) {
        reprogramacion()
    } else if (accion.value == 2) {
        duplicar()
    }

    eventMause()
    loadings.value[5] = false
}

const duplicar = async () => {
    const formatHoraCita = horaCita.value.hours != undefined ? `${horaCita.value.hours}:${horaCita.value.minutes}` : horaCita.value
    const horaFin = moment(formatHoraCita, 'HH:mm').add(duracion.value, 'minutes').format('HH:mm');
    var isValidFecha = isValidarFechas(formatHoraCita)


    var data = {
        key_servicio: servicio.value,
        key_tipo_cita: tipoCita.value,
        key_veterinario: veterinario.value,
        key_cliente: cliente.value,
        key_mascota: mascota.value,
        fecha_inicio: moment(fechaCita.value, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        hora_inicio: formatHoraCita,
        hora_fin: horaFin,
        motivo_consulta: motivoConsulta.value,
        key_estado: 9,
        key_usuario: null,
    }

    if (isValidFecha.is_error && idCita.value == 0) {
        valueToas.value = {
            'status': true,
            'title': 'Horario no disponible 😞!',
            'menssage': isValidFecha.menssage,
            'type': 'warning'
        }
        loadings.value[5] = false
        return false
    }

    await axios({
        method: 'POST',
        url: "backend-citas/agregar-citas/",
        data: data
    }).then(res => {
        console.log(res);
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': '¡Registro Creado 🥳!',
                'menssage': res.data.message,
                'type': 'success'
            }

            modal.value[4] = false
            listaCitas()
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
}

const reprogramacion = async () => {
    const formatHoraCita = horaCita.value.hours != undefined ? `${horaCita.value.hours}:${horaCita.value.minutes}` : horaCita.value
    const horaFin = moment(formatHoraCita, 'HH:mm').add(duracion.value, 'minutes').format('HH:mm');
    var isValidFecha = isValidarFechas(formatHoraCita)

    var data = {
        key_veterinario: veterinario.value,
        fecha_inicio: moment(fechaCita.value, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        hora_inicio: formatHoraCita,
        hora_fin: horaFin,
    }

    if (isValidFecha.is_error) {
        valueToas.value = {
            'status': true,
            'title': 'Horario no disponible 😞!',
            'menssage': isValidFecha.menssage,
            'type': 'warning'
        }
        loadings.value[5] = false
        return false
    }

    await axios({
        url: `backend-citas/reprograr-citas/${idCita.value}/`,
        method: 'PUT',
        data: data
    }).then(res => {
        if (res.status == 200 && !res.data.is_error) {
            valueToas.value = {
                'status': true,
                'title': '¡Operacion exitosa 🥳!',
                'menssage': res.data.message,
                'type': 'success'
            }
            modal.value[4] = false
            listaCitas()
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

onMounted(() => {
    listaVeterinarios()
    listaClientes()
    listaMascotas()
    listaTipoCitas()
    listaServicios()
    listaCitas()
    listaTipoMascota()
    listaRaza()
})
watch(() => {
    itemsMascota.value = dataMascota.value.filter(x => x.key_cliente == cliente.value)
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
    <div>
        <VToast :icon="valueToas.icon" :title="valueToas.title" :menssage="valueToas.menssage"
            :status="valueToas.status" :type="valueToas.type" @closeToast="closeToast" @mouseover="eventMouseover"
            @mouseleave="eventMause"> </VToast>
        <div class="container d-flex">
            <div class="sidebar">
                <div class="menu-btn">
                    <VIcon @click="sidebarToggle()" class="icon-menu" icon="tabler-chevron-down"></VIcon>
                </div>

                <div class="nav-02">
                    <div class="menu text-center">
                        <div>
                            <p class="title p-0 m-0">
                                <VBtn color="#85C1E9" variant="tonal" @click="eventoNuevo()">
                                    <VIcon start icon="tabler-calendar-time" />
                                    Nuevo citas
                                </VBtn>
                            </p>
                        </div>
                        <VDivider />

                        <div class="calendario d-flex align-center justify-center">
                            <datepicker v-model="fechaActual" inline="true" language="es"></datepicker>

                        </div>

                        <VDivider class="mt-2 mb-3" />

                        <div>
                            <h3 class="text-h5">{{ moment(fechaActual).format('ddd DD [de] MMM') }}</h3>
                            <VCardTable :items="dataCitas" :filter="fechaActual" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="contant-base ms-1 w-100">
                <div class="container-body d-flex">

                    <VCard flat class="w-100">
                        <FullCalendar ref="refCalendar" :options="configCalendar" />
                    </VCard>
                </div>
            </div>
        </div>

        <VDialog v-model="modal[0]" max-width="600" persistent>
            <!-- Dialog close btn -->
            <DialogCloseBtn @click="modal[0] = !modal[0]" />

            <!-- Dialog Content -->
            <VCard :title="titleCrud">
                <VForm @submit.prevent="eventoCrud()">
                    <VCardText>
                        <VRow>

                            <VCol cols="12" sm="12" md="12">
                                <VAutocomplete prepend-inner-icon="tabler-stethoscope" variant="outlined"
                                    v-model="veterinario" label="Veterinarios" :items="dataVeterinario"
                                    item-title="apellido_nombre" item-value="id"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                            <VCol v-if="idCita == 0" cols="12" sm="12" md="12">
                                <div class="d-flex align-center align-center justify-center">
                                    <div class="w-100">
                                        <VAutocomplete prepend-inner-icon="tabler-friends" variant="outlined"
                                            v-model="cliente" label="Cliente" :items="dataClientes"
                                            item-title="dni_nombre" item-value="id"
                                            :rules="[(v) => !!v || 'Campo requerido']" />
                                    </div>
                                    <div class="ms-2">
                                        <VBtn color="#117864" variant="tonal" @click="eventoNuevoCliente()">
                                            <VIcon start icon="tabler-plus" />
                                            Nuevo
                                        </VBtn>
                                    </div>
                                </div>
                            </VCol>

                            <VCol cols="12" sm="12" md="12" v-else>
                                <VTextField prepend-inner-icon="tabler-friends"
                                    :value="dataClientes.find(x => x.id == cliente).apellido_nombre" :disabled="true" />
                            </VCol>

                            <VCol cols="12" sm="12" md="12">
                                <div class="d-flex align-center align-center justify-center">
                                    <div class="w-100">
                                        <VAutocomplete prepend-inner-icon="tabler-dog" variant="outlined"
                                            v-model="mascota" label="Mascota" :items="itemsMascota"
                                            item-title="nombre_mascota" item-value="id"
                                            :rules="[(v) => !!v || 'Campo requerido']" />
                                    </div>
                                    <div class="ms-2">
                                        <VBtn color="#117864" variant="tonal" @click="eventoNuevaMascota()">
                                            <VIcon start icon="tabler-plus" />
                                            Nuevo
                                        </VBtn>
                                    </div>
                                </div>
                            </VCol>

                            <VCol cols="12" sm="12" md="12">
                                <VAutocomplete prepend-inner-icon="tabler-brand-databricks" variant="outlined"
                                    v-model="tipoCita" label="Tipo de cita" :items="dataTipoCita"
                                    :rules="[(v) => !!v || 'Campo requerido']" item-title="tipo_cita" item-value="id" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VAutocomplete prepend-inner-icon="tabler-hotel-service" variant="outlined"
                                    v-model="servicio" label="Servicio" :items="dataServicios"
                                    :rules="[(v) => !!v || 'Campo requerido']" item-title="nombre_servicio"
                                    item-value="id" />
                            </VCol>

                            <VCol cols="12" sm="6" md="6">
                                <AppDateTimePicker v-model="fechaCita"
                                    :config="{ enableTime: false, dateFormat: 'd-m-Y' }" placeholder="Fecha" />
                            </VCol>

                            <VCol cols="12" sm="6" md="6">
                                <VueDatePicker v-model="horaCita" time-picker placeholder="Hora" />
                            </VCol>

                            <VCol cols="12" sm="12" md="12">
                                <label>Duración</label>
                                <VRadioGroup v-model="duracion" false-icon="tabler-alarm-off" true-icon="tabler-alarm"
                                    inline>
                                    <VRadio v-for="n in dataDuracion" :key="n" :label="`${n}`" :value="n"
                                        density="compact" />
                                </VRadioGroup>
                            </VCol>

                            <VCol cols="12" sm="12" md="12">
                                <VTextarea v-model="motivoConsulta" label="Motivo de la consulta"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                        </VRow>
                    </VCardText>

                    <VCardText class="d-flex align-center justify-center flex-wrap mt-5 gap-3">
                        <VBtn :loading="loadings[1]" :disabled="loadings[1]" type="submit">
                            {{ btnTextoCrud }}
                            <template #loader>
                                <span class="custom-loader">
                                    <VIcon icon="tabler-refresh" />
                                </span>
                                <span>Cargando...</span>
                            </template>
                        </VBtn>
                        <VBtn variant="tonal" color="secondary" @click="modal[0] = false">
                            Cerrar
                        </VBtn>
                    </VCardText>
                </VForm>
            </VCard>
        </VDialog>

        <!--MODEL CLIENTE--->
        <VDialog v-model="modal[1]" max-width="600">
            <!-- Dialog close btn -->
            <DialogCloseBtn @click="modal[1] = !modal[1]" />

            <!-- Dialog Content -->
            <VCard title="Registrar cliente">
                <VForm @submit.prevent="nuevoCliente()">
                    <VCardText>
                        <VRow>
                            <VCol cols="12" sm="12" md="12">
                                <VTextField v-model="dni" label="Documento de identidad"
                                    :rules="[(v) => !!v || 'Campo requerido']" type="text"
                                    append-inner-icon="tabler-search" @click:append-inner="buscarPersona()"
                                    :loading="loadings[1]" :disabled="loadings[1]" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VTextField prepend-inner-icon="tabler-signature" v-model="nombre" label="Nombres"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VTextField prepend-inner-icon="tabler-brand-lastfm" v-model="apellido"
                                    label="Apellidos" :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VTextField prepend-inner-icon="tabler-map-pins" v-model="direccion"
                                    label="Dirección" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VAutocomplete prepend-inner-icon="tabler-friends" variant="outlined" v-model="sexo"
                                    label="Sexo" :items="itemsSexo" :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VTextField prepend-inner-icon="tabler-device-mobile" v-model="numCel"
                                    label="Nro. Celular" :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>
                            <VCol cols="12" sm="12" md="12">
                                <VTextField prepend-inner-icon="tabler-brand-mailgun" v-model="correo" label="Correo" />
                            </VCol>
                        </VRow>
                    </VCardText>

                    <VCardText class="d-flex justify-end flex-wrap gap-3">
                        <VBtn variant="tonal" color="secondary" @click="modal[1] = false">
                            Cerrar
                        </VBtn>
                        <VBtn :loading="loadings[2]" :disabled="loadings[2]" type="submit">
                            Guardar
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

        <!--MODEL MASCOTA--->
        <VDialog v-model="modal[2]" max-width="600">
            <!-- Dialog close btn -->
            <DialogCloseBtn @click="modal[2] = !modal[2]" />

            <!-- Dialog Content -->
            <VCard title="Registrar mascota">
                <VForm @submit.prevent="nuevaMascota()">
                    <VCardText>
                        <VRow>
                            <VCol cols="12" sm="12" md="12">
                                <VAutocomplete prepend-inner-icon="tabler-friends" variant="outlined" v-model="cliente"
                                    label="Cliente" :items="dataClientes" item-title="apellido_nombre" item-value="id"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                            <VCol cols="12" sm="12" md="12">
                                <VTextField prepend-inner-icon="tabler-dog" v-model="nombre_mascota" label="Nombre"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                            <VCol cols="12" sm="12" md="12">
                                <VueDatePicker prepend-inner-icon="tabler-calendar" v-model="fechaNacimiento"
                                    placeholder="Fecha de nacimiento" auto-apply text-input format="dd/MM/yyyy"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                            <VCol cols="12" sm="6" md="6">
                                <VAutocomplete prepend-inner-icon="tabler-friends" variant="outlined"
                                    v-model="sexoMascota" label="Genero" :items="itemsSexoMascota"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                            <VCol cols="12" sm="6" md="6">
                                <VTextField type="color" prepend-inner-icon="tabler-color-filter" v-model="color"
                                    label="Color de la mascota" />
                            </VCol>

                            <VCol cols="12" sm="12" md="12">
                                <VAutocomplete prepend-inner-icon="tabler-dog-bowl" variant="outlined" v-model="tipo"
                                    label="Tipo de mascota" :items="dataTipoMascota" item-title="tipo" item-value="id"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                            <VCol cols="12" sm="12" md="12">
                                <VAutocomplete prepend-inner-icon="tabler-paw" variant="outlined" v-model="raza"
                                    label="Raza" :items="dataRaza" item-title="nombre_raza" item-value="id"
                                    :rules="[(v) => !!v || 'Campo requerido']" />
                            </VCol>

                        </VRow>
                    </VCardText>

                    <VCardText class="d-flex align-center justify-center flex-wrap mt-5 gap-3">
                        <VBtn :loading="loadings[3]" :disabled="loadings[3]" type="submit">
                            Guardar
                            <template #loader>
                                <span class="custom-loader">
                                    <VIcon icon="tabler-refresh" />
                                </span>
                                <span>Cargando...</span>
                            </template>
                        </VBtn>
                        <VBtn variant="tonal" color="secondary" @click="modal[2] = false">
                            Cerrar
                        </VBtn>
                    </VCardText>
                </VForm>
            </VCard>
        </VDialog>

        <div id="menu-calender" v-show="isMenuCalender">
            <VCard min-width="360" v-for="items in itemsCitasId">
                <div class="py-2 px-5 d-flex align-center justify-space-between w-100">
                    <VCardTitle class="py-0 px-0 title-menu-calendar">
                        <VIcon :icon="items.icon" :color="items.color"></VIcon> <span :class="`text-${items.color}`">{{
            items.estado }}</span>
                    </VCardTitle>
                    <div class="btn-close-menu">
                        <button class="close" type="button" @click="isMenuCalender = !isMenuCalender">x</button>
                    </div>
                </div>

                <VCardText class="py-1 px-5">
                    <div class="d-flex align-center justify-space-between w-100 mb-2">
                        <div class="container-inf-client">
                            <div class="content-info">
                                <VIcon icon="tabler-friends"></VIcon> {{ items.nombre_completo_cliente }}
                            </div>
                            <div class="content-info">
                                <VIcon icon="tabler-phone"></VIcon> {{ items.num_cel }}
                            </div>
                            <div class="content-info ">
                                <VIcon icon="tabler-dog"></VIcon> {{ items.nombre_mascota }}
                            </div>
                            <div class="content-info ">
                                <VIcon icon="tabler-manual-gearbox"></VIcon> {{ items.edad }}
                            </div>
                            <div class="content-info">
                                <VIcon icon="tabler-gender-bigender"></VIcon> {{ items.sexo_mascota }}
                            </div>
                        </div>
                        <div class="container-inf-calender">
                            <div class="dia-calendar">
                                <div class="control-dia-calendar">
                                    <div class="conteiner-mes">{{ moment(items.fecha_inicio).format('MMMM') }}</div>
                                    <div class="container-dia">
                                        <div class="fecha-dia">{{ moment(items.fecha_inicio).format('DD') }}</div>
                                        <div class="fecha-nombre">{{ moment(items.fecha_inicio).format('dddd') }}</div>
                                    </div>
                                    <div class="conteiner-hora">{{ items.hora_inicio }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <VDivider />

                    <div class="w-100 mt-2 mb-2">
                        <div class="container-inf-client">
                            <div class="content-info">
                                <VIcon icon="tabler-hotel-service"></VIcon> {{ items.nombre_servicio }}
                            </div>
                            <div class="content-info">
                                <VIcon icon="tabler-credit-card"></VIcon> S/{{ items.precio }}
                            </div>
                            <div class="content-info ">
                                <VIcon icon="tabler-stethoscope"></VIcon> {{ items.nombre_completo_veterinario }}
                            </div>
                        </div>
                    </div>

                    <VDivider />

                    <div class="w-100 mt-3 mb-2">
                        <div class="mb-3">
                            <VBtn v-if="[9, 5].includes(items.key_estado)" class="w-100 font-12 mb-3" variant="outlined"
                                color="success">
                                <VIcon icon="tabler-stethoscope"></VIcon> <span class="ms-2">Iniciar cita</span>
                            </VBtn>
                            <VBtn v-if="[9, 8, 5].includes(items.key_estado)" class="w-100 font-12" variant="outlined"
                                color="secundary" @click="eventoDialogo(items.id, 1)">
                                <VIcon icon="tabler-report-off"></VIcon> <span class="ms-2">Cancelar cita</span>
                            </VBtn>
                            <VBtn v-else class="w-100 font-12" variant="outlined" color="info">
                                <VIcon icon="tabler-stethoscope"></VIcon> <span class="ms-2">Ver</span>
                            </VBtn>
                        </div>

                        <div v-if="[9, 8, 5].includes(items.key_estado)" class="w-100">
                            <VBtn class="font-12" style="width:48.5%;" variant="outlined" color="secundary"
                                @click="eventoReprogramarDuplicar(items, 1)">
                                <VIcon icon="tabler-calendar-stats"></VIcon> <span class="ms-2"> Reprogramar</span>
                            </VBtn>

                            <VBtn style="width:48.5%;" class="ms-2 font-12" variant="outlined" color="secundary"
                                @click="eventoEditar(items)">
                                <VIcon icon="tabler-calendar-stats"></VIcon> <span class="ms-2"> editar</span>
                            </VBtn>
                        </div>

                        <div v-else class="w-100">
                            <VBtn @click="eventoReprogramarDuplicar(items, 2)" class="font-12 w-100" variant="outlined"
                                color="secundary">
                                <VIcon icon="tabler-calendar-stats"></VIcon> <span class="ms-2"> duplicar</span>
                            </VBtn>
                        </div>
                    </div>

                </VCardText>
            </VCard>
        </div>

        <VDialog v-model="modal[3]" persistent class="v-dialog-sm">
            <!-- Dialog Content -->
            <VCard>
                <VCardText>
                    <div class="d-flex justify-center align-center mt-3 mb-3 flex-column">
                        <VIcon size="90" :icon="iconConf" :color="colorConf" />
                        <h6 class="text-lg font-weight-medium">{{ menssageConf }}</h6>
                    </div>
                    <div v-if="subMenssage != ''">
                        <p>{{ subMenssage }}</p>
                        <p>Antes de empezar por favor explica el motivo</p>
                        <div>
                            <VTextarea v-model="motivoCancelacion" label="Motivo de cancelación"
                                :rules="[(v) => !!v || 'Campo requerido']" />
                        </div>
                    </div>
                </VCardText>
                <VCardText class="d-flex justify-center gap-3 flex-wrap mb-5">
                    <VBtn @click="eventoConfirmacion()" :loading="loadings[4]" :disabled="loadings[4]">
                        Confirmar
                        <template #loader>
                            <span class="custom-loader">
                                <VIcon icon="tabler-refresh" />
                            </span>
                            <span>Cargando...</span>
                        </template>
                    </VBtn>
                    <VBtn color="secondary" variant="tonal" @click="modal[3] = false">
                        Cancelar
                    </VBtn>
                </VCardText>
            </VCard>
        </VDialog>

        <VDialog v-model="modal[4]" persistent class="v-dialog-sm" min-width="700">
            <DialogCloseBtn @click="modal[4] = !modal[4]" />
            <!-- Dialog Content -->
            <VCard :title="titleCrud">
                <VCardText>
                    <VRow>
                        <VCol cols="12" sm="6" md="6">
                            <datepicker v-model="fechaCita" inline="true" language="es"></datepicker>
                        </VCol>
                        <VCol cols="12" sm="6" md="6">
                            <p class="font-12 text-justify">Indiquen la fecha conveniente en el calendario,
                                luego seleccione el horario que deseada.</p>

                            <VueDatePicker class="mt-2" v-model="horaCita" time-picker placeholder="Hora" />

                            <VCardTable :items="dataCitas" :filter="fechaCita" />

                        </VCol>

                    </VRow>
                    <VRow>
                        <VCol>
                            <VAutocomplete prepend-inner-icon="tabler-stethoscope" variant="outlined"
                                v-model="veterinario" label="Veterinarios" :items="dataVeterinario"
                                item-title="apellido_nombre" item-value="id"
                                :rules="[(v) => !!v || 'Campo requerido']" />
                        </VCol>
                    </VRow>
                </VCardText>
                <VCardText class="d-flex justify-center gap-3 flex-wrap mb-5">
                    <VBtn @click="cargarReprogramacionDuplicar()" :loading="loadings[5]" :disabled="loadings[5]">
                        Confirmar
                        <template #loader>
                            <span class="custom-loader">
                                <VIcon icon="tabler-refresh" />
                            </span>
                            <span>Cargando...</span>
                        </template>
                    </VBtn>
                    <VBtn color="secondary" variant="tonal" @click="modal[4] = false">
                        Cancelar
                    </VBtn>
                </VCardText>
            </VCard>
        </VDialog>

    </div>
</template>