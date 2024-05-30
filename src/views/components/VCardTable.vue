<script setup>
import img1 from "@/assets/images/evento-calendar.svg";
import moment from 'moment';


const props = defineProps({
    items: Object,
    filter: String
})

const data = ref([])
const filter = ref()
const rowPerPage = ref(4)
const currentPage = ref(1)
const procesarData = ref([])
const totalPage = ref(1)
const total = ref(0)
const formateoData = ref([])

const onGet = (params) => {
    const { perPage = 0, currentPage = 1 } = params ?? {}
    data.value = props.items
    filter.value = props.filter

    const formatFecha = moment(filter.value).format('YYYY-MM-DD')

    const itemsData = data.value.filter(citas => citas.fecha_inicio === formatFecha)

    const total = itemsData.length

    const totalPage = Math.ceil(itemsData.length / perPage) ? Math.ceil(itemsData.length / perPage) : 1

    return [200, { query: paginateArray(itemsData, perPage, currentPage), totalPage, total }]
}

const paginateArray = (array, perPage, page) => array.slice((page - 1) * perPage, page * perPage)

watchEffect(() => {
    procesarData.value = onGet({
        perPage: rowPerPage.value,
        currentPage: currentPage.value,
    })

    totalPage.value = procesarData.value[1].totalPage
    total.value = procesarData.value[1].total
    formateoData.value = procesarData.value[1].query
})
</script>
<template>
    <div>
        <div class="card-calendar" v-for="item in  formateoData ">
            <div :title="item.estado" :class="'card-boder-vertica boder-' + item.color"
                style="background-color: rgb(255, 255, 255); z-index: 1; border-style: solid; border-width: 1px;">
            </div>

            <div class="container-card-calendar">
                <div class="card-calendar-hora">
                    <div class="calendar-hora">
                        <div :title='moment(item.hora_inicio, " HH:mm a").format("HH:mm a")'
                            class="text-hora-calendar font-12">
                            {{ moment(item.hora_inicio, "HH:mm a").format("HH:mm") }}
                        </div>
                    </div>

                    <div class="texto-general-calender">
                        <div :title="item.nombre_servicio" class="text-base">
                            {{ item.nombre_servicio }}
                        </div>
                    </div>
                </div>

                <div class="card-calendar-hora">
                    <div class="calendar-hora">
                        <div :title='moment(item.hora_fin, "HH:mm a").format("HH:mm a")'
                            class="text-hora-calendar font-12">
                            {{ moment(item.hora_fin, "HH:mm a").format("HH:mm") }}
                        </div>
                    </div>

                    <div class="texto-general-calender">
                        <div :title="item.nombre_completo_veterinario" class="text-base">
                            {{ item.nombre_completo_veterinario }}
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div style="display: flex; height: 100%; justify-content: center; flex-direction: column;">
            <div v-show="formateoData.length == 0" style="height: 35vh;">
                <div class="d-flex align-center justify-center fill-height w-100">
                    <div class="d-flex align-center flex-column ">
                        <img :src="img1" alt="imagen de referencia">
                        <span class="font-12">No hay nada planeado para el día</span>
                        <span class="font-12">¡Disfrútelo!</span>
                    </div>
                </div>
            </div>
        </div>

        <VCardText v-show="formateoData.length > 0"
            class="d-flex align-center flex-wrap justify-center gap-4 py-3 px-5">

            <VPagination v-model="currentPage" size="small" :total-visible="5" rounded="circle" :length="totalPage" />
        </VCardText>
    </div>
</template>