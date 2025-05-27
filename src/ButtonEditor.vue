<template>
  <v-card>
    <VcsFormSection
      heading="linkButton.editor.buttonEditor"
      :header-actions="headerActions"
    >
      <v-form ref="validationForm" v-model="isValid">
        <v-container class="px-2 pt-0 pb-2">
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="link-button-url" :required="true">
                {{ $t('linkButton.editor.templateUrl') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsTextArea
                id="link-button-url"
                v-model="localLinkButtonOptions.templateUrl"
                rows="2"
                :placeholder="'https://new.virtualcitymap.de/?state=[[[\u007B\u007BcameraPosition\u007D\u007D],[\u007B\u007BgroundPosition\u007D\u007D],\u007B\u007Bdistance\u007D\u007D,\u007B\u007Bheading\u007D\u007D,\u007B\u007Bpitch\u007D\u007D,\u007B\u007Broll\u007D\u007D],\u0022;cesium\u0022,[\u0022VC Map Demo\u0022]]'"
                :rules="[requiredRule]"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="link-button-title" :required="true">
                {{ $t('linkButton.editor.title') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsTextField
                id="link-button-title"
                v-model="localLinkButtonOptions.title"
                :placeholder="$t('linkButton.editor.titlePlaceholder')"
                :rules="[requiredRule]"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="link-button-icon" :required="true">
                {{ $t('linkButton.editor.icon') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsTextField
                id="link-button-icon"
                v-model="localLinkButtonOptions.icon"
                :placeholder="$t('linkButton.editor.iconPlaceholder')"
                :rules="[requiredRule]"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="link-button-buttonLocation">
                {{ $t('linkButton.editor.buttonLocation') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsSelect
                id="link-button-buttonLocation"
                v-model="localLinkButtonOptions.buttonLocation"
                :items="availableButtonLocations"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="link-button-epsg">
                {{ $t('linkButton.editor.projection') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsTextField
                id="link-button-epsg"
                v-model="epsg"
                :placeholder="$t('linkButton.editor.epsgPlaceholder')"
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="justify-end">
            <v-col cols="6">
              <VcsTextField
                id="link-button-proj4"
                v-model="proj4"
                :placeholder="$t('linkButton.editor.proj4Placeholder')"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-divider />
      <div class="d-flex justify-end pa-2">
        <VcsFormButton
          variant="filled"
          :disabled="!isValid"
          @click="
            () => {
              $emit('update:modelValue', localLinkButtonOptions);
              $emit('close');
            }
          "
        >
          {{ $t('components.apply') }}
        </VcsFormButton>
      </div>
    </VcsFormSection>
  </v-card>
</template>

<script lang="ts">
  import {
    VcsLabel,
    VcsSelect,
    VcsTextArea,
    VcsTextField,
    ButtonLocation,
    VcsFormSection,
    VcsFormButton,
  } from '@vcmap/ui';
  import { computed, defineComponent, onMounted, ref, toRaw } from 'vue';
  import type { PropType } from 'vue';
  import {
    VCol,
    VContainer,
    VRow,
    VCard,
    VDivider,
    VForm,
  } from 'vuetify/components';
  import type { LinkButton } from './defaultOptions.js';

  export default defineComponent({
    name: 'ButtonEditor',
    title: 'Button Editor',
    components: {
      VcsLabel,
      VcsSelect,
      VcsTextArea,
      VcsTextField,
      VContainer,
      VRow,
      VCol,
      VCard,
      VcsFormSection,
      VDivider,
      VcsFormButton,
      VForm,
    },
    props: {
      modelValue: {
        type: Object as PropType<Required<LinkButton>>,
        required: true,
      },
    },
    emits: ['update:modelValue', 'close'],
    setup(props, { emit }) {
      const availableButtonLocations = [
        {
          value: ButtonLocation.TOOL,
          title: 'TOOL',
        },
        {
          value: ButtonLocation.MENU,
          title: 'MENU',
        },
      ];
      const validationForm = ref<HTMLFormElement>();

      const localLinkButtonOptions = ref(
        structuredClone(toRaw(props.modelValue)),
      );

      onMounted(() => {
        validationForm.value?.validate();
      });

      return {
        epsg: computed({
          get(): string | number | undefined {
            return localLinkButtonOptions.value.projection?.epsg;
          },
          set(value: string | undefined | number) {
            if (localLinkButtonOptions.value.projection) {
              localLinkButtonOptions.value.projection.epsg = value;
            } else {
              localLinkButtonOptions.value.projection = { epsg: value };
            }
          },
        }),
        proj4: computed({
          get(): string | undefined {
            return localLinkButtonOptions.value.projection?.proj4;
          },
          set(value: string | undefined) {
            if (localLinkButtonOptions.value.projection) {
              localLinkButtonOptions.value.projection.proj4 = value;
            } else {
              localLinkButtonOptions.value.projection = { proj4: value };
            }
          },
        }),
        availableButtonLocations,
        headerActions: [
          {
            name: 'components.close',
            title: 'components.close',
            icon: 'mdi-close-thick',
            callback(): void {
              emit('close');
            },
          },
        ],
        requiredRule: (v: string | undefined): boolean | string =>
          !!v || 'components.validation.required',
        isValid: ref(true),
        validationForm,
        localLinkButtonOptions,
      };
    },
  });
</script>
