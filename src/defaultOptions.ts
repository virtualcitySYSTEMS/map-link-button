import type { ProjectionOptions } from '@vcmap/core';
import type { DeviceOptions } from '@vcmap/ui';
import { ButtonLocation } from '@vcmap/ui';

export type LinkButton = {
  buttonLocation?: ButtonLocation;
  templateUrl: string;
  title?: string;
  icon?: string;
  projection?: ProjectionOptions;
  visibility?: DeviceOptions;
};

export type LinkButtonConfig = { buttons?: LinkButton[] };

export default function getDefaultOptions(): Required<LinkButton> {
  return {
    buttonLocation: ButtonLocation.TOOL,
    templateUrl: '',
    title: '',
    icon: '$vcsExternalLink',
    projection: {},
    visibility: { mobile: true, tablet: true, desktop: true },
  };
}
