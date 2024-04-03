<script setup>
import _ from 'lodash';
const props = defineProps({
    headers: Object,
    items: Object,
    search: String,
    loadings: Boolean,
    itemsPerPage: Number,
    page: Number,
    type: String,
    showSelect: Boolean,
    link: Boolean
})

const header = ref(props.headers)
const loadings = ref()
const processData = ref([])
const search = ref('')
const rowPerPage = ref(5)
const currentPage = ref(1)
const itemsData = ref([])
const totalPage = ref(1)
const total = ref(0)
const filterSelect = ref([])
const data = ref([])
const f = ref()
const showIcon = ref([])
const type = ref(props.type)
const itemsSelect = ref([])
const showSelect = ref(props.showSelect)
const linkRouter = ref(props.link)

const onGet = (params) => {
    const { q = '', perPage = 0, currentPage = 1 } = params ?? {}

    data.value = props.items

    const queryLower = q.toLowerCase()

    const filter = new Set();

    /*lista de mi datos*/
    data.value.forEach(rowData => {
        header.value.forEach(rowHeader => {
            if (rowHeader.key != 'actions') {
                if (rowData[rowHeader.key] != undefined) {
                    if (rowData[rowHeader.key].toString().toLowerCase().includes(queryLower)) {
                        filter.add(rowData)
                    }
                }
            }
        })
    })

    const filtrar = Array.from(filter)

    var lista = new Set()

    header.value.forEach(rowHeader => {
        if (filterSelect.value[rowHeader.key] != undefined || filterSelect.value[rowHeader.key] != null) {

            showIcon.value[rowHeader.key] = filterSelect.value[rowHeader.key].length > 0 ? true : false

            filterSelect.value[rowHeader.key].forEach(rowSelec => {
                filtrar.forEach(rowFilter => {
                    if (rowFilter[rowHeader.key].toString().toLowerCase().includes(rowSelec.toString().toLowerCase())) {
                        lista.add(rowFilter);
                    }
                })
            })
        }
    })


    const filtrarSelect = Array.from(lista)

    const total = filtrarSelect.length == 0 ? filtrar.length : filtrarSelect.length
    const totalPage = filtrarSelect.length == 0 ? Math.ceil(filtrar.length / perPage) ? Math.ceil(filtrar.length / perPage) : 1
        : Math.ceil(filtrarSelect.length / perPage) ? Math.ceil(filtrarSelect.length / perPage) : 1

    const datosTabla = filtrarSelect.length == 0 ? filtrar : filtrarSelect

    return [200, { query: paginateArray(datosTabla, perPage, currentPage), totalPage, total }]
}

const paginateArray = (array, perPage, page) => array.slice((page - 1) * perPage, page * perPage)

watchEffect(() => {
    processData.value = onGet({
        q: search.value,
        perPage: rowPerPage.value,
        currentPage: currentPage.value,
    })

    totalPage.value = processData.value[1].totalPage
    total.value = processData.value[1].total
    itemsData.value = processData.value[1].query

    loadings.value = props.loadings
})

const orderAcend = (key) => {
    itemsData.value = _.orderBy(itemsData.value, [key], ['asc']);
    return itemsData.value
}
const orderDes = (key) => {
    itemsData.value = _.orderBy(itemsData.value, [key], ['desc']);
    return itemsData.value
}

const paginationData = computed(() => {
    const firstIndex = itemsData.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0
    const lastIndex = itemsData.value.length + (currentPage.value - 1) * rowPerPage.value

    return `Mostrando ${firstIndex} a ${lastIndex} de ${total.value} Registros`
})


</script>
<template>
    <div class="mt-5">

        <div class="d-flex flex-wrap align-center justify-space-between gap-y-5 flex-column flex-sm-row mb-5">
            <div></div>
            <div style="width: 15rem;">
                <!-- busqueda  -->
                <VTextField v-if="type != 'standard'" v-model="search" placeholder="" label="Buscar" density="compact" />
            </div>
        </div>

        <VTable>
            <thead>
                <tr>
                    <!--checking de seleccion--->
                    <th class="text-center" v-if="showSelect">
                        <div class="d-flex align-center justify-center" style="width: 60px;">
                            <slot name="selectHeader">
                            </slot>
                        </div>
                    </th>

                    <!---Creación de cabecera--->
                    <th class="text-center" v-for="rowHeader in header">
                        <!---Valores que no tomara en cuenta--->
                        <div v-if="rowHeader.key == 'status' || rowHeader.key == 'actions' || type == 'standard' || type == 'medium'"
                            class="d-flex align-center justify-space-between">
                            <!--titulo de  la cabecera-->
                            <div class="w-100">
                                <span>{{ rowHeader.title }}</span>
                            </div>

                            <!---Ordenar para el tipo basico y medium-->
                            <div v-if="rowHeader.key != 'actions' && type != 'full'" class="d-flex flex-column">
                                <span>
                                    <VIcon color="#8d8f8a" @click="orderAcend(rowHeader.key)" icon="tabler-chevron-up"
                                        class="me-3" />
                                </span>
                                <span>
                                    <VIcon color="#8d8f8a" @click="orderDes(rowHeader.key)" icon="tabler-chevron-down"
                                        class="me-3" />
                                </span>
                            </div>
                        </div>

                        <!--Menu personalizado para el tipo full-->
                        <VMenu :close-on-content-click="false" width="230" max-width="230" min-width="230"
                            location="bottom center"
                            v-if="rowHeader.key != 'status' && rowHeader.key != 'actions' && type == 'full'">
                            <template #activator="{ props }">
                                <span v-bind="props" class="header-table-menu">
                                    {{ rowHeader.title }}
                                    <VIcon v-if="showIcon[rowHeader.key]" icon="tabler-filter-check"
                                        style="font-size: 14px;"></VIcon>
                                </span>
                            </template>

                            <VList nav :lines="false">
                                <VListItem min-width="150px" class="mx-auto" max-width="380px">
                                    <VListItemTitle style="font-size: 10px;">
                                        FILTRAR {{ rowHeader.title.toUpperCase() }}
                                    </VListItemTitle>

                                    <AppAutocomplete v-model="filterSelect[rowHeader.key]"
                                        :items="Array.from(new Set(data.map(x => x[rowHeader.key])))"
                                        :placeholder="'Seleccionar ' + rowHeader.title" chips closable-chips multiple />
                                </VListItem>
                                <!--Ordenar tabla-->
                                <VListItem link @click="orderAcend(rowHeader.key)">
                                    <template #prepend>
                                        <VIcon color="#8d8f8a" icon="tabler-chevron-up" class="me-3" />
                                    </template>

                                    <VListItemTitle style="font-size: 11px;">
                                        ORDENAR ASCENDENTE
                                    </VListItemTitle>
                                </VListItem>

                                <VListItem link @click="orderDes(rowHeader.key)">
                                    <template #prepend>
                                        <VIcon color="#8d8f8a" icon="tabler-chevron-down" class="me-3" />
                                    </template>

                                    <VListItemTitle style="font-size: 11px;">
                                        ORDENAR DESCENDENTE
                                    </VListItemTitle>
                                </VListItem>

                                <VDivider class="my-2 d-sm-flex  d-none" />

                                <VListItem link @click="filterSelect[rowHeader.key] = []">
                                    <template #prepend>
                                        <VIcon icon="tabler-backspace" class="me-3" />
                                    </template>

                                    <VListItemTitle style="font-size: 11px;">
                                        BORRAR FILTRO
                                    </VListItemTitle>
                                </VListItem>

                            </VList>
                        </VMenu>
                    </th>
                </tr>
            </thead>

            <!-- cuerpo de nuestra tabla -->

            <tbody>
                <tr v-for="rowBody in itemsData" :key="rowBody.id">
                    <td v-if="showSelect" class="text-center">
                        <slot name="selectBody" :key="rowBody.id" :item="rowBody">
                        </slot>
                    </td>

                    <td v-if="linkRouter" v-for="rowHeader in header">
                        <RouterLink v-if="linkRouter"
                            :to="{ name: 'control-ticket-detalle-id', params: { id: rowBody.id } }" tag="tr">
                            <slot :name="rowHeader.key" :key="rowBody.id" :item="rowBody">
                            </slot>

                            <div v-if="!$slots[rowHeader.key]" class="text-center">
                                <span>{{ rowBody[rowHeader.key] }}</span>
                            </div>
                        </RouterLink>
                    </td>

                    <td v-else v-for="rowHeader in header" class="text-center">
                        <slot :name="rowHeader.key" :key="rowBody.id" :item="rowBody">
                        </slot>

                        <div v-if="!$slots[rowHeader.key]" class="text-center">
                            <span>{{ rowBody[rowHeader.key] }}</span>
                        </div>
                    </td>
                </tr>

            </tbody>

            <!-- footer de nuestra tabla--->
            <tfoot v-show="!loadings && itemsData.length == 0">
                <tr>
                    <td :colspan="header.length" class="text-center">
                        No hay registros para mostrar
                    </td>
                </tr>
            </tfoot>

            <tfoot class="m-auto text-center" v-show="loadings">
                <tr>
                    <td :colspan="header.length" class="text-center">
                        <div class="d-flex align-center justify-center fill-height">
                            <v-progress-circular color="success" indeterminate></v-progress-circular>
                            <label for="" class="ms-5">Obteniendo datos ...</label>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </VTable>

        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
            <div class="me-3" style="width: 80px;">
                <VSelect v-model="rowPerPage" density="compact" variant="outlined" :items="[5, 10, 20, 30, 50]" />
            </div>
            <span class="text-sm text-disabled">
                {{ paginationData }}
            </span>

            <VPagination v-model="currentPage" size="small" :total-visible="5" rounded="circle" :length="totalPage" />
        </VCardText>
    </div>
</template> 