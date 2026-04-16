<template>
  <input v-bind="props" type="file" @change="handleFileChange" />
</template>

<script lang="ts">
export type ChangeEvent = ChangeEvent.Pre | ChangeEvent.Post

export namespace ChangeEvent {
  export type Pre = Event & Readonly<{ target: HTMLInputElement }>
  export type Post = Pre & Readonly<{ valid: true; file: File } | { valid: false; file: null }>
}
</script>

<script setup lang="ts">
import { FileValidationError, FileValidator } from '@/utils/fileValidator'
import { JSX } from 'vue/jsx-runtime'

type Props = Omit</* @vue-ignore */ JSX.IntrinsicElements['input'], 'type' | 'onChange'> & {
  validator?: FileValidator
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'prevalidate', event: ChangeEvent.Pre): void
  (e: 'change', event: ChangeEvent.Post): void
}>()

async function validateFile(file: File) {
  // @ts-ignore
  if (props.validator) {
    try {
      const result = await props.validator(file)
      if (!result.ok) {
        throw new FileValidationError(result.error ?? 'Unknown Error')
      }
    } catch (e) {
      alert(e)
      console.error('Error validating file.', e)
      return false
    }
  }
  return true
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  emit('prevalidate', event as ChangeEvent.Pre)
  if (file && (await validateFile(file))) {
    emit('change', { ...event, target, valid: true, file })
  } else {
    target.value = ''
    emit('change', { ...event, target, valid: false, file: null })
  }
}
</script>

<style scoped>
input {
  height: 2.67em;
  font-size: 1rem;
  width: calc(100% - 0.67em);
  padding: 5px;
  border-radius: 5px;
  outline: dashed 2px var(--vp-c-gray-1);
  box-sizing: content-box;
}

input::file-selector-button {
  height: 100%;
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  border: var(--vp-button-brand-border);
  padding: 0px 1em;
  border-radius: 5px;
  margin-right: 1em;
  transition: background-color 200ms;
  font-size: 1rem;
  font-family: var(--vp-font-family-base);
  font-weight: bold;
  text-transform: uppercase;
}

input:disabled::file-selector-button {
  background-color: var(--vp-c-gray-3);
  color: var(--vp-c-gray-1);
  border: var(--vp-c-gray-2);
  cursor: not-allowed;
}

input:enabled::file-selector-button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
  cursor: pointer;
}

input:enabled::file-selector-button:active {
  background-color: var(--vp-button-brand-active-bg);
  color: var(--vp-button-brand-active-text);
}
</style>
