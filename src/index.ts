import type {
  VcsPlugin,
  VcsUiApp,
  PluginConfigEditor,
  VcsAction,
  DeviceOptions,
} from '@vcmap/ui';
import { getLogger } from '@vcsuite/logger';
import { name, version, mapVersion } from '../package.json';
import type { LinkButton, LinkButtonConfig } from './defaultOptions.js';
import getDefaultOptions from './defaultOptions.js';
import { createUrl, openUrl } from './urlHelper.js';
import LinkButtonConfigEditor from './LinkButtonConfigEditor.vue';

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
  let app: VcsUiApp;

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
      app = vcsUiApp;

      config.buttons?.forEach((button) => {
        // cast because missing values were filled with defaults
        const buttonConfig = button as Required<LinkButton>;

        if (vcsUiApp.navbarManager.has(buttonConfig.title)) {
          getLogger('@vcmap/link-button').warning(
            `button with name "${buttonConfig.title}" is already added to the navbarManager`,
          );
        } else {
          let { icon } = buttonConfig;
          const containsDotOrColon = /:|\./;

          if (containsDotOrColon.test(buttonConfig.icon)) {
            icon = `imageUrl:${icon}`;
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
            { id: action.name, action },
            name,
            buttonConfig.buttonLocation,
            buttonConfig.visibility,
          );
        }
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
        if (button.visibility) {
          const keys = (
            Object.keys(button.visibility) as (keyof DeviceOptions)[]
          ).filter(
            (k) => button.visibility![k] !== defaultOptions.visibility[k],
          );
          if (keys.length) {
            configOptions.visibility = Object.fromEntries(
              keys.map((k) => [k, button.visibility![k]]),
            ) as DeviceOptions;
          }
        }
        return configOptions;
      });
      return { buttons };
    },
    /**
     * components for configuring the plugin and/ or custom items defined by the plugin
     */
    getConfigEditors(): PluginConfigEditor<LinkButtonConfig>[] {
      return [
        {
          component: LinkButtonConfigEditor,
          title: 'linkButton.editor.editorTitle',
          infoUrlCallback: app.getHelpUrlCallback(
            '/components/plugins/linkButtonConfig.html',
            'app-configurator',
          ),
        },
      ];
    },
    destroy(): void {
      delete app.vuetify.icons.sets.linkButton;
    },
    i18n: {
      en: {
        linkButton: {
          warning: {
            buttonExistsAlready:
              'A button with this title has already been added',
          },
          editor: {
            editorTitle: 'LinkButton Editor',
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
            infoMissing: 'Required configuration missing',
            titleMissing: 'Button title is missing',
            visibility: 'Visibility',
            mobile: 'Mobile',
            tablet: 'Tablet',
            desktop: 'Desktop',
          },
        },
      },
      de: {
        linkButton: {
          warning: {
            buttonExistsAlready:
              'Ein Button mit diesem Titel wurde bereits hinzugefügt',
          },
          editor: {
            editorTitle: 'LinkButton Editor',
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
            infoMissing: 'Erforderliche Konfiguration fehlt',
            titleMissing: 'Button Titel fehlt',
            visibility: 'Sichtbarkeit',
            mobile: 'Handy',
            tablet: 'Tablet',
            desktop: 'Desktop',
          },
        },
      },
    },
  };
}
