import {
  VcsPlugin,
  VcsUiApp,
  PluginConfigEditor,
  VcsAction,
  vuetify,
  ButtonLocation,
} from '@vcmap/ui';
import { Component } from 'vue';
import { name, version, mapVersion } from '../package.json';
import getDefaultOptions, {
  LinkButton,
  LinkButtonConfig,
} from './defaultOptions.js';
import { createUrl, openUrl } from './urlHelper.js';
import LinkButtonConfigEditor from './LinkButtonConfigEditor.vue';
import CustomIcon from './CustomIcon.vue';

type PluginState = Record<never, never>;

type LinkButtonPlugin = VcsPlugin<LinkButtonConfig, PluginState>;

export default function linkButton(
  options: LinkButtonConfig,
): LinkButtonPlugin {
  const defaultOptions = getDefaultOptions();
  const config: LinkButtonConfig = {
    buttons: options.buttons
      ?.filter((buttonOptions) => !!buttonOptions.templateUrl)
      .map((buttonOptions) => {
        return { ...structuredClone(defaultOptions), ...buttonOptions };
      }),
  };

  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    initialize(vcsUiApp: VcsUiApp): Promise<void> {
      config.buttons?.forEach((button, index) => {
        // cast because missing values were filled with defaults
        const buttonConfig = button as Required<LinkButton>;
        let { icon } = buttonConfig;
        const containsDotOrColon = /:|\./;

        if (containsDotOrColon.test(buttonConfig.icon)) {
          vuetify.framework.icons.values[`${name}${index}`] = {
            component: CustomIcon,
            props: {
              icon: buttonConfig.icon,
              maxSize:
                buttonConfig.buttonLocation === ButtonLocation.MENU
                  ? '16px'
                  : '20px',
            },
          };
          icon = `$${name}${index}`;
        }

        const action: VcsAction = {
          name: buttonConfig.title,
          title: buttonConfig.title,
          icon,
          active: false,
          async callback() {
            const compoundUrl = await createUrl(
              vcsUiApp,
              buttonConfig.templateUrl,
              buttonConfig.projection,
            );
            openUrl(compoundUrl);
          },
        };

        vcsUiApp.navbarManager.add(
          {
            id: buttonConfig.title,
            action,
          },
          name,
          buttonConfig.buttonLocation,
        );
      });

      return Promise.resolve();
    },
    /**
     * should return all default values of the configuration
     */
    getDefaultOptions(): LinkButtonConfig {
      return {
        buttons: [getDefaultOptions()],
      };
    },
    /**
     * should return the plugin's serialization excluding all default values
     */
    toJSON(): LinkButtonConfig {
      const buttons = config.buttons?.map((button) => {
        const configOptions: LinkButton = {
          templateUrl: button.templateUrl,
        };
        if (button.buttonLocation !== defaultOptions.buttonLocation) {
          configOptions.buttonLocation = button.buttonLocation;
        }
        if (button.title !== defaultOptions.title) {
          configOptions.title = button.title;
        }
        if (button.icon !== defaultOptions.icon) {
          configOptions.icon = button.icon;
        }
        if (button.projection) {
          configOptions.projection = button.projection;
        }
        return configOptions;
      });
      return { buttons };
    },
    /**
     * components for configuring the plugin and/ or custom items defined by the plugin
     */
    getConfigEditors(): PluginConfigEditor[] {
      return [
        { component: LinkButtonConfigEditor as Component & { title: string } },
      ];
    },
    destroy(): void {
      config.buttons?.forEach((button, index) => {
        const containsDotOrColon = /:|\./;
        if (button.icon && containsDotOrColon.test(button.icon)) {
          delete vuetify.framework.icons.values[`${name}${index}`];
        }
      });
    },
    i18n: {
      en: {
        linkButton: {
          editor: {
            templateUrl: 'Template URL',
            title: 'Title',
            titlePlaceholder: 'Title and tooltip of button',
            icon: 'Icon',
            iconPlaceholder: '$vcsExternalLink',
            buttonLocation: 'Button location',
            projection: 'Projection',
            epsgPlaceholder: 'EPSG:4326',
            proj4Placeholder: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
            buttons: 'Buttons',
            buttonEditor: 'Button Editor',
          },
        },
      },
      de: {
        linkButton: {
          editor: {
            templateUrl: 'Template URL',
            title: 'Titel',
            titlePlaceholder: 'Titel und Tooltip des Buttons',
            icon: 'Icon',
            iconPlaceholder: '$vcsExternalLink',
            buttonLocation: 'Button Position',
            projection: 'Projektion',
            epsgPlaceholder: 'EPSG:4326',
            proj4Placeholder: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
            buttons: 'Buttons',
            buttonEditor: 'Button Editor',
          },
        },
      },
    },
  };
}
