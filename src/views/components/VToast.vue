<template>
    <div v-bind:class="status == true ? 'toast-alt ' + activeClass : 'toast-alt'">
        <div class="toast-content">
            <div class="heder-toast">
                <span :class="'check btn-label-' + type">
                    <VIcon
                        :icon="type == 'success' ? 'mdi-check' : type == 'error' ? 'mdi-alert' : 'mdi-alert-rhombus-outline'">
                    </VIcon>
                </span>
                <span :class="'text text-1 text-' + type">{{ title }}</span>
            </div>

            <div class="menssage-toast">
                <span class="text text-2">{{ menssage }}</span>
            </div>

            <VIcon icon="mdi-close" class="close" @click="emit('closeToast')"></VIcon>
            <!--<div :class="status == true ? 'progress ' + activeClass : 'progress'"></div>-->
            <i class="fa-solid fa-xmark close"></i>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    status: Boolean,
    title: String,
    menssage: String,
    icon: String,
    type: String,
});

const activeClass = ref("active");

const emit = defineEmits(["closeToast", "action"]);

onMounted(() => {
    //eventEnter();
});
</script>
