<script setup>
import axios from '@axios';
import moment from 'moment';
import VueApexCharts from 'vue3-apexcharts';

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


const selectTitle = ref(['Anual'])
const usuario = ref(JSON.parse(localStorage.getItem('userData')))
const datosTotalCita = ref([])
const clientesNuevos = ref([])
const clientesFrecuentes = ref([])
const totalCitasIngresos = ref([])
const serviciosUtil = ref([])
const totalMacotaCliente = ref([])
const totalTiempoReg = ref([])

const convertirTexto = () => {
  var caracter = usuario.value.nombre_apellido.toLowerCase().split(' ')
  caracter[0] = caracter[0].charAt(0).toUpperCase() + caracter[0].substring(1)
  return caracter[0];
}

const consultasTotalCitas = async () => {
  datosTotalCita.value = []

  datosTotalCita.value = await axios.get('backend-citas/total-citas-estados/').then(res => res.data.result).catch(err => err)
}

const consulta = async () => {
  clientesNuevos.value = []
  clientesFrecuentes.value = []
  totalCitasIngresos.value = []
  serviciosUtil.value = []
  totalMacotaCliente.value = []
  totalTiempoReg.value = []

  var tipo = selectTitle.value[0] == 'Ultimos 7 dias' || selectTitle.value[0] == 'Ultimos 30 dias' ? 'fechas' : 'anual'
  var fechaInicio = selectTitle.value[0] == 'Ultimos 7 dias' ? moment().subtract(7, 'days').format('YYYY-MM-DD') : selectTitle.value[0] == 'Ultimos 30 dias' ? moment().subtract(30, 'days').format('YYYY-MM-DD') : ''
  var fecha_fin = moment().format('YYYY-MM-DD')

  var data = {
    'tipo': tipo,
    'fecha_inicio': fechaInicio,
    'fecha_fin': fecha_fin,
    'limite': 4
  }

  clientesNuevos.value = await axios({ url: 'backend-citas/total-clientes-nuevo/', method: 'POST', data: data }).then(res => res.data.data).catch(err => err)
  clientesFrecuentes.value = await axios({ url: 'backend-citas/total-clientes-frecuentes/', method: 'POST', data: data }).then(res => res.data.data).catch(err => err)
  totalCitasIngresos.value = await axios({ url: 'backend-citas/total-citas-ingresos/', method: 'POST', data: data }).then(res => res.data.data).catch(err => err)
  serviciosUtil.value = await axios({ url: 'backend-citas/total-servicios-utilizados/', method: 'POST', data: data }).then(res => res.data.data).catch(err => err)
  totalMacotaCliente.value = await axios({ url: 'backend-citas/total-mascotas-clientes/', method: 'POST', data: data }).then(res => res.data.data).catch(err => err)
  totalTiempoReg.value = await axios({ url: 'backend-citas/total-tiempo-registro/', method: 'POST', data: data }).then(res => res.data.data).catch(err => err)

}
onMounted(() => {
  consultasTotalCitas()
})

watch(() => {
  consulta()
})
const datosSelector = ref([
  {
    name: "Ultimos 7 dias",
  },
  {
    name: "Ultimos 30 dias",
  },
  {
    name: "Anual",
  },
])
const generarColorHex = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

const chartConfig = computed(() => {
  var temasColores = Array.from({ length: serviciosUtil.value.length }, generarColorHex)

  return [
    {
      chartOptions: {
        chart: {
          width: '100%',
          height: 350,
          type: 'area',
          zoom: {
            enabled: false
          },
          toolbar: { show: false },
        },
        colors: [selectTitle.value[0] == 'Ultimos 7 dias' ? '#6dca94' : selectTitle.value[0] == 'Ultimos 30 dias' ? '#A569BD' : '#AF7AC5'],
        stroke: {
          curve: 'smooth',
          width: 3
        },
        markers: {
          size: 4,
          strokeWidth: 2,
          strokeOpacity: 0,
          colors: ['#336e03'],
          strokeColors: ['#fff'],
        },
        dataLabels: {
          enabled: false
        },
        grid: {
          padding: { top: -10 },
          borderColor: "#E5E7E9",
          xaxis: {
            lines: { show: true },
          },
          yaxis: {
            lines: { show: true },
          },
        },
        xaxis: {
          categories: clientesNuevos.value.map(x => moment(x.fecha, 'YYYY-MM-DD').format('DD MMM')),
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
          },
        },
        tooltip: {
          custom(data) {
            return `<div class='bar-chart pa-2'>
                    <span class="title">Cliente nuevos</span>
                    <br>
                    <spa class="sub-title">cantidad: ${clientesNuevos.value.find(x => x.porcentaje.toFixed(2) == data.series[data.seriesIndex][data.dataPointIndex]).total_clientes}</span>
                    <br>
                    <span class="sub-title">porcentaje: ${data.series[data.seriesIndex][data.dataPointIndex]} %</span>
        </div>`
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
            formatter: function (value) {
              // Personaliza el formato de la etiqueta del eje Y
              if (value != null || value != undefined) {
                return `${value.toFixed(0)} %`
              } else {
                return ''
              }
            },
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            gradientToColors: ['#82E0AA'],
            shadeIntensity: 1,
            type: 'horizontal',
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100]
          },
        }
      },
      series: [
        {
          data: clientesNuevos.value.map(x => x.porcentaje.toFixed(2))
        }
      ]
    },

    {
      chartOptions: {
        chart: {
          width: '100%',
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          },
          toolbar: { show: false },
        },
        colors: ['#2E86C1'],
        stroke: {
          curve: 'smooth',
          width: 3
        },
        markers: {
          size: 4,
          strokeWidth: 2,
          strokeOpacity: 0,
          colors: ['#9B59B6'],
          strokeColors: ['#fff'],
        },
        dataLabels: {
          enabled: false
        },
        grid: {
          padding: { top: -10 },
          borderColor: "#E5E7E9",
          xaxis: {
            lines: { show: true },
          },
          yaxis: {
            lines: { show: true },
          },
        },
        xaxis: {
          categories: totalCitasIngresos.value.map(x => selectTitle.value[0] != 'Anual' ? moment(x.fecha_inicio, 'YYYY-MM-DD').format('DD MMM') : moment(x.fecha, 'YYYY-MM-DD').format('MMM')),
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
          },
        },
        tooltip: {
          custom(data) {
            return `<div class='bar-chart pa-2'>
                    <span class="title">Ingresos</span>
                    <br>
                    <span class="sub-title">S/${data.series[data.seriesIndex][data.dataPointIndex]}</span>
        </div>`
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
            formatter: function (value) {
              // Personaliza el formato de la etiqueta del eje Y
              if (value != null || value != undefined) {
                return `S/${value.toFixed(0)}`
              } else {
                return ''
              }
            },
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            gradientToColors: ['#9B59B6'],
            shadeIntensity: 1,
            type: 'horizontal',
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100]
          },
        }
      },
      series: [
        {
          data: totalCitasIngresos.value.map(x => x.ingresos)
        }
      ]
    },

    {
      chartOptions: {
        chart: {
          width: '100%',
          height: 230,
          type: 'line',
          zoom: {
            enabled: false
          },
          toolbar: { show: false },
        },
        colors: ['#D68910'],
        stroke: {
          // curve: 'smooth',
          width: 3
        },

        dataLabels: {
          enabled: false
        },
        grid: {
          padding: { top: -10 },
          borderColor: "tranparent",
          xaxis: {
            lines: { show: true },
          },
          yaxis: {
            lines: { show: true },
          },
        },
        xaxis: {
          categories: totalCitasIngresos.value.map(x => selectTitle.value[0] != 'Anual' ? moment(x.fecha_inicio, 'YYYY-MM-DD').format('DD MMM') : moment(x.fecha, 'YYYY-MM-DD').format('MMM')),
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
          },
        },
        tooltip: {
          custom(data) {
            return `<div class='bar-chart pa-2'>
                    <span class="title">Citas</span>
                    <br>
                    <spa class="sub-title">cantidad: ${totalCitasIngresos.value.find(x => x.porcentaje.toFixed(2) == data.series[data.seriesIndex][data.dataPointIndex]).totales_citas}</span>
                    <br>
                    <span class="sub-title">${data.series[data.seriesIndex][data.dataPointIndex]}%</span>
        </div>`
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
            formatter: function (value) {
              // Personaliza el formato de la etiqueta del eje Y
              if (value != null || value != undefined) {
                return `${value.toFixed(0)}`
              } else {
                return ''
              }
            },
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            gradientToColors: ['#82E0AA'],
            shadeIntensity: 1,
            type: 'horizontal',
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100]
          },
        }
      },
      series: [
        {
          data: totalCitasIngresos.value.map(x => x.porcentaje)
        }
      ]
    },

    {
      chartOptions: {
        chart: {
          height: 350,
          type: 'donut',
          toolbar: { show: false },
        },
        legend: {
          show: false,
        },
        stroke: { lineCap: 'round' },
        labels: serviciosUtil.value.map(x => x.nombre_servicio),
        colors: ['#9f24aa', '#3ed128', '#3af112', '#b3b0d4', '#b3a83f', '#f8fc7c', '#acd2b9', '#1325b0', '#8ec9af', '#90be4d', '#d22846', '#9b0ae9'],
        dataLabels: {
          enabled: true,
          formatter: val => `${parseInt(val, 10)}%`,
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  fontSize: '.85rem',
                },
                value: {
                  fontSize: '.85rem',
                  color: '#8b90b2',
                  formatter: val => `${parseInt(val, 10)}`,
                },
                total: {
                  show: true,
                  fontSize: '.8rem',
                  label: serviciosUtil.value.map(x => x.nombre_servicio)[0],
                  formatter: () => serviciosUtil.value.map(x => x.total_servicios)[0],
                  color: '#8b90b2',
                },
              },
            },
          },
        },
        // grid: {
        //   padding: {
        //     top: -30,
        //     bottom: -25,
        //   },
        // },
      },
      series: serviciosUtil.value.map(x => x.total_servicios)
    },

    {
      chartOptions: {
        chart: {
          width: '100%',
          height: 315,
          type: 'line',
          zoom: {
            enabled: false
          },
          toolbar: { show: false },
        },
        legend: {
          show: false,
        },
        //colors: ['#2E4053', '#5DADE2', '#BA4A00', '#45B39D', '#2ECC71'],
        stroke: {
          curve: 'smooth',
          width: 3
        },
        // markers: {
        //   size: 4,
        //   strokeWidth: 2,
        //   strokeOpacity: 0,
        //   colors: ['#336e03'],
        //   strokeColors: ['#fff'],
        // },
        dataLabels: {
          enabled: false
        },
        grid: {
          padding: { top: -10 },
          borderColor: "transparent",
          xaxis: {
            lines: { show: true },
          },
          yaxis: {
            lines: { show: true },
          },
        },
        xaxis: {
          categories: clientesNuevos.value.map(x => moment(x.fecha, 'YYYY-MM-DD').format('DD MMM')),
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
          },
        },
        // tooltip: {
        //   custom(data) {
        //     return `<div class='bar-chart pa-2'>
        //             <span class="title">Cliente nuevos</span>
        //             <br>
        //             <spa class="sub-title">cantidad: ${clientesNuevos.value.find(x => x.porcentaje.toFixed(2) == data.series[data.seriesIndex][data.dataPointIndex]).total_clientes}</span>
        //             <br>
        //             <span class="sub-title">porcentaje: ${data.series[data.seriesIndex][data.dataPointIndex]} %</span>
        // </div>`
        //   },
        // },
        yaxis: {
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
            formatter: function (value) {
              // Personaliza el formato de la etiqueta del eje Y
              if (value != null || value != undefined) {
                return `${value.toFixed(0)}`
              } else {
                return ''
              }
            },
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            gradientToColors: ['#82E0AA'],
            shadeIntensity: 1,
            type: 'horizontal',
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100]
          },
        }
      },
      series: [
        {
          name: 'MARIA LOURDES',
          data: [2, 5, 2, 2]
        },
        {
          name: 'JOSE ALEXANDER',
          data: [2, 1, 1, 3]
        },
        {
          name: 'MARICIELO CASTILLO',
          data: [4, 3, 6, 3]
        },
        {
          name: 'BRONIA INDIRA',
          data: [8, 5, 2, 3]
        },
      ]
    },

    {
      chartOptions: {
        chart: {
          type: 'bar',
          height: 450,
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            barHeight: '55%',
            borderRadius: 10,
            startingShape: 'rounded',
            colors: {
              backgroundBarRadius: 15,
              backgroundBarOpacity: 0.8,
              backgroundBarColors: ["#F2F2F2"],
            },
            distributed: true,
            horizontal: true,
            dataLabels: {
              position: 'bottom'
            },
            borderRadiusApplication: "end",
          }
        },
        colors: ['#99A3A4', '#34495E', '#1ABC9C', '#FFA07A', '#2E86C1', '#F1C40F', '#9B59B6', '#90ee7e',
          '#E74C3C', '#69d2e7'
        ],
        dataLabels: {
          enabled: true,
          textAnchor: 'start',
          style: {
            colors: ['#FBFCFC'],
            fontWeight: '600',
            fontFamily: 'Public Sans',
          },
          formatter: function (val, opt) {
            return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
          },
          offsetX: 0,
          dropShadow: {
            enabled: true
          }
        },
        stroke: {
          width: 1,
          colors: ['#fff']
        },
        xaxis: {
          categories: totalMacotaCliente.value.map(x => x.nombre_completo_cliente),
          axisBorder: {
            show: false
          },
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '12px',
              fontFamily: 'Public Sans',
            },
          },
        },
        yaxis: {
          labels: {
            show: false
          }
        },

        legend: {
          show: false  // Esto oculta la leyenda
        },

        grid: {
          padding: { top: -10 },
          borderColor: "#E5E7E9",
          xaxis: {
            lines: { show: true },
          },
          yaxis: {
            lines: { show: true },
          },
        },

        fill: {
          opacity: 1
        },
      },
      series: [{
        data: totalMacotaCliente.value.map(x => x.total_mascota)
      }],
    },

    {
      chartOptions: {
        chart: {
          width: '100%',
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          },
          toolbar: { show: false },
        },
        title: {
          text: 'Tiempo promedio de registro de citas',
          align: 'left',

          color: '#8b90b2',

        },
        colors: ['#4472C4', '#ED7D31'],
        stroke: {
          //curve: 'smooth',
          width: 3
        },
        markers: {
          size: 3,
          strokeWidth: 2,
          strokeOpacity: 0,
          colors: ['#4472C4', '#ED7D31'],
          strokeColors: ['#4472C4', '#ED7D31'],
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: totalTiempoReg.value.map(x => moment(x.fecha, 'YYYY-MM-DD').format('DD MMM')),
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
            formatter: function (value) {
              // Personaliza el formato de la etiqueta del eje Y
              if (value != null || value != undefined) {
                return `${value}`
              } else {
                return ''
              }
            },
          },
        }
      },
      series: [
        {
          data: totalTiempoReg.value.map(f => f.segundos),
        }
      ]
    },
  ]
})

const chartPreTest = computed(() => {
  const totalDias = []
  for (let i = 1; i <= 30; i++) {
    totalDias.push(i)
  }

  const totalTest = [
    {
      name: "Pre Test",
      data: [
        7.59,
        7.01,
        8.63,
        9.00,
        10.8,
        7.94,
        7.79,
        9.38,
        9.21,
        9.09,
        11.5,
        6.23,
        8.73,
        9.77,
        8.46,
        7.91,
        8.08,
        8.69,
        7.43,
        9.32,
        10.5,
        9.47,
        7.79,
        8.24,
        8.08,
        11.8,
        9.40,
        6.01,
        6.33,
        7.93,

      ]
    },
    {
      name: "Post Test",
      data: [
        1.03,
        1.66,
        1.54,
        1.35,
        2.24,
        1.50,
        1.09,
        1.52,
        0.97,
        1.52,
        1.49,
        1.42,
        1.38,
        2.16,
        1.62,
        1.51,
        1.17,
        0.96,
        1.82,
        1.51,
        0.94,
        1.24,
        0.93,
        2.10,
        1.39,
        0.90,
        1.87,
        1.57,
        1.46,
        1.68,
      ]
    }
  ]

  const totalTasaCliente = [
    {
      name: "Pre Test",
      data: [
        0.83,
        1.22,
        2.00,
        0.79,
        2.33,
        0.39,
        1.15,
        1.87,
        0.74,
        0.00,
        0.37,
        1.46,
        0.72,
        1.08,
        0.00,
        1.41,
        0.70,
        0.70,
        0.35,
        0.00,
        0.69,
        1.02,
        1.01,
        1.33,
        0.33,
        0.99,
        0.33,
        1.61,
        0.96,
        1.26,
      ]
    },
    {
      name: "Post Test",
      data: [
        1.64,
        2.40,
        0.79,
        2.70,
        2.26,
        1.85,
        1.10,
        1.80,
        1.42,
        1.05,
        1.72,
        2.68,
        1.97,
        1.62,
        2.22,
        1.25,
        1.54,
        1.81,
        1.19,
        2.33,
        1.44,
        1.97,
        1.66,
        1.90,
        2.13,
        1.83,
        1.29,
        2.02,
        1.00,
        1.72,
      ]
    }
  ]
  return [
    {
      chartOptions: {
        chart: {
          width: '100%',
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          },
          toolbar: { show: false },
        },
        title: {
          text: 'Tiempo promedio de registro de citas',
          align: 'left',

          color: '#8b90b2',

        },
        colors: ['#4472C4', '#ED7D31'],
        stroke: {
          //curve: 'smooth',
          width: 3
        },
        markers: {
          size: 3,
          strokeWidth: 2,
          strokeOpacity: 0,
          colors: ['#4472C4', '#ED7D31'],
          strokeColors: ['#4472C4', '#ED7D31'],
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: totalDias,
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
            formatter: function (value) {
              // Personaliza el formato de la etiqueta del eje Y
              if (value != null || value != undefined) {
                return `${value}`
              } else {
                return ''
              }
            },
          },
        }
      },
      series: totalTest,
    },

    {
      chartOptions: {
        chart: {
          width: '100%',
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          },
          toolbar: { show: false },
        },
        title: {
          text: 'Tasa de incremento de clientes',
          align: 'left',

          color: '#8b90b2',

        },
        colors: ['#4472C4', '#ED7D31'],
        stroke: {
          //curve: 'smooth',
          width: 3
        },
        markers: {
          size: 3,
          strokeWidth: 2,
          strokeOpacity: 0,
          colors: ['#4472C4', '#ED7D31'],
          strokeColors: ['#4472C4', '#ED7D31'],
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: totalDias,
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#8b90b2',
              fontSize: '11px',
              fontFamily: 'Public Sans',
            },
            formatter: function (value) {
              // Personaliza el formato de la etiqueta del eje Y
              if (value != null || value != undefined) {
                return `${value}`
              } else {
                return ''
              }
            },
          },
        }
      },
      series: totalTasaCliente,
    },
  ]
})
</script>
<template>
  <div>
    <VRow class="py-6">
      <VCol cols="12">
        <div class="pe-3">
          <h3 class="text-h3 text-high-emphasis mb-1">
            Bienvenida de nuevo, <span class="font-weight-medium"> {{ convertirTexto() }} 👋🏻 </span>
          </h3>

          <div class="mb-2 text-wrap" style="max-inline-size: 400px;">
            Visualiza los reportes que se ha generados de citas, clientes y veterinarios
          </div>

          <div class="d-flex justify-space-between flex-wrap gap-4 flex-column flex-md-row">
            <div v-for="items in datosTotalCita">
              <div class="d-flex">
                <VAvatar variant="tonal" :color="items.color" rounded size="54" class="text-primary me-4">
                  <VIcon :icon="items.icon" size="38" />
                </VAvatar>
                <div>
                  <span class="text-base">{{ items.nombre_estado }}</span>
                  <h4 class="text-h4 font-weight-medium" :class="`text-${items.color}`">
                    {{ items.total_citas }}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VCol>

      <VCol cols="12" md="6">
        <VueApexCharts :options="chartPreTest[0].chartOptions" :series="chartPreTest[0].series" height="300"
          class="mt-3 w-100" />
      </VCol>

      <VCol cols="12" md="6">
        <VueApexCharts :options="chartPreTest[1].chartOptions" :series="chartPreTest[1].series" height="300"
          class="mt-3 w-100" />
      </VCol>

    </VRow>

    <VRow>
      <VCol cols="12">
        <div class="d-flex flex-wrap align-center justify-space-between gap-y-5 flex-column flex-sm-row">
          <div class="d-flex gap-3">

            <label class="v-label text-body-2 text-high-emphasis" for="firstName">Filtro rapido:</label>

            <VMenu class="" transition="slide-y-transition" activator="parent" width="80px" offset="14px"
              :close-on-content-click="false">
              <template #activator="{ props }">
                <VBtn variant="outlined" size="small" v-bind="props"
                  class="text-upper title-header-conteiner d-flex align-center" style="cursor: pointer;">
                  <span> {{ selectTitle[0] }} </span>
                  <template #append>
                    <VIcon size="16" icon="tabler-chevron-down" />
                  </template>
                </VBtn>
              </template>
              <VList v-model:selected="selectTitle">
                <VListItem v-for="item in datosSelector" :key="item.key" :value="item.name">
                  <VListItemTitle>{{ item.name }}</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>

          </div>
        </div>
      </VCol>

      <VCol cols="12">
        <VueApexCharts :options="chartConfig[6].chartOptions" :series="chartConfig[6].series" height="300"
          class="mt-3 w-100" />
      </VCol>

      <VCol md="4" cols="12">
        <VCard flat style="background-color: transparent !important;">
          <VCardItem class="pb-0">
            <VCardTitle>Clientes nuevos</VCardTitle>
            <VCardSubtitle>Reporte de cantidad de clientes nuevos</VCardSubtitle>
          </VCardItem>
          <VCardText class="mt-2">
            <div class="d-flex align-center gap-2 mb-2 pb-1 flex-wrap">
              <h4 class="text-h1">
                {{ clientesNuevos[0] != undefined ? clientesNuevos[clientesNuevos.length - 1].total_clientes : 0 }}
              </h4>
              <VChip label color="success">
                {{ selectTitle[0] == 'Anual' ? 'Total anual' : 'Total de hoy' }}
              </VChip>
            </div>

            <!-- <span class="text-sm text-disabled">You informed of this week compared to last week</span> -->
          </VCardText>
        </VCard>

        <VCard flat style="background-color: transparent !important;">
          <VCardItem class="pb-0">
            <VCardTitle>Clientes frecuentes</VCardTitle>
            <VCardSubtitle>Reporte de cantidad de clientes frecuentes</VCardSubtitle>
          </VCardItem>
          <VCardText class="">
            <VList style="background-color: transparent !important;">
              <VListItem v-for="items in clientesFrecuentes" key="">
                <template #prepend>
                  <VProgressCircular v-model="items.porcentaje" :size="54" class="me-4" color="success">
                    <span class="text-body-1 text-high-emphasis font-weight-medium">
                      {{ items.porcentaje.toFixed(0) }}%
                    </span>
                  </VProgressCircular>
                </template>
                <VListItemTitle class="font-weight-medium mb-2">
                  {{ items.nombre_completo_cliente }}
                </VListItemTitle>

                <VListItemSubtitle>Cantidad: {{ items.total_citas }}</VListItemSubtitle>
                <!-- <template #append>
                  {{ items.total_citas }}
                </template> -->
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>

      <VCol md="8" cols="12">
        <VCard flat title="Informes de los clientes" :subtitle="`Resumen de los nuevos clientes en ${selectTitle[0]}`">
          <VCardText>
            <div v-if="chartConfig[0].series[0].data.length != 0">
              <VueApexCharts :options="chartConfig[0].chartOptions" :series="chartConfig[0].series" height="300"
                class="mt-3 w-100" />
            </div>

            <div v-else class="d-flex align-center justify-center" style="height: 30vh;">
              <span>NO SE ENCONTRARON DATOS</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol md="7" cols="12">
        <VCard flat title="Informes de ingresos" :subtitle="`Resumen de ingresos ${selectTitle[0]}`">
          <VCardText>
            <div v-if="chartConfig[1].series[0].data.length != 0">
              <VueApexCharts :options="chartConfig[1].chartOptions" :series="chartConfig[1].series" height="300"
                class="mt-3 w-100" />
            </div>
            <div v-else class="d-flex align-center justify-center" style="height: 30vh;">
              <span>NO SE ENCONTRARON DATOS</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol md="5" cols="12">
        <VCard flat style="background-color: transparent !important;">
          <VCardItem class="pb-0">
            <VCardTitle>Total Ingresos</VCardTitle>
            <VCardSubtitle>Reporte de cantidad de ingresos</VCardSubtitle>
          </VCardItem>
          <VCardText class="mt-2">
            <div class="d-flex align-center gap-2 mb-2 pb-1 flex-wrap">
              <h4 class="text-h1">
                S/{{ totalCitasIngresos[0] != undefined ? totalCitasIngresos[totalCitasIngresos.length - 1].ingresos : 0
                }}
              </h4>
              <VChip label color="success">
                {{ selectTitle[0] == 'Anual' ? 'Total anual' : 'Total de hoy' }}
              </VChip>
            </div>

            <!-- <span class="text-sm text-disabled">You informed of this week compared to last week</span> -->
          </VCardText>
        </VCard>

        <VCard flat style="background-color: transparent !important;">
          <VCardItem class="pb-0">
            <VCardTitle>Cantidad de citas</VCardTitle>
            <VCardSubtitle>Reporte de cantidad de citas por dias </VCardSubtitle>
          </VCardItem>
          <VCardText class="">

            <div v-if="chartConfig[2].series[0].data.length != 0">
              <VueApexCharts :options="chartConfig[2].chartOptions" :series="chartConfig[2].series" height="250"
                class="mt-3 w-100" />
            </div>

            <div v-else class="d-flex align-center justify-center" style="height: 15vh;">
              <span>NO SE ENCONTRARON DATOS</span>
            </div>

          </VCardText>
        </VCard>
      </VCol>
      <!--SERVICIOS-->
      <VCol md="4" cols="12">
        <VCard flat title="Servicios mas solicitados"
          :subtitle="`Resumen de los servicios mas solicitado en ${selectTitle[0]}`">
          <VCardText>
            <div v-if="chartConfig[3].series.length != 0">
              <VueApexCharts :options="chartConfig[3].chartOptions" :series="chartConfig[3].series" height="300"
                class="mt-3 w-100" />
            </div>

            <div v-else class="d-flex align-center justify-center" style="height: 15vh;">
              <span>NO SE ENCONTRARON DATOS</span>
            </div>

          </VCardText>
        </VCard>
      </VCol>
      <!--VETERINARIO-->
      <VCol md="8" cols="12">
        <VCard style="background-color: transparent;" flat title="Informes del veterinario"
          :subtitle="`Resumen de los veterinario mas solicitados pordia durante ${selectTitle[0]}`">
          <VCardText>
            <VueApexCharts :options="chartConfig[4].chartOptions" :series="chartConfig[4].series" height="300"
              class="mt-3 w-100" />
          </VCardText>
        </VCard>
      </VCol>
      <!--CANTIDAD DE MASCOTA-->
      <VCol md="8" cols="12">
        <VCard flat title="Informes de Cantidad de mascota por cliente"
          :subtitle="`Resumen de las cantidades de mascotas por cliente ${selectTitle[0]}`">
          <VCardText>
            <VueApexCharts :options="chartConfig[5].chartOptions" :series="chartConfig[5].series" height="300"
              class="mt-3 w-100" />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
<route lang="yaml">
  meta:
    action: read
    subject: Inicio
</route>
