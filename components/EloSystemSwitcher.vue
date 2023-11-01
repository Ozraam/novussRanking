<script setup lang="ts">
defineProps({
    useEloMatchBased: {
        type: Boolean,
        required: true
    }
})
</script>

<template>
    <div class="elo-system-switcher">
        <label
            for="switcher"
            class="elo-system-switcher__label"
        >
            Match based elo system
        </label>

        <div class="elo-system-switcher__switch">
            <input
                id="switcher"
                type="checkbox"
                :checked="useEloMatchBased"
                @change="event => $emit('switch', (event.target! as HTMLInputElement).checked)"
            >
        </div>
    </div>
</template>

<style scoped lang="scss">
.elo-system-switcher {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    margin-top: 10px;

    &__switch {
        display: flex;
        align-items: center;
        gap: 10px;
        border: 2px solid $valid;
        border-radius: 20px;
        overflow: hidden;

        input {
            appearance: none;
            width: 40px;
            height: 20px;
            position: relative;
            cursor: pointer;

            &::before {
                content: '';
                position: absolute;
                display: block;
                width: 20px;
                height: 5px;
                border-radius: 30px;
                background-color: $wrong;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                transition: background-color 0.2s ease-in-out;
            }

            &::after {
                content: '';
                position: absolute;
                display: block;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: $primary;
                left: 0;
                transition: left 0.2s ease-in-out;
            }

            &:checked {

                &::after {
                    left: 20px;
                }

                &::before {
                    background-color: $valid;
                }
            }
        }
    }
}
</style>
