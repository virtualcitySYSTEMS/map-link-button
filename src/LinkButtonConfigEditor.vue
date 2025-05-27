<template>
  <AbstractConfigEditor
    v-if="localConfig"
    v-bind="{ ...$attrs, ...$props }"
    @submit="apply"
  >
    <VcsFormSection
      heading="linkButton.editor.buttons"
      expandable
      :start-open="true"
      :header-actions="headerActions"
    >
      <VcsList :items="listItems" :show-title="false" />
      <v-dialog
        v-if="buttonOptions"
        :model-value="true"
        width="400"
        :persistent="true"
      >
        <ButtonEditor
          v-model="buttonOptions"
          @close="buttonOptions = undefined"
        />
      </v-dialog>
    </VcsFormSection>
  </AbstractConfigEditor>
</template>

<script lang="ts">
  import type { VcsListItem } from '@vcmap/ui';
  import { AbstractConfigEditor, VcsList, VcsFormSection } from '@vcmap/ui';
  import { getLogger } from '@vcsuite/logger';
  import type { PropType, Ref } from 'vue';
  import { computed, defineComponent, ref, watch, toRaw } from 'vue';
  import { VDialog } from 'vuetify/components';
  import { v4 as uuid } from 'uuid';
  import type { LinkButton, LinkButtonConfig } from './defaultOptions.js';
  import getDefaultOptions from './defaultOptions.js';
  import ButtonEditor from './ButtonEditor.vue';
  import { name } from '../package.json';

  export default defineComponent({
    name: 'LinkButtonConfigEditor',
    components: {
      AbstractConfigEditor,
      VcsFormSection,
      VcsList,
      VDialog,
      ButtonEditor,
    },
    props: {
      getConfig: {
        type: Function as PropType<() => LinkButtonConfig>,
        required: true,
      },
      setConfig: {
        type: Function as PropType<(config: object | undefined) => void>,
        required: true,
      },
    },
    setup(props) {
      const editButtonAtIndex: Ref<number | undefined> = ref();
      const listItems: Ref<VcsListItem[]> = ref([]);

      const pluginConfig = props.getConfig();
      const defaultOptions = getDefaultOptions();
      const localConfig = ref({
        ...pluginConfig,
        buttons:
          pluginConfig.buttons?.map((buttonOptions) => {
            return { ...defaultOptions, ...buttonOptions };
          }) ?? [],
      });

      function apply(): void {
        const buttons = localConfig.value.buttons?.map((buttonOptions) =>
          toRaw(buttonOptions),
        );
        props.setConfig({ ...pluginConfig, buttons });
      }

      function createListItem(
        buttonConfig: LinkButton,
        index: number,
      ): VcsListItem {
        const infoComplete =
          buttonConfig.title && buttonConfig.templateUrl && buttonConfig.icon;
        return {
          name: uuid(),
          title: buttonConfig.title || 'linkButton.editor.titleMissing',
          icon: infoComplete ? undefined : 'mdi-alert',
          tooltip: infoComplete ? undefined : 'linkButton.editor.infoMissing',
          actions: [
            {
              name: 'linkButton.editor.edit',
              icon: '$vcsEdit',
              callback(): void {
                editButtonAtIndex.value = index;
              },
            },
            {
              name: 'linkButton.editor.remove',
              icon: '$vcsTrashCan',
              callback(): void {
                if (localConfig.value?.buttons) {
                  localConfig.value.buttons.splice(index, 1);
                }
              },
            },
          ],
        };
      }

      watch(
        localConfig,
        (config) => {
          if (config?.buttons) {
            listItems.value = config.buttons.map(createListItem);
          } else {
            listItems.value = [];
          }
        },
        { immediate: true, deep: true },
      );

      return {
        localConfig,
        apply,
        listItems,
        headerActions: [
          {
            name: 'linkButton.editor.add',
            icon: '$vcsPlus',
            callback(): void {
              if (localConfig.value?.buttons) {
                localConfig.value.buttons.push(getDefaultOptions());
                listItems.value = localConfig.value.buttons.map(createListItem);
              } else {
                getLogger(name).error('no local config available');
              }
            },
          },
        ],
        buttonOptions: computed({
          get(): Required<LinkButton> | undefined {
            if (editButtonAtIndex.value !== undefined) {
              return localConfig.value?.buttons?.[editButtonAtIndex.value] as
                | Required<LinkButton>
                | undefined;
            } else {
              return undefined;
            }
          },
          set(value: Required<LinkButton> | undefined) {
            if (
              value &&
              editButtonAtIndex.value !== undefined &&
              localConfig.value?.buttons
            ) {
              localConfig.value.buttons[editButtonAtIndex.value] = value;
            } else {
              editButtonAtIndex.value = undefined;
            }
          },
        }),
      };
    },
  });
</script>
