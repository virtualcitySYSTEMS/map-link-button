<template>
  <v-card>
    <VcsFormSection
      heading="linkButton.editor.buttonEditor"
      :header-actions="headerActions"
    >
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
              rows="2"
              :placeholder="'https://new.virtualcitymap.de/?state=[[[\u007B\u007BcameraPosition\u007D\u007D],[\u007B\u007BgroundPosition\u007D\u007D],\u007B\u007Bdistance\u007D\u007D,\u007B\u007Bheading\u007D\u007D,\u007B\u007Bpitch\u007D\u007D,\u007B\u007Broll\u007D\u007D],\u0022;cesium\u0022,[\u0022VC Map Demo\u0022]]'"
              v-model="templateUrl"
              :rules="[requiredRule]"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="6">
            <VcsLabel html-for="link-button-title">
              {{ $t('linkButton.editor.title') }}
            </VcsLabel>
          </v-col>
          <v-col cols="6">
            <VcsTextField
              id="link-button-title"
              :placeholder="$t('linkButton.editor.titlePlaceholder')"
              v-model="title"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="6">
            <VcsLabel html-for="link-button-icon">
              {{ $t('linkButton.editor.icon') }}
            </VcsLabel>
          </v-col>
          <v-col cols="6">
            <VcsTextField
              id="link-button-icon"
              :placeholder="$t('linkButton.editor.iconPlaceholder')"
              v-model="icon"
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
              :items="availableButtonLocations"
              v-model="buttonLocation"
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
              :placeholder="$t('linkButton.editor.epsgPlaceholder')"
              v-model="epsg"
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="justify-end">
          <v-col cols="6">
            <VcsTextField
              id="link-button-proj4"
              :placeholder="$t('linkButton.editor.proj4Placeholder')"
              v-model="proj4"
            />
          </v-col>
        </v-row>
      </v-container>
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
  } from '@vcmap/ui';
  import { computed, defineComponent } from 'vue';
  import type { PropType } from 'vue';
  import { VCol, VContainer, VRow, VCard } from 'vuetify/lib';
  import { LinkButton } from './defaultOptions.js';

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
    },
    props: {
      value: {
        type: Object as PropType<Required<LinkButton>>,
        required: true,
      },
    },
    setup(props, { emit }) {
      const availableButtonLocations = [
        {
          value: ButtonLocation.TOOL,
          text: 'TOOL',
        },
        {
          value: ButtonLocation.MENU,
          text: 'MENU',
        },
      ];

      return {
        buttonLocation: computed({
          get(): ButtonLocation {
            return props.value.buttonLocation;
          },
          set(value: ButtonLocation) {
            const options = structuredClone(props.value);
            emit('input', { ...options, buttonLocation: value });
          },
        }),
        templateUrl: computed({
          get(): string {
            return props.value.templateUrl;
          },
          set(value: string) {
            const options = structuredClone(props.value);
            emit('input', { ...options, templateUrl: value });
          },
        }),
        title: computed({
          get(): string {
            return props.value.title;
          },
          set(value: string) {
            const options = structuredClone(props.value);
            emit('input', { ...options, title: value });
          },
        }),
        icon: computed({
          get(): string {
            return props.value.icon;
          },
          set(value: string) {
            const options = structuredClone(props.value);
            emit('input', { ...options, icon: value });
          },
        }),
        epsg: computed({
          get(): string | number | undefined {
            return props.value.projection?.epsg;
          },
          set(value: string | undefined | number) {
            if (props.value.projection) {
              const options = structuredClone(props.value);
              options.projection.epsg = value;
              emit('input', options);
            }
          },
        }),
        proj4: computed({
          get(): string | undefined {
            return props.value.projection?.proj4;
          },
          set(value: string | undefined) {
            if (props.value.projection) {
              const options = structuredClone(props.value);
              options.projection.proj4 = value;
              emit('input', options);
            }
          },
        }),
        availableButtonLocations,
        headerActions: [
          {
            name: 'linkButton.editor.close',
            title: 'linkButton.editor.close',
            icon: 'mdi-close-thick',
            callback(): void {
              emit('close');
            },
          },
        ],
        requiredRule: (v: string | undefined): boolean | string =>
          !!v || 'components.validation.required',
      };
    },
  });
</script>
