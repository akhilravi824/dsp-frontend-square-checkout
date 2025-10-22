<script lang="ts">
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';

  let { data, onSelect, group } = $props<{ data: any; onSelect: (id: string) => void; group?: string }>();
  let inputRef = $state<HTMLInputElement>();

  function handleSelection(id: string) {
    onSelect(id);
  }
</script>

<label class="input-radio input-radio-with-icon type:body-large" for={data.id}>
  <input
    bind:this={inputRef}
    tabindex="-1"
    id={data.id}
    name={group}
    value={data.id}
    type="radio"
    aria-checked={false}
    onchange={() => handleSelection(data.id)}
  />
  {#if data.icon && data.icon.id}
    <Icon type={ICONS[data.icon.id]} />
  {/if}
  <span>{data.title}</span>
</label>

<style lang="scss">
  .input-radio {
    background: var(--color-dark-5);
    border-radius: var(--border-radius-sm);
    border: 2px solid transparent;
    transition:
      color 0.2s ease-in-out,
      border-color 0.2s ease-in-out;
    display: flex;
    position: relative;
    cursor: pointer;
    color: var(--color-dark-100);
    outline: none;

    input {
      appearance: none;
      margin: 0;
      background-color: #fff;
      position: absolute;
      left: 0;
      top: 0;
    }

    &:hover,
    &:focus {
      border-color: var(--color-dark-100);
    }

    &:has(input[type='radio']:checked) {
      border-color: var(--color-primary-blue);
      color: var(--color-primary-blue);
      --icon-color: var(--color-primary-blue);
    }
  }

  .input-radio-with-icon {
    padding-inline: 32px;
    padding-block: 27px;
    align-items: center;
    gap: 16px;
  }
</style>
