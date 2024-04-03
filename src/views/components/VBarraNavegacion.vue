<script setup>
import silder from "@/assets/images/slide-3.jpg";
const props = defineProps({
    isActive: {
        type: Boolean,
        required: true
    },
    items: Object,
    headers: Object,
})

const datos = ref([])
const search = ref('')
const rowPerPage = ref(8)
const currentPage = ref(1)
const totalPage = ref(1)
const total = ref(0)
const procesarDatos = ref([])
const headers = ref(props.headers)
const formateoData = ref([])
const activarRespuesta = ref(false)

const emit = defineEmits([
    'update:isActive'
])

const handleMenu = value => {
    emit('update:isActive', value)
}
const onGet = (params) => {
    const { q = '', perPage = 0, currentPage = 0 } = params ?? {}

    const queryLower = q.toLowerCase()
    datos.value = props.items

    //const itemsDatos = datos.value.filter(buscar => buscar.asunto.toLowerCase().includes(queryLower))
    const itemsDatos = new Set()

    datos.value.forEach(row => {
        headers.value.forEach(rowHeaders => {
            if (row[rowHeaders.key] != undefined && row[rowHeaders.key].toString().toLowerCase().includes(queryLower)) {
                itemsDatos.add(row);
            }
        })
    })

    const datosFiltrados = Array.from(itemsDatos)

    const total = datosFiltrados.length
    const totalPage = Math.ceil(datosFiltrados.length / perPage) ? Math.ceil(datosFiltrados.length / perPage) : 1

    return [{ status: 200 }, { query: paginateArray(datosFiltrados, perPage, currentPage), totalPage, total }]
}

const paginateArray = (array, perPage, page) => array.slice((page - 1) * perPage, page * perPage)

watchEffect(() => {
    procesarDatos.value = onGet({
        q: search.value,
        perPage: rowPerPage.value,
        currentPage: currentPage.value,
    })

    totalPage.value = procesarDatos.value[1].totalPage
    total.value = procesarDatos.value[1].total
    formateoData.value = procesarDatos.value[1].query
})
</script>

<template>
    <div>
        <VNavigationDrawer temporary location="end" :width="800" :model-value="props.isActive" class="app-customizer"
            @update:model-value="handleMenu">
            <!-- 👉 Header -->
            <VCard class="search-header" :style="{ 'background': `url(${silder})` }" flat>
                <VCardText class="text-center">
                    <h3 class="text-h3 font-weight-medium mb-2">Hola <br> ¿En qué podemos ayudarte?</h3>
                    <AppTextField v-model="search" label="" prepend-inner-icon="tabler-search"
                        placeholder="Busque una pregunta" class="mb-2" />
                    <p>Busque la pregunta y respuesta que desee</p>
                </VCardText>
            </VCard>

            <VCard class="position-relative py-8 px-6" flat>
                <VExpansionPanels v-model="activarRespuesta" multiple>
                    <VExpansionPanel v-for="item in formateoData" :key="item.id" :title="item.asunto"
                        :text="item.descripcion" />
                </VExpansionPanels>
                <div v-show="formateoData.length == 0"
                    style="display: flex; height: 100%; justify-content: center; flex-direction: column;">
                    <div v-show="formateoData.length == 0" style="height: 35vh;">
                        <div class="d-flex align-center justify-center fill-height w-100">
                            <div class="d-flex align-center flex-column ">
                                <VIcon size="80" icon="tabler-stethoscope-off" class="mb-4" />
                                <span class="font-12">Sin resultados</span>
                                <!-- <span class="font-12">¡Disfrútelo!</span> -->
                            </div>
                        </div>
                    </div>
                </div>
                <VCardText v-show="formateoData.length > 0"
                    class="d-flex align-center flex-wrap justify-center gap-4 py-3 px-5 mt-3">

                    <VPagination v-model="currentPage" size="small" :total-visible="5" rounded="circle"
                        :length="totalPage" />
                </VCardText>
            </VCard>

        </VNavigationDrawer>
    </div>
</template>