<script setup>
const prop = defineProps({
    items: Object
})

const dataHeader = ref(prop.items)

</script>
<template>
    <div class="breadcrumbs-detalle" style="background-color: transparent;">
        <div class="d-flex align-center gap-2 w-100">
            <div v-for="items in dataHeader">
                <div class="d-flex align-center" v-if="items.isActiveUrl">
                    <RouterLink :to="{ name: items.path }" class="d-flex align-center gap-1">

                        <VIcon :icon="items.icon"></VIcon>
                        <span>{{ items.name }}</span>

                    </RouterLink>
                    <div>
                        <VIcon icon="tabler-chevron-right"></VIcon>
                    </div>
                </div>

                <div v-else class="d-flex align-center gap-1">
                    <VIcon :icon="items.icon"></VIcon>
                    <span>{{ items.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>