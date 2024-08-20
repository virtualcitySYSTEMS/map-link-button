<template>
  <AbstractConfigEditor
    @submit="apply"
    v-bind="{ ...$attrs, ...$props }"
    v-if="localConfig"
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
  import {
    AbstractConfigEditor,
    VcsList,
    VcsFormSection,
    VcsListItem,
  } from '@vcmap/ui';
  import { getLogger } from '@vcsuite/logger';
  import { PropType, Ref, computed, defineComponent, ref, watch } from 'vue';
  import { VDialog } from 'vuetify/components';
  import { v4 as uuid } from 'uuid';
  import getDefaultOptions, {
    LinkButton,
    LinkButtonConfig,
  } from './defaultOptions.js';
  import ButtonEditor from './ButtonEditor.vue';
  import { name } from '../package.json';

  export default defineComponent({
    name: 'LinkButtonConfigEditor',
    title: 'LinkButton Editor',
    components: {
      AbstractConfigEditor,
      VcsFormSection,
      VcsList,
      VDialog,
      ButtonEditor,
    },
    props: {
      getConfig: {
        type: Function as PropType<() => Promise<LinkButtonConfig>>,
        required: true,
      },
      setConfig: {
        type: Function,
        required: true,
      },
    },
    setup(props) {
      const editButtonAtIndex: Ref<number | undefined> = ref();
      const listItems: Ref<VcsListItem[]> = ref([]);

      const localConfig: Ref<LinkButtonConfig | undefined> = ref(undefined);
      const defaultOptions = getDefaultOptions();
      props
        .getConfig()
        .then((config: LinkButtonConfig) => {
          localConfig.value = {
            ...config,
            buttons:
              config.buttons?.map((buttonOptions) => {
                return { ...defaultOptions, ...buttonOptions };
              }) ?? [],
          };
        })
        .catch((err) => getLogger(name).error(err));

      async function apply(): Promise<void> {
        await props.setConfig(localConfig.value);
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
                  listItems.value =
                    localConfig.value?.buttons?.map(createListItem);
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
        { immediate: true },
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
              listItems.value = localConfig.value.buttons.map(createListItem);
            } else {
              editButtonAtIndex.value = undefined;
            }
          },
        }),
      };
    },
  });
</script>
