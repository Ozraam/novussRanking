<script setup lang="ts">
defineProps({
    selectionPossible: {
        type: Array<string>,
        required: true
    }
})

const selected = ref(0)

const emit = defineEmits(['switch'])

watch(selected, () => {
    emit('switch', selected.value)
})
</script>

<template>
    <div class="elo-system-switcher">
        <label
            for="switcher"
            class="elo-system-switcher__label"
        >
            Ranking system selector
        </label>

        <div class="elo-system-switcher__switch">
            <div
                v-for="(option, index) in selectionPossible"
                :key="index"
                class="elo-system-switcher__switch__option"
            >
                <input
                    :id="option"
                    v-model="selected"
                    type="radio"
                    name="switcher"
                    class="elo-system-switcher__switch__input"
                    @change="selected = index"
                >

                <label
                    :for="option"
                    class="elo-system-switcher__switch__label"
                >
                    {{ option }}
                </label>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.elo-system-switcher {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    margin-top: 10px;

    &__switch {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 2px solid $valid;
        border-radius: 20px;
        overflow: hidden;
        padding: 5px 10px;
        width: 100%;
        position: relative;

        &__option {
            position: relative;
            flex: 1;
            text-align: center;
            cursor: pointer;
            transition: color 0.5s ease-out;

            &:hover {
                color: $valid;
            }
        }

        &__label {
            cursor: pointer;
        }

        &__input {
            display: none;
        }

        &::before {
            position: absolute;
            content: '';
            height: 100%;
            border-radius: 4px;
            background-color: rgba($primary, 0.5);
            left: calc(v-bind('selected') * 100% / v-bind('selectionPossible.length'));
            right: calc(100% - (v-bind('selected') + 1) * 100% / v-bind('selectionPossible.length'));
            top: 0;
            transition: 0.5s ease-in-out;
            transition-property: left, right;
            transition-delay: 0s, 100ms;
        }
    }
}
</style>
