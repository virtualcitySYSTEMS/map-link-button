import { ProjectionOptions } from '@vcmap/core';
import { ButtonLocation } from '@vcmap/ui';

export type LinkButton = {
  buttonLocation?: ButtonLocation;
  templateUrl: string;
  title?: string;
  icon?: string;
  projection?: ProjectionOptions;
};

export type LinkButtonConfig = {
  buttons?: LinkButton[];
};

export default function getDefaultOptions(): Required<LinkButton> {
  return {
    buttonLocation: ButtonLocation.TOOL,
    templateUrl: '',
    title: 'Open external link',
    icon: '$vcsExternalLink',
    projection: {},
  };
}
